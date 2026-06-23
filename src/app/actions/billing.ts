"use server";

import { redirect } from "next/navigation";
import { isBillingExempt } from "@/lib/billing/exempt";
import { createClient } from "@/lib/supabase/server";
import {
  getSiteUrl,
  getStripePriceId,
  isStripeConfigured,
} from "@/lib/stripe/config";
import { getStripe } from "@/lib/stripe/server";
import { upsertStripeCustomerLink } from "@/lib/stripe/sync-subscription";
import type {
  BillingSummary,
  PaidPlan,
  SubscriptionPlan,
  SubscriptionRow,
} from "@/types/billing";
import { PLAN_LABELS } from "@/types/billing";

function formatBillingError(message: string, code?: string): string {
  if (
    code === "PGRST205" ||
    message.includes("schema cache") ||
    message.includes("Could not find")
  ) {
    return (
      "Billing is not available yet. Run supabase/migrations/20250708000000_stripe_billing.sql " +
      "and supabase/fix-stripe-billing-api.sql in the Supabase SQL Editor."
    );
  }
  return message;
}

function activePaidPlan(row: SubscriptionRow | null): SubscriptionPlan {
  if (!row) return "free";
  if (row.status !== "active" && row.status !== "trialing") {
    return "free";
  }
  return row.plan === "basic" || row.plan === "pro" ? row.plan : "free";
}

export async function getBillingSummary(): Promise<{
  summary: BillingSummary;
  error?: string;
}> {
  const stripeConfigured = isStripeConfigured();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      summary: {
        plan: "free",
        status: null,
        isExempt: false,
        cancelAtPeriodEnd: false,
        currentPeriodEnd: null,
        hasStripeCustomer: false,
        stripeConfigured,
      },
      error: "You must be logged in.",
    };
  }

  const isExempt = await isBillingExempt();

  if (isExempt) {
    return {
      summary: {
        plan: "pro",
        status: "admin_exempt",
        isExempt: true,
        cancelAtPeriodEnd: false,
        currentPeriodEnd: null,
        hasStripeCustomer: false,
        stripeConfigured,
      },
    };
  }

  const [{ data: customerRow }, { data: subscriptionRow, error: subError }] =
    await Promise.all([
      supabase
        .from("stripe_customers")
        .select("stripe_customer_id")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle(),
    ]);

  if (subError) {
    return {
      summary: {
        plan: "free",
        status: null,
        isExempt: false,
        cancelAtPeriodEnd: false,
        currentPeriodEnd: null,
        hasStripeCustomer: Boolean(customerRow),
        stripeConfigured,
      },
      error: formatBillingError(subError.message, subError.code),
    };
  }

  const subscription = subscriptionRow as SubscriptionRow | null;
  const plan = activePaidPlan(subscription);

  return {
    summary: {
      plan,
      status: subscription?.status ?? null,
      isExempt: false,
      cancelAtPeriodEnd: subscription?.cancel_at_period_end ?? false,
      currentPeriodEnd: subscription?.current_period_end ?? null,
      hasStripeCustomer: Boolean(customerRow?.stripe_customer_id),
      stripeConfigured,
    },
  };
}

async function getOrCreateStripeCustomerId(
  userId: string,
  email: string | undefined
): Promise<string> {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("stripe_customers")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing?.stripe_customer_id) {
    return existing.stripe_customer_id;
  }

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: email ?? undefined,
    metadata: { user_id: userId },
  });

  await upsertStripeCustomerLink(userId, customer.id);
  return customer.id;
}

export async function createCheckoutSession(plan: PaidPlan): Promise<never> {
  if (!isStripeConfigured()) {
    throw new Error("Stripe is not configured.");
  }

  if (await isBillingExempt()) {
    throw new Error("Admin accounts do not require a subscription.");
  }

  const priceId = getStripePriceId(plan);
  if (!priceId) {
    throw new Error(`Stripe price ID for ${PLAN_LABELS[plan]} is not configured.`);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const customerId = await getOrCreateStripeCustomerId(user.id, user.email);
  const stripe = getStripe();
  const siteUrl = getSiteUrl();

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/dashboard/settings?billing=success`,
    cancel_url: `${siteUrl}/dashboard/settings?billing=canceled`,
    metadata: { user_id: user.id, plan },
    subscription_data: {
      metadata: { user_id: user.id, plan },
    },
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL.");
  }

  redirect(session.url);
}

export async function createPortalSession(): Promise<never> {
  if (!isStripeConfigured()) {
    throw new Error("Stripe is not configured.");
  }

  if (await isBillingExempt()) {
    throw new Error("Admin accounts do not require a subscription.");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const { data: customerRow } = await supabase
    .from("stripe_customers")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!customerRow?.stripe_customer_id) {
    throw new Error("No billing account found. Subscribe to a plan first.");
  }

  const stripe = getStripe();
  const siteUrl = getSiteUrl();

  const session = await stripe.billingPortal.sessions.create({
    customer: customerRow.stripe_customer_id,
    return_url: `${siteUrl}/dashboard/settings`,
  });

  redirect(session.url);
}
