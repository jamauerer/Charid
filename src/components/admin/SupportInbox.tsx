"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { SupportInboxEntry } from "@/app/actions/support-admin";
import { updateSupportTicketStatus } from "@/app/actions/support-admin";
import {
  formatSupportCategory,
  formatSupportStatus,
} from "@/lib/founder-labels";
import type { SupportTicketStatus } from "@/types/support-ticket";

function StatusBadge({ status }: { status: SupportTicketStatus }) {
  const colors: Record<SupportTicketStatus, string> = {
    open: "border border-[var(--status-info-border)] bg-[var(--status-info-bg)] text-[var(--status-info-text)]",
    in_progress: "bg-[var(--tag-primary-bg)] text-[var(--brand-text-secondary)]",
    resolved: "border border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success-text)]",
  };

  return (
    <span
      className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${colors[status]}`}
    >
      {formatSupportStatus(status)}
    </span>
  );
}

function TicketRow({ ticket }: { ticket: SupportInboxEntry }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const creatorLabel =
    ticket.displayName || ticket.username
      ? `${ticket.displayName ?? ticket.username}${ticket.username ? ` (@${ticket.username})` : ""}`
      : ticket.user_id.slice(0, 8);

  function setStatus(status: SupportTicketStatus) {
    startTransition(async () => {
      setMessage(null);
      const result = await updateSupportTicketStatus(ticket.id, status);
      if (result.error) {
        setMessage(result.error);
        return;
      }
      setMessage("Status updated.");
      router.refresh();
    });
  }

  return (
    <article className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)]">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-[var(--brand-surface)] sm:px-5"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={ticket.status} />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)]">
              {formatSupportCategory(ticket.category)}
            </span>
          </div>
          <p className="mt-1 truncate text-sm font-medium text-[var(--brand-text-secondary)]">
            {ticket.subject}
          </p>
          <p className="mt-0.5 text-xs text-[var(--brand-text-secondary)]">
            {creatorLabel} · {new Date(ticket.created_at).toLocaleString()}
          </p>
        </div>
        <span className="text-xs text-[var(--brand-text-secondary)]">{expanded ? "Hide" : "View"}</span>
      </button>

      {expanded && (
        <div className="border-t border-[var(--brand-border)] px-4 py-4 sm:px-5">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--brand-text-secondary)]">
            {ticket.message}
          </p>

          {ticket.screenshotUrl && (
            <div className="relative mt-4 aspect-video max-w-md overflow-hidden rounded-lg border border-[var(--brand-border)]">
              <Image
                src={ticket.screenshotUrl}
                alt="Support screenshot"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {ticket.status !== "in_progress" && (
              <button
                type="button"
                disabled={pending}
                onClick={() => setStatus("in_progress")}
                className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] text-neutral-600 transition hover:bg-[var(--tag-primary-bg)] disabled:opacity-50"
              >
                Mark in progress
              </button>
            )}
            {ticket.status !== "resolved" && (
              <button
                type="button"
                disabled={pending}
                onClick={() => setStatus("resolved")}
                className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50"
              >
                Mark resolved
              </button>
            )}
            {ticket.status !== "open" && (
              <button
                type="button"
                disabled={pending}
                onClick={() => setStatus("open")}
                className="rounded-lg border border-[var(--brand-border)] px-3 py-1.5 text-xs font-medium text-[var(--brand-text-secondary)] transition hover:bg-[var(--brand-surface)] disabled:opacity-50"
              >
                Reopen
              </button>
            )}
          </div>

          {message && (
            <p className="mt-3 text-xs text-[var(--brand-text-secondary)]">{message}</p>
          )}
        </div>
      )}
    </article>
  );
}

export function SupportInbox({
  tickets,
  counts,
  error,
}: {
  tickets: SupportInboxEntry[];
  counts: {
    open: number;
    inProgress: number;
    resolved: number;
    total: number;
  };
  error?: string;
}) {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="border-b border-[var(--brand-border)] pb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
          Founder only
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-[var(--brand-text-secondary)]">
          Support Inbox
        </h1>
        <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">
          All creator support tickets from{" "}
          <code className="text-[var(--brand-text-secondary)]">public.support_tickets</code>.
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-3 py-2 text-sm text-[var(--status-info-text)]">
          {error}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
            Open
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--brand-text-secondary)]">
            {counts.open}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
            In progress
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--brand-text-secondary)]">
            {counts.inProgress}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
            Resolved
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--brand-text-secondary)]">
            {counts.resolved}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
            Total
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--brand-text-secondary)]">
            {counts.total}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {tickets.length === 0 ? (
          <p className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-8 text-center text-sm text-[var(--brand-text-secondary)]">
            No support tickets yet.
          </p>
        ) : (
          tickets.map((ticket) => <TicketRow key={ticket.id} ticket={ticket} />)
        )}
      </div>
    </div>
  );
}
