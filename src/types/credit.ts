import type { SubscriptionPlan } from "@/types/billing";

export const CREDIT_LEDGER_REASONS = [
  "monthly_allocation",
  "manual_adjustment",
  "ai_usage",
  "founder_grant",
] as const;

export type CreditLedgerReason = (typeof CREDIT_LEDGER_REASONS)[number];

export const CREDIT_LEDGER_REASON_LABELS: Record<CreditLedgerReason, string> = {
  monthly_allocation: "Monthly allocation",
  manual_adjustment: "Manual adjustment",
  founder_grant: "Founder grant",
  ai_usage: "AI usage",
};

/** Target monthly credits by subscription plan (allocation automation deferred). */
export const PLAN_MONTHLY_CREDITS: Record<SubscriptionPlan, number> = {
  free: 0,
  basic: 500,
  pro: 1500,
};

export type CreditAccountRow = {
  user_id: string;
  current_balance: number;
  lifetime_granted: number;
  lifetime_used: number;
  created_at: string;
  updated_at: string;
};

export type CreditLedgerRow = {
  id: string;
  user_id: string;
  delta: number;
  reason: CreditLedgerReason;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type CreditSummary = {
  unlimited: boolean;
  currentBalance: number;
  lifetimeGranted: number;
  lifetimeUsed: number;
  plan: SubscriptionPlan;
  /** Plan target — not auto-granted until allocation job ships. */
  monthlyAllocation: number;
};

export type AvailableCredits = {
  unlimited: boolean;
  balance: number;
};

/** Credits consumed per AI action (deduction wired at server actions). */
export const AI_CREDIT_COSTS = {
  scene_suggestion: 1,
  regenerate_scene_suggestion: 1,
} as const;

export type AiCreditAction = keyof typeof AI_CREDIT_COSTS;

export type CreditAllocationRow = {
  id: string;
  user_id: string;
  plan: Extract<SubscriptionPlan, "basic" | "pro">;
  billing_period_start: string;
  billing_period_end: string | null;
  credits_granted: number;
  created_at: string;
};
