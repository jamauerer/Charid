export const SUBSCRIPTION_PLANS = ["free", "basic", "pro"] as const;
export type SubscriptionPlan = (typeof SUBSCRIPTION_PLANS)[number];

export const PAID_PLANS = ["basic", "pro"] as const;
export type PaidPlan = (typeof PAID_PLANS)[number];

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "paused";

export type StripeCustomerRow = {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  created_at: string;
  updated_at: string;
};

export type SubscriptionRow = {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  plan: SubscriptionPlan;
  status: string;
  cancel_at_period_end: boolean;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
};

export type BillingSummary = {
  plan: SubscriptionPlan;
  status: string | null;
  isExempt: boolean;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  hasStripeCustomer: boolean;
  stripeConfigured: boolean;
};

export const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  free: "Free",
  basic: "Basic",
  pro: "Pro",
};
