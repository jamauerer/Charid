"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { LibraryProjectRef, LibraryStoryRef } from "@/app/actions/library";

export type LibraryRelationshipStat = {
  label: string;
  value: number | string;
};

export type LibraryUsedInEntry = {
  label: string;
  value?: number | string | null;
  future?: boolean;
};

type LibraryRelationshipStatsProps = {
  stats: LibraryRelationshipStat[];
};

export function LibraryRelationshipStats({ stats }: LibraryRelationshipStatsProps) {
  const visible = stats.filter((stat) => {
    if (typeof stat.value === "number") return stat.value > 0 || stat.label === "Type";
    return Boolean(stat.value);
  });
  if (visible.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((stat) => (
        <span
          key={stat.label}
          className="rounded bg-[var(--brand-surface-elevated)] px-1.5 py-0.5 text-[10px] text-[var(--brand-text-muted)]"
        >
          {typeof stat.value === "number" ? (
            <>
              <span className="font-medium text-[var(--brand-text-secondary)]">{stat.value}</span>{" "}
              {stat.label.toLowerCase()}
            </>
          ) : (
            <>
              {stat.label}: {stat.value}
            </>
          )}
        </span>
      ))}
    </div>
  );
}

type LibraryUsedInBlockProps = {
  entries: LibraryUsedInEntry[];
};

export function LibraryUsedInBlock({ entries }: LibraryUsedInBlockProps) {
  if (entries.length === 0) return null;

  return (
    <div className="rounded-md border border-[var(--brand-border)]/60 bg-[var(--brand-surface-elevated)]/40 px-2 py-1.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--brand-text-muted)]">
        Used in
      </p>
      <ul className="mt-1 space-y-0.5">
        {entries.map((entry) => (
          <li
            key={entry.label}
            className="flex items-baseline justify-between gap-2 text-[10px] text-[var(--brand-text-secondary)]"
          >
            <span>{entry.label}</span>
            <span className="shrink-0 text-[var(--brand-text-muted)]">
              {entry.future
                ? "Coming soon"
                : entry.value != null && entry.value !== ""
                  ? entry.value
                  : "—"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LibraryOriginReserved() {
  return (
    <div
      className="rounded-md border border-dashed border-[var(--brand-border)]/70 px-2 py-1.5"
      data-library-origin-slot="reserved"
    >
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        <div>
          <p className="font-medium text-[var(--brand-text-muted)]">Created from</p>
          <p className="mt-0.5 text-[var(--brand-text-secondary)]">—</p>
        </div>
        <div>
          <p className="font-medium text-[var(--brand-text-muted)]">Variants</p>
          <p className="mt-0.5 text-[var(--brand-text-secondary)]">—</p>
        </div>
      </div>
    </div>
  );
}

type LibraryCardLinksProps = {
  openHref: string;
  openLabel: string;
  project?: LibraryProjectRef | null;
  story?: LibraryStoryRef | null;
};

export function LibraryCardLinks({
  openHref,
  openLabel,
  project,
  story,
}: LibraryCardLinksProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pt-0.5">
      <Link
        href={openHref}
        className="text-[10px] font-medium text-[var(--brand-accent)] hover:underline"
        onClick={(event) => event.stopPropagation()}
      >
        {openLabel}
      </Link>
      {project && (
        <>
          <span className="text-[10px] text-[var(--brand-text-muted)]">·</span>
          <Link
            href={project.href}
            className="text-[10px] font-medium text-[var(--brand-text-secondary)] hover:text-[var(--foreground)]"
            onClick={(event) => event.stopPropagation()}
          >
            Open project
          </Link>
        </>
      )}
      {story && (
        <>
          <span className="text-[10px] text-[var(--brand-text-muted)]">·</span>
          <Link
            href={story.href}
            className="text-[10px] font-medium text-[var(--brand-text-secondary)] hover:text-[var(--foreground)]"
            onClick={(event) => event.stopPropagation()}
          >
            Open story
          </Link>
        </>
      )}
    </div>
  );
}

type LibraryCardOverflowMenuProps = {
  entityLabel: string;
  children?: ReactNode;
};

export function LibraryCardOverflowMenu({
  entityLabel,
  children,
}: LibraryCardOverflowMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={menuRef} className="absolute right-1.5 top-1.5 z-10">
      <button
        type="button"
        aria-label={`${entityLabel} actions`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--brand-border)] bg-black/60 text-[var(--brand-text-secondary)] backdrop-blur-sm transition hover:bg-black/80 hover:text-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
          aria-hidden
        >
          <path d="M10 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM10 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM11.5 15.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 min-w-[148px] overflow-hidden rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] py-1 shadow-xl"
        >
          {children}
          <button
            type="button"
            role="menuitem"
            disabled
            className="flex w-full items-center justify-between px-3 py-1.5 text-left text-xs text-[var(--brand-text-muted)]"
            title="Create a linked variant of this item — coming soon"
          >
            Create variant
            <span className="ml-2 text-[10px]">Soon</span>
          </button>
        </div>
      )}
    </div>
  );
}

export function LibraryStoryLink({
  story,
  className = "",
}: {
  story: LibraryStoryRef | null;
  className?: string;
}) {
  if (!story) {
    return (
      <span className={`text-xs text-[var(--brand-text-muted)] ${className}`}>No story</span>
    );
  }

  return (
    <Link
      href={story.href}
      className={`text-xs font-medium text-[var(--brand-text-secondary)] transition hover:text-[var(--foreground)] ${className}`}
      onClick={(event) => event.stopPropagation()}
    >
      {story.title}
    </Link>
  );
}

export function formatRelationshipList(values: string[], max = 3): string {
  if (values.length === 0) return "";
  const shown = values.slice(0, max);
  const remainder = values.length - shown.length;
  if (remainder > 0) {
    return `${shown.join(", ")} +${remainder}`;
  }
  return shown.join(", ");
}
