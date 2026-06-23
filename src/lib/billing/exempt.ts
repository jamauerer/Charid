import { isFounderAdmin } from "@/lib/founder-auth";

/** Admin accounts bypass all billing checks (no subscription required). */
export async function isBillingExempt(): Promise<boolean> {
  return isFounderAdmin();
}
