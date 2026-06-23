import { createAdminClient } from "@/lib/supabase/admin";
import type { SubscriptionPlan, SubscriptionRow } from "@/types/billing";

function activePaidPlan(row: SubscriptionRow | null): SubscriptionPlan {
  if (!row) return "free";
  if (row.status !== "active" && row.status !== "trialing") {
    return "free";
  }
  return row.plan === "basic" || row.plan === "pro" ? row.plan : "free";
}

/** Subscription plan from Supabase — does not treat founder admin as exempt. */
export async function getSubscriptionPlanForUser(
  userId: string
): Promise<SubscriptionPlan> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  return activePaidPlan((data as SubscriptionRow | null) ?? null);
}
