"use client";

import type { ReactNode } from "react";

type CollapsibleWorkspaceSectionProps = {
  id?: string;
  title: string;
  hint: string;
  children: ReactNode;
};

export function CollapsibleWorkspaceSection({
  id,
  title,
  hint,
  children,
}: CollapsibleWorkspaceSectionProps) {
  return (
    <details
      id={id}
      className="group mb-10 scroll-mt-6 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)]"
    >
      <summary className="cursor-pointer list-none px-5 py-4 marker:content-none [&::-webkit-details-marker]:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
              {title}
            </h2>
            <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">{hint}</p>
          </div>
          <span
            className="shrink-0 text-[var(--brand-text-secondary)] transition group-open:rotate-180"
            aria-hidden
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </div>
      </summary>
      <div className="border-t border-[var(--brand-border)] p-5 sm:p-6">{children}</div>
    </details>
  );
}
