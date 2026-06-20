"use client";

import { useState, type ReactNode } from "react";

type ProjectRoadmapSectionProps = {
  id: string;
  title: string;
  count?: number | null;
  defaultExpanded?: boolean;
  action?: ReactNode;
  preview?: string;
  children: ReactNode;
};

export function ProjectRoadmapSection({
  id,
  title,
  count,
  defaultExpanded = true,
  action,
  preview,
  children,
}: ProjectRoadmapSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const countLabel =
    count !== null && count !== undefined
      ? ` (${count})`
      : "";

  return (
    <section id={id} className="scroll-mt-6 border-b border-[var(--brand-border)] py-5 last:border-b-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          aria-expanded={expanded}
          aria-controls={`${id}-panel`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-4 w-4 shrink-0 text-[var(--brand-text-muted)] transition ${expanded ? "rotate-90" : ""}`}
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M7.21 14.77a.75.75 0 0 1 .02-1.06L10.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l3.5 3.25a.75.75 0 0 1 0 1.08l-3.5 3.25a.75.75 0 0 1-1.06-.02Z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
            {title}
            {countLabel}
          </span>
        </button>
        {action && <div className="shrink-0">{action}</div>}
      </div>

      {!expanded && preview && (
        <p className="mt-2 pl-6 text-xs text-[var(--brand-text-muted)]">{preview}</p>
      )}

      {expanded && (
        <div id={`${id}-panel`} className="mt-4 pl-6">
          {children}
        </div>
      )}
    </section>
  );
}
