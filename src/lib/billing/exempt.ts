import { getCurrentProfileRole } from "@/lib/founder-auth";
import {
  getAvailableCredits,
  getProfileRoleForUser,
} from "@/lib/billing/get-available-credits";
import { getSubscriptionPlanForUser } from "@/lib/billing/plan";
import { isFounderExempt } from "@/lib/billing/isFounderExempt";

// Founder/admin accounts bypass billing and credit enforcement.
// Used for internal testing and platform administration.

export async function isCurrentUserFounderExempt(): Promise<boolean> {
  return isFounderExempt(await getCurrentProfileRole());
}

/** Billing UI and Stripe checkout — founders skip subscription requirements. */
export async function isBillingExempt(): Promise<boolean> {
  return isCurrentUserFounderExempt();
}

/**
 * Gate for AI actions — founders bypass; Free denied; Basic/Pro need credits > 0.
 */
export async function enforceAiBillingGate(
  userId: string
): Promise<{ error?: string }> {
  if (isFounderExempt(await getProfileRoleForUser(userId))) {
    return {};
  }

  const plan = await getSubscriptionPlanForUser(userId);
  if (plan === "free") {
    return {
      error:
        "AI features require a Basic or Pro subscription. Upgrade in Settings → Billing.",
    };
  }

  const available = await getAvailableCredits(userId);
  if (available.unlimited) {
    return {};
  }

  if (available.balance <= 0) {
    return {
      error: "You have no credits remaining.",
    };
  }

  return {};
}
