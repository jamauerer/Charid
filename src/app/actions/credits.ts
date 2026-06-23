"use server";

import { isFounderAdmin } from "@/lib/founder-auth";
import { applyCreditDelta } from "@/lib/billing/apply-credit-delta";
import {
  getAvailableCredits,
  getProfileRoleForUser,
} from "@/lib/billing/get-available-credits";
import { isFounderExempt } from "@/lib/billing/isFounderExempt";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBillingSummary } from "@/app/actions/billing";
import type { SubscriptionPlan } from "@/types/billing";
import type {
  CreditAccountRow,
  CreditLedgerReason,
  CreditLedgerRow,
  CreditSummary,
} from "@/types/credit";
import {
  CREDIT_LEDGER_REASONS,
  PLAN_MONTHLY_CREDITS,
} from "@/types/credit";

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

function normalizeLedgerRow(row: CreditLedgerRow): CreditLedgerRow {
  return {
    ...row,
    metadata:
      row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {},
  };
}

export async function getCreditSummary(): Promise<{
  summary: CreditSummary | null;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { summary: null, error: "You must be logged in." };
  }

  const { summary: billingSummary, error: billingError } =
    await getBillingSummary();
  if (billingError && !billingSummary) {
    return { summary: null, error: billingError };
  }

  const plan: SubscriptionPlan = billingSummary?.isExempt
    ? "pro"
    : (billingSummary?.plan ?? "free");
  const monthlyAllocation = PLAN_MONTHLY_CREDITS[plan];

  const available = await getAvailableCredits(user.id);
  if (available.unlimited) {
    return {
      summary: {
        unlimited: true,
        currentBalance: 0,
        lifetimeGranted: 0,
        lifetimeUsed: 0,
        plan,
        monthlyAllocation,
      },
    };
  }

  const { data: account, error: accountError } = await supabase
    .from("credit_accounts")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (accountError) {
    return {
      summary: null,
      error: formatCreditError(accountError.message, accountError.code),
    };
  }

  const row = account as CreditAccountRow | null;

  return {
    summary: {
      unlimited: false,
      currentBalance: row?.current_balance ?? 0,
      lifetimeGranted: row?.lifetime_granted ?? 0,
      lifetimeUsed: row?.lifetime_used ?? 0,
      plan,
      monthlyAllocation,
    },
  };
}

export async function consumeCredits(
  userId: string,
  amount: number,
  reason: CreditLedgerReason = "ai_usage",
  metadata: Record<string, unknown> = {}
): Promise<{ success: boolean; error?: string }> {
  if (isFounderExempt(await getProfileRoleForUser(userId))) {
    return { success: true };
  }

  if (!Number.isInteger(amount) || amount <= 0) {
    return { success: false, error: "Amount must be a positive integer." };
  }

  if (reason !== "ai_usage") {
    return {
      success: false,
      error: "consumeCredits only supports ai_usage.",
    };
  }

  return applyCreditDelta(userId, -amount, reason, metadata);
}

export async function grantCredits(
  userId: string,
  amount: number,
  reason: CreditLedgerReason,
  metadata: Record<string, unknown> = {}
): Promise<{ success: boolean; error?: string }> {
  if (!(await isFounderAdmin())) {
    return { success: false, error: "Only founders can grant credits." };
  }

  if (!CREDIT_LEDGER_REASONS.includes(reason)) {
    return { success: false, error: "Invalid credit ledger reason." };
  }

  if (!Number.isInteger(amount) || amount === 0) {
    return { success: false, error: "Amount must be a non-zero integer." };
  }

  return applyCreditDelta(userId, amount, reason, metadata);
}

export async function getCreditLedger(
  userId: string,
  limit = 50
): Promise<{ entries: CreditLedgerRow[]; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { entries: [], error: "You must be logged in." };
  }

  const isAdmin = await isFounderAdmin();
  if (user.id !== userId && !isAdmin) {
    return { entries: [], error: "You can only view your own credit ledger." };
  }

  const client =
    user.id === userId ? supabase : createAdminClient();

  const cappedLimit = Math.min(Math.max(limit, 1), 200);

  const { data, error } = await client
    .from("credit_ledger")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(cappedLimit);

  if (error) {
    return {
      entries: [],
      error: formatCreditError(error.message, error.code),
    };
  }

  return {
    entries: (data ?? []).map((row) =>
      normalizeLedgerRow(row as CreditLedgerRow)
    ),
  };
}
