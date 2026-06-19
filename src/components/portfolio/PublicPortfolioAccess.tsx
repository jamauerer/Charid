"use client";

import Link from "next/link";
import { getPortfolioPublicUrl } from "@/lib/portfolio-url";

type PublicPortfolioAccessProps = {
  username: string;
  isPublic: boolean;
  hasUnsavedVisibility: boolean;
  copied: boolean;
  onCopyLink: () => void;
};

export function PublicPortfolioAccess({
  username,
  isPublic,
  hasUnsavedVisibility,
  copied,
  onCopyLink,
}: PublicPortfolioAccessProps) {
  const publicPath = `/u/${username}`;
  const publicUrl = getPortfolioPublicUrl(username);

  return (
    <section className="mb-6 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Public presentation
          </p>
          <h2 className="mt-1 text-sm font-medium text-[var(--brand-text-secondary)]">
            What visitors see
          </h2>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
            isPublic
              ? "bg-emerald-500/10 text-emerald-300"
              : "bg-zinc-500/10 text-[var(--brand-text-secondary)]"
          }`}
        >
          {isPublic ? "Public" : "Private"}
        </span>
      </div>

      {hasUnsavedVisibility && (
        <p className="mt-3 rounded-lg border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-3 py-2 text-xs text-[var(--status-info-text)]">
          Save your portfolio to apply visibility changes before sharing.
        </p>
      )}

      {isPublic ? (
        <>
          <p className="mt-3 text-sm text-[var(--brand-text-secondary)]">
            Your portfolio is live. Anyone with your link can view your public
            worlds and characters.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <code className="flex-1 truncate rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] px-3 py-2 text-sm text-[var(--brand-text-secondary)]">
              {publicUrl}
            </code>
            <button
              type="button"
              onClick={onCopyLink}
              className="shrink-0 rounded-lg border border-[var(--brand-border)] px-4 py-2 text-sm font-medium text-[var(--brand-text-secondary)] transition hover:bg-[var(--brand-surface)] hover:text-white"
            >
              {copied ? "Copied!" : "Copy Link"}
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={publicPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r bg-[var(--brand-accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-violet-500/15 transition hover:bg-[var(--brand-accent-hover)]"
            >
              View Public Portfolio
              <span aria-hidden className="text-white/70">
                ↗
              </span>
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className="mt-3 text-sm text-[var(--brand-text-secondary)]">
            Portfolio is private. Only you can see your workspace until you
            choose to publish.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`${publicPath}?preview=1`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-2.5 text-sm font-medium text-[var(--brand-text-secondary)] transition hover:border-violet-400/40 hover:text-violet-100"
            >
              Preview Public Portfolio
              <span aria-hidden className="text-[var(--brand-text-secondary)]">
                ↗
              </span>
            </Link>
          </div>
          <p className="mt-3 text-xs text-[var(--brand-text-secondary)]">
            Preview opens in a new tab and does not make your portfolio public.
            Only public worlds and characters appear — same as visitors would see
            after you publish.
          </p>
        </>
      )}
    </section>
  );
}
