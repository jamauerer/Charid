import type Stripe from "stripe";
import { allocateMonthlyCredits } from "@/lib/billing/allocate-monthly-credits";
import { createAdminClient } from "@/lib/supabase/admin";
import { planFromStripePriceId } from "@/lib/stripe/config";
import type { SubscriptionPlan } from "@/types/billing";

function resolvePlan(
  priceId: string | undefined,
  status: string
): SubscriptionPlan {
  if (!priceId) return "free";
  if (status === "canceled" || status === "incomplete_expired") {
    return "free";
  }
  const mapped = planFromStripePriceId(priceId);
  return mapped === "free" ? "free" : mapped;
}

function toIso(unixSeconds: number | null | undefined): string | null {
  if (unixSeconds == null) return null;
  return new Date(unixSeconds * 1000).toISOString();
}

/** Stripe Basil (2025-03+) moved period fields to subscription items; legacy top-level fallback kept. */
function getSubscriptionPeriod(subscription: Stripe.Subscription): {
  start: number | null;
  end: number | null;
} {
  const firstItem = subscription.items.data[0] as
    | (Stripe.SubscriptionItem & {
        current_period_start?: number;
        current_period_end?: number;
      })
    | undefined;

  const legacy = subscription as Stripe.Subscription & {
    current_period_start?: number;
    current_period_end?: number;
  };

  return {
    start:
      firstItem?.current_period_start ??
      legacy.current_period_start ??
      null,
    end:
      firstItem?.current_period_end ?? legacy.current_period_end ?? null,
  };
}

export async function resolveUserIdForStripeCustomer(
  stripeCustomerId: string
): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("stripe_customers")
    .select("user_id")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();

  return data?.user_id ?? null;
}

export async function upsertStripeCustomerLink(
  userId: string,
  stripeCustomerId: string
): Promise<void> {
  const admin = createAdminClient();
  const now = new Date().toISOString();

  const { data: existing } = await admin
    .from("stripe_customers")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    const { error } = await admin
      .from("stripe_customers")
      .update({
        stripe_customer_id: stripeCustomerId,
        updated_at: now,
      })
      .eq("user_id", userId);

    if (error) {
      throw new Error(error.message);
    }
    return;
  }

  const { error } = await admin.from("stripe_customers").insert({
    user_id: userId,
    stripe_customer_id: stripeCustomerId,
    updated_at: now,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function syncSubscriptionFromStripe(
  subscription: Stripe.Subscription,
  userIdOverride?: string | null
): Promise<void> {
  const admin = createAdminClient();
  const stripeCustomerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  let userId = userIdOverride ?? null;
  if (!userId) {
    userId = await resolveUserIdForStripeCustomer(stripeCustomerId);
  }

  if (!userId) {
    const metaUserId = subscription.metadata?.user_id?.trim();
    if (metaUserId) {
      userId = metaUserId;
      await upsertStripeCustomerLink(userId, stripeCustomerId);
    }
  }

  if (!userId) {
    console.warn(
      "[stripe] syncSubscription: no user_id for customer",
      stripeCustomerId
    );
    return;
  }

  const priceId = subscription.items.data[0]?.price.id ?? "";
  const plan = resolvePlan(priceId, subscription.status);
  const period = getSubscriptionPeriod(subscription);
  const now = new Date().toISOString();

  const { error } = await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: subscription.id,
      stripe_price_id: priceId,
      plan,
      status: subscription.status,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_start: toIso(period.start),
      current_period_end: toIso(period.end),
      updated_at: now,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    throw new Error(error.message);
  }

  if (
    (subscription.status === "active" || subscription.status === "trialing") &&
    (plan === "basic" || plan === "pro")
  ) {
    const allocation = await allocateMonthlyCredits(userId, plan);
    if (allocation.error) {
      throw new Error(allocation.error);
    }
  }
}

export async function markSubscriptionCanceled(
  stripeSubscriptionId: string
): Promise<void> {
  const admin = createAdminClient();
  const now = new Date().toISOString();

  const { error } = await admin
    .from("subscriptions")
    .update({
      status: "canceled",
      plan: "free",
      cancel_at_period_end: false,
      updated_at: now,
    })
    .eq("stripe_subscription_id", stripeSubscriptionId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function recordBillingEvent(
  stripeEventId: string,
  eventType: string,
  payload: unknown
): Promise<boolean> {
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("billing_events")
    .select("id")
    .eq("stripe_event_id", stripeEventId)
    .maybeSingle();

  if (existing) {
    return false;
  }

  const { error } = await admin.from("billing_events").insert({
    stripe_event_id: stripeEventId,
    event_type: eventType,
    payload: payload as Record<string, unknown>,
  });

  if (error) {
    if (error.code === "23505") {
      return false;
    }
    throw new Error(error.message);
  }

  return true;
}
