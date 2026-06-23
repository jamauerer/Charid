"use client";

import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useState, useTransition } from "react";
import {
  createCheckoutSession,
  createPortalSession,
} from "@/app/actions/billing";
import { dsBtnPrimarySm, dsBtnSecondary } from "@/lib/design-system";
import { studioPanel } from "@/lib/visual-identity";
import type { BillingSummary, PaidPlan } from "@/types/billing";
import { PLAN_LABELS } from "@/types/billing";

type SettingsBillingPanelProps = {
  summary: BillingSummary;
  error?: string;
  billingNotice?: "success" | "canceled" | null;
};

function formatPeriodEnd(iso: string | null): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

export function SettingsBillingPanel({
  summary,
  error,
  billingNotice,
}: SettingsBillingPanelProps) {
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingPlan, setPendingPlan] = useState<PaidPlan | "portal" | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  const periodEndLabel = formatPeriodEnd(summary.currentPeriodEnd);
  const displayPlan = summary.isExempt ? "Admin (exempt)" : PLAN_LABELS[summary.plan];

  function runCheckout(plan: PaidPlan) {
    setActionError(null);
    setPendingPlan(plan);
    startTransition(async () => {
      try {
        await createCheckoutSession(plan);
      } catch (err) {
        if (isRedirectError(err)) throw err;
        setActionError(
          err instanceof Error ? err.message : "Could not start checkout."
        );
        setPendingPlan(null);
      }
    });
  }

  function runPortal() {
    setActionError(null);
    setPendingPlan("portal");
    startTransition(async () => {
      try {
        await createPortalSession();
      } catch (err) {
        if (isRedirectError(err)) throw err;
        setActionError(
          err instanceof Error ? err.message : "Could not open billing portal."
        );
        setPendingPlan(null);
      }
    });
  }

  const showUpgradeBasic =
    !summary.isExempt && summary.plan !== "basic" && summary.plan !== "pro";
  const showUpgradePro =
    !summary.isExempt && summary.plan !== "pro";
  const showManage =
    !summary.isExempt &&
    summary.hasStripeCustomer &&
    (summary.plan === "basic" || summary.plan === "pro");

  return (
    <section className={studioPanel}>
      <h2 className="text-sm font-medium text-[var(--foreground)]">Billing</h2>
      <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
        Subscription plan and Stripe customer portal.
      </p>

      {billingNotice === "success" && (
        <p className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
          Subscription updated. Your plan may take a moment to sync.
        </p>
      )}

      {billingNotice === "canceled" && (
        <p className="mt-3 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-xs text-[var(--brand-text-secondary)]">
          Checkout canceled — no changes were made.
        </p>
      )}

      {(error || actionError) && (
        <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {actionError ?? error}
        </p>
      )}

      {!summary.stripeConfigured && !summary.isExempt && (
        <p className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
          Stripe is not configured. Add STRIPE_SECRET_KEY, STRIPE_PRICE_BASIC,
          and STRIPE_PRICE_PRO to enable checkout.
        </p>
      )}

      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-[var(--brand-text-secondary)]">Current plan</dt>
          <dd className="font-medium text-[var(--foreground)]">{displayPlan}</dd>
        </div>
        {summary.status && !summary.isExempt && (
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-[var(--brand-text-secondary)]">Status</dt>
            <dd className="capitalize text-[var(--foreground)]">
              {summary.status.replace(/_/g, " ")}
            </dd>
          </div>
        )}
        {periodEndLabel && !summary.isExempt && (
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-[var(--brand-text-secondary)]">
              {summary.cancelAtPeriodEnd ? "Access until" : "Renews on"}
            </dt>
            <dd className="text-[var(--foreground)]">{periodEndLabel}</dd>
          </div>
        )}
      </dl>

      {summary.isExempt ? (
        <p className="mt-4 text-xs text-[var(--brand-text-secondary)]">
          Admin accounts have full access without a subscription.
        </p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {showUpgradeBasic && (
            <button
              type="button"
              disabled={!summary.stripeConfigured || isPending}
              onClick={() => runCheckout("basic")}
              className={dsBtnSecondary}
            >
              {isPending && pendingPlan === "basic"
                ? "Redirecting…"
                : "Upgrade to Basic"}
            </button>
          )}
          {showUpgradePro && (
            <button
              type="button"
              disabled={!summary.stripeConfigured || isPending}
              onClick={() => runCheckout("pro")}
              className={dsBtnPrimarySm}
            >
              {isPending && pendingPlan === "pro"
                ? "Redirecting…"
                : "Upgrade to Pro"}
            </button>
          )}
          {showManage && (
            <button
              type="button"
              disabled={!summary.stripeConfigured || isPending}
              onClick={runPortal}
              className={dsBtnSecondary}
            >
              {isPending && pendingPlan === "portal"
                ? "Opening…"
                : "Manage Subscription"}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
