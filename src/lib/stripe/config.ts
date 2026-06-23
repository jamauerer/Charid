import type { PaidPlan } from "@/types/billing";

export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY?.trim() &&
      process.env.STRIPE_PRICE_BASIC?.trim() &&
      process.env.STRIPE_PRICE_PRO?.trim()
  );
}

export function getStripePriceId(plan: PaidPlan): string | null {
  const priceId =
    plan === "basic"
      ? process.env.STRIPE_PRICE_BASIC?.trim()
      : process.env.STRIPE_PRICE_PRO?.trim();
  return priceId || null;
}

export function planFromStripePriceId(priceId: string): PaidPlan | "free" {
  const basic = process.env.STRIPE_PRICE_BASIC?.trim();
  const pro = process.env.STRIPE_PRICE_PRO?.trim();

  if (priceId === basic) return "basic";
  if (priceId === pro) return "pro";
  return "free";
}

export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}
