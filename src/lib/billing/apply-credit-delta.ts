import { createAdminClient } from "@/lib/supabase/admin";
import type {
  CreditAccountRow,
  CreditLedgerReason,
} from "@/types/credit";
import { CREDIT_LEDGER_REASONS } from "@/types/credit";

function formatCreditError(message: string, code?: string): string {
  if (
    code === "PGRST205" ||
    message.includes("schema cache") ||
    message.includes("Could not find")
  ) {
    return (
      "Credit ledger is not available yet. Run supabase/migrations/20250709000000_credit_ledger.sql " +
      "and supabase/fix-credit-ledger-api.sql in the Supabase SQL Editor."
    );
  }
  return message;
}

/** Core credit mutation — used by grantCredits, consumeCredits, and monthly allocation. */
export async function applyCreditDelta(
  userId: string,
  amount: number,
  reason: CreditLedgerReason,
  metadata: Record<string, unknown> = {}
): Promise<{ success: boolean; error?: string }> {
  if (!CREDIT_LEDGER_REASONS.includes(reason)) {
    return { success: false, error: "Invalid credit ledger reason." };
  }

  if (!Number.isInteger(amount) || amount === 0) {
    return { success: false, error: "Amount must be a non-zero integer." };
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();

  const { data: existing } = await admin
    .from("credit_accounts")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const account = existing as CreditAccountRow | null;
  const nextBalance = (account?.current_balance ?? 0) + amount;

  if (nextBalance < 0) {
    return {
      success: false,
      error: "Insufficient credits.",
    };
  }

  const grantedDelta = amount > 0 ? amount : 0;
  const usedDelta = amount < 0 ? Math.abs(amount) : 0;

  const { error: ledgerError } = await admin.from("credit_ledger").insert({
    user_id: userId,
    delta: amount,
    reason,
    metadata,
  });

  if (ledgerError) {
    return {
      success: false,
      error: formatCreditError(ledgerError.message, ledgerError.code),
    };
  }

  if (account) {
    const { error: updateError } = await admin
      .from("credit_accounts")
      .update({
        current_balance: nextBalance,
        lifetime_granted: account.lifetime_granted + grantedDelta,
        lifetime_used: account.lifetime_used + usedDelta,
        updated_at: now,
      })
      .eq("user_id", userId);

    if (updateError) {
      return {
        success: false,
        error: formatCreditError(updateError.message, updateError.code),
      };
    }
  } else if (amount > 0) {
    const { error: insertError } = await admin.from("credit_accounts").insert({
      user_id: userId,
      current_balance: nextBalance,
      lifetime_granted: grantedDelta,
      lifetime_used: usedDelta,
      updated_at: now,
    });

    if (insertError) {
      return {
        success: false,
        error: formatCreditError(insertError.message, insertError.code),
      };
    }
  } else {
    return { success: false, error: "Insufficient credits." };
  }

  return { success: true };
}
