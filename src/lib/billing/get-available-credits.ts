import { createAdminClient } from "@/lib/supabase/admin";
import { isFounderExempt } from "@/lib/billing/isFounderExempt";
import type { AvailableCredits } from "@/types/credit";
import type { ProfileRole } from "@/types/profile";

// Founder/admin accounts bypass billing and credit enforcement.
// Used for internal testing and platform administration.

export async function getProfileRoleForUser(
  userId: string
): Promise<ProfileRole | null> {
  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  const role = profile?.role as ProfileRole | undefined;
  if (role === "admin") return "admin";
  return role === "user" ? "user" : null;
}

/**
 * Returns available credits for a user. Founders/admins are unlimited —
 * never deducted and never blocked by balance checks.
 */
export async function getAvailableCredits(
  userId: string
): Promise<AvailableCredits> {
  const role = await getProfileRoleForUser(userId);
  if (isFounderExempt(role)) {
    return { unlimited: true, balance: 0 };
  }

  const admin = createAdminClient();
  const { data: account } = await admin
    .from("credit_accounts")
    .select("current_balance")
    .eq("user_id", userId)
    .maybeSingle();

  return {
    unlimited: false,
    balance: account?.current_balance ?? 0,
  };
}
