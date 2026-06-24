"use client";

import { useState, type ReactNode } from "react";

type ProductionAccordionProps = {
  title: string;
  count?: number;
  defaultExpanded?: boolean;
  action?: ReactNode;
  children: ReactNode;
};

export function ProductionAccordion({
  title,
  count,
  defaultExpanded = false,
  action,
  children,
}: ProductionAccordionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const countLabel =
    count !== undefined && count !== null ? ` (${count})` : "";

  return (
    <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--brand-border)] px-4 py-3">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          aria-expanded={expanded}
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
          <span className="truncate text-sm font-semibold text-[var(--foreground)]">
            {title}
            {countLabel}
          </span>
        </button>
        {action}
      </div>
      {expanded && <div className="px-4 py-3">{children}</div>}
    </div>
  );
}
