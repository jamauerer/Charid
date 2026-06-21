"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ModerationQueueEntry } from "@/app/actions/moderation-admin";
import {
  approveModerationItem,
  escalateModerationItem,
  removeModerationItem,
  suspendUserFromModeration,
  unsuspendUserFromModeration,
} from "@/app/actions/moderation-admin";
import {
  formatRiskScore,
  labelRiskCategories,
} from "@/lib/moderation/labels";
import { sanitizeFounderError } from "@/lib/founder-messages";
import {
  studioAdminCard,
  studioEyebrow,
  dsAlertWarning,
  dsInput,
} from "@/lib/design-system";

type WorkflowTab = "pending" | "escalated" | "resolved";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending:
      "border border-[var(--status-info-border)] bg-[var(--status-info-bg)] text-[var(--status-info-text)]",
    approved:
      "bg-[var(--status-success-bg)] text-[var(--brand-success)]",
    removed:
      "bg-[var(--status-danger-bg)] text-[var(--brand-danger)]",
    escalated:
      "bg-[var(--tag-primary-bg)] text-[var(--brand-accent)]",
  };

  return (
    <span
      className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
        colors[status] ??
          "bg-[var(--brand-surface-elevated)] text-[var(--brand-text-secondary)]"
      }`}
    >
      {status}
    </span>
  );
}

function formatContentType(type: string, entityType: string): string {
  return `${type} · ${entityType.replace(/_/g, " ")}`;
}

function QueueItemCard({ item }: { item: ModerationQueueEntry }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function runAction(
    action: () => Promise<{ error?: string; success?: boolean }>
  ) {
    startTransition(async () => {
      setMessage(null);
      const result = await action();
      if (result.error) {
        setMessage(sanitizeFounderError(result.error) ?? result.error);
        return;
      }
      setMessage("Decision recorded.");
      router.refresh();
    });
  }

  const creatorLabel =
    item.displayName || item.username
      ? `${item.displayName ?? item.username}${item.username ? ` (@${item.username})` : ""}`
      : "Creator";

  const isActionable =
    item.status === "pending" || item.status === "escalated";

  return (
    <article className={studioAdminCard}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={item.status} />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)]">
              {formatContentType(item.content_type, item.entity_type)}
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-[var(--brand-text-secondary)]">
            {creatorLabel}
          </p>
          <p className="mt-0.5 text-xs text-[var(--brand-text-secondary)]">
            {new Date(item.created_at).toLocaleString()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wide text-[var(--brand-text-secondary)]">
            AI confidence
          </p>
          <p className="text-lg font-semibold tabular-nums text-neutral-900">
            {formatRiskScore(item.risk_score)}
          </p>
        </div>
      </div>

      {item.risk_categories.length > 0 && (
        <div className="mt-3 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)]">
            Reason flagged
          </p>
          <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">
            {labelRiskCategories(item.risk_categories)}
          </p>
        </div>
      )}

      {item.content_type === "image" && item.imageUrl && (
        <div className="relative mt-4 aspect-video max-w-lg overflow-hidden rounded-xl border border-[var(--brand-border)] bg-[var(--studio-empty-fill)]">
          <Image
            src={item.imageUrl}
            alt="Content preview"
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      )}

      {item.content_preview && (
        <div className="mt-4 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)]">
            Preview
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--brand-text-secondary)]">
            {item.content_preview}
          </p>
        </div>
      )}

      {isActionable ? (
        <div className="mt-4 space-y-3 border-t border-[var(--brand-border)] pt-4">
          <label className="block">
            <span className="text-[10px] font-medium uppercase tracking-wide text-[var(--brand-text-secondary)]">
              Reviewer note (optional)
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className={`mt-1.5 ${dsInput}`}
              placeholder="Why you made this decision…"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                runAction(() => approveModerationItem(item.id, note))
              }
              className="rounded-lg bg-emerald-700/90 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
            >
              Approve
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                runAction(() => removeModerationItem(item.id, note))
              }
              className="rounded-lg bg-red-800/90 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              Remove
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                runAction(() => escalateModerationItem(item.id, note))
              }
              className="rounded-lg border border-[var(--brand-border)] bg-[var(--tag-primary-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--tag-primary-text)] transition hover:bg-[var(--tag-primary-bg)] disabled:opacity-60"
            >
              Escalate
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                runAction(() => suspendUserFromModeration(item.user_id, note))
              }
              className="rounded-lg border border-[var(--brand-border)] px-3 py-1.5 text-xs font-medium text-[var(--brand-text-secondary)] transition hover:bg-[var(--brand-surface)] disabled:opacity-60"
            >
              Suspend account
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                runAction(() => unsuspendUserFromModeration(item.user_id))
              }
              className="rounded-lg border border-[var(--brand-border)] px-3 py-1.5 text-xs font-medium text-[var(--brand-text-secondary)] transition hover:bg-[var(--brand-surface)] disabled:opacity-60"
            >
              Unsuspend account
            </button>
          </div>
        </div>
      ) : (
        item.reviewer_note && (
          <p className="mt-4 text-sm text-[var(--brand-text-secondary)]">
            Note: {item.reviewer_note}
          </p>
        )
      )}

      {message && <p className="mt-3 text-xs text-[var(--brand-text-secondary)]">{message}</p>}
    </article>
  );
}

type ModerationQueueProps = {
  items: ModerationQueueEntry[];
  summary: {
    pendingCount: number;
    escalatedCount: number;
    pendingImages: number;
    pendingText: number;
    flagged7d: number;
  };
  error?: string;
};

const TABS: { id: WorkflowTab; label: string }[] = [
  { id: "pending", label: "Pending review" },
  { id: "escalated", label: "Escalated" },
  { id: "resolved", label: "Resolved" },
];

export function ModerationQueue({ items, summary, error }: ModerationQueueProps) {
  const [tab, setTab] = useState<WorkflowTab>("pending");

  const filtered = useMemo(() => {
    if (tab === "pending") {
      return items.filter((i) => i.status === "pending");
    }
    if (tab === "escalated") {
      return items.filter((i) => i.status === "escalated");
    }
    return items.filter(
      (i) => i.status === "approved" || i.status === "removed"
    );
  }, [items, tab]);

  const friendlyError = sanitizeFounderError(error);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="border-b border-[var(--brand-border)] pb-5">
        <p className={studioEyebrow}>Content safety</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
          Moderation
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--brand-text-secondary)]">
          AI flags content for your review. Your decisions are final — flagged
          content is never auto-deleted.
        </p>
      </header>

      {friendlyError && <p className={dsAlertWarning}>{friendlyError}</p>}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Pending review", value: summary.pendingCount },
          { label: "Escalated", value: summary.escalatedCount },
          { label: "Flagged this week", value: summary.flagged7d },
        ].map((metric) => (
          <div key={metric.label} className={studioAdminCard}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
              {metric.label}
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--brand-text-secondary)]">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 border-b border-[var(--brand-border)] pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-t-lg px-4 py-2 text-sm font-medium transition ${
              tab === t.id
                ? "border-b-2 border-[var(--brand-accent)] font-semibold text-[var(--foreground)]"
                : "text-[var(--brand-text-secondary)] hover:text-[var(--foreground)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className={`${studioAdminCard} py-12 text-center`}>
          <p className="text-sm text-[var(--brand-text-secondary)]">
            No items in {TABS.find((t) => t.id === tab)?.label.toLowerCase()}.
          </p>
          <p className="mt-2 text-xs text-[var(--brand-text-secondary)]">
            Private creator work is not reviewed unless AI flags it or someone
            reports it.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {filtered.map((item) => (
            <li key={item.id}>
              <QueueItemCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
