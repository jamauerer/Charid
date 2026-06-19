"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { FeedbackInboxEntry } from "@/app/actions/feedback-admin";

const ENTITY_LABELS: Record<string, string> = {
  character: "Character",
  world: "World",
  story: "Story",
  generation: "Generation",
};

function RatingFilter({
  activeRating,
}: {
  activeRating: number | null;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function hrefFor(rating: number | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (rating == null) {
      params.delete("rating");
    } else {
      params.set("rating", String(rating));
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  }

  const options: { label: string; value: number | null }[] = [
    { label: "All", value: null },
    { label: "5★", value: 5 },
    { label: "4★", value: 4 },
    { label: "3★", value: 3 },
    { label: "2★", value: 2 },
    { label: "1★", value: 1 },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = activeRating === option.value;
        return (
          <Link
            key={option.label}
            href={hrefFor(option.value)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
              active
                ? "border-violet-500/40 bg-violet-500/15 text-neutral-600"
                : "border-[var(--brand-border)] text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface)]"
            }`}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}

function FeedbackRow({ item }: { item: FeedbackInboxEntry }) {
  const creatorLabel =
    item.displayName || item.username
      ? `${item.displayName ?? item.username}${item.username ? ` (@${item.username})` : ""}`
      : item.user_id.slice(0, 8);

  return (
    <article className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-neutral-600">
              {item.rating != null ? `${item.rating}/5` : "—"}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)]">
              {ENTITY_LABELS[item.entity_type] ?? item.entity_type}
            </span>
          </div>
          <p className="mt-2 text-sm font-medium text-[var(--brand-text-secondary)]">
            {item.entityLabel ?? item.entity_id.slice(0, 8)}
          </p>
          <p className="mt-0.5 text-xs text-[var(--brand-text-secondary)]">
            {creatorLabel} · {new Date(item.created_at).toLocaleString()}
          </p>
        </div>
      </div>
      {item.notes && (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--brand-text-secondary)]">
          {item.notes}
        </p>
      )}
    </article>
  );
}

export function FeedbackInbox({
  items,
  avgRating,
  totalCount,
  activeRating,
  error,
}: {
  items: FeedbackInboxEntry[];
  avgRating: number | null;
  totalCount: number;
  activeRating: number | null;
  error?: string;
}) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="border-b border-[var(--brand-border)] pb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
          Founder only
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-[var(--brand-text-secondary)]">
          Creator Feedback Inbox
        </h1>
        <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">
          Vision ratings from{" "}
          <code className="text-[var(--brand-text-secondary)]">public.creator_feedback</code>.
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-3 py-2 text-sm text-[var(--status-info-text)]">
          {error}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
            Average rating
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--brand-text-secondary)]">
            {avgRating != null ? avgRating.toFixed(1) : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
            Showing
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--brand-text-secondary)]">
            {totalCount}
          </p>
        </div>
      </div>

      <RatingFilter activeRating={activeRating} />

      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-8 text-center text-sm text-[var(--brand-text-secondary)]">
            No feedback matches this filter.
          </p>
        ) : (
          items.map((item) => <FeedbackRow key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
}
