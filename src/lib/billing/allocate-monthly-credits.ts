import { applyCreditDelta } from "@/lib/billing/apply-credit-delta";
import { getProfileRoleForUser } from "@/lib/billing/get-available-credits";
import { isFounderExempt } from "@/lib/billing/isFounderExempt";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SubscriptionPlan } from "@/types/billing";
import type { CreditAllocationRow } from "@/types/credit";
import { PLAN_MONTHLY_CREDITS } from "@/types/credit";

export type AllocateMonthlyCreditsResult = {
  allocated: boolean;
  creditsGranted?: number;
  skippedReason?: "founder_exempt" | "free_plan" | "no_credits" | "no_period" | "already_allocated";
  error?: string;
};

/**
 * Grant monthly plan credits for the user's current subscription billing period.
 * Idempotent — safe to call on every subscription.created/updated webhook.
 */
export async function allocateMonthlyCredits(
  userId: string,
  plan: SubscriptionPlan
): Promise<AllocateMonthlyCreditsResult> {
  if (isFounderExempt(await getProfileRoleForUser(userId))) {
    return { allocated: false, skippedReason: "founder_exempt" };
  }

  if (plan !== "basic" && plan !== "pro") {
    return { allocated: false, skippedReason: "free_plan" };
  }

  const creditsGranted = PLAN_MONTHLY_CREDITS[plan];
  if (creditsGranted <= 0) {
    return { allocated: false, skippedReason: "no_credits" };
  }

  const admin = createAdminClient();
  const { data: subscription, error: subError } = await admin
    .from("subscriptions")
    .select("current_period_start, current_period_end")
    .eq("user_id", userId)
    .maybeSingle();

  if (subError) {
    return { allocated: false, error: subError.message };
  }

  const billingPeriodStart = subscription?.current_period_start ?? null;
  const billingPeriodEnd = subscription?.current_period_end ?? null;

  if (!billingPeriodStart) {
    console.warn(
      "[credits] allocateMonthlyCredits: missing billing period for user",
      userId
    );
    return { allocated: false, skippedReason: "no_period" };
  }

  const { data: inserted, error: insertError } = await admin
    .from("credit_allocations")
    .insert({
      user_id: userId,
      plan,
      billing_period_start: billingPeriodStart,
      billing_period_end: billingPeriodEnd,
      credits_granted: creditsGranted,
    })
    .select("id")
    .maybeSingle();

  if (insertError) {
    if (insertError.code === "23505") {
      return { allocated: false, skippedReason: "already_allocated" };
    }
    return { allocated: false, error: insertError.message };
  }

  if (!inserted) {
    return { allocated: false, skippedReason: "already_allocated" };
  }

  const allocationId = (inserted as Pick<CreditAllocationRow, "id">).id;

  const granted = await applyCreditDelta(
    userId,
    creditsGranted,
    "monthly_allocation",
    {
      plan,
      billing_period_start: billingPeriodStart,
      billing_period_end: billingPeriodEnd,
      credit_allocation_id: allocationId,
    }
  );

  if (!granted.success) {
    await admin.from("credit_allocations").delete().eq("id", allocationId);
    return {
      allocated: false,
      error: granted.error ?? "Failed to grant monthly credits.",
    };
  }

  return { allocated: true, creditsGranted };
}
