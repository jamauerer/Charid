"use client";

import { useId, useState } from "react";
import { openStorySummaryEditor } from "@/lib/story-summary-edit-nav";
import { studioSectionLabel } from "@/lib/visual-identity";

type StorySummarySectionProps = {
  summary: string | null;
};

const COLLAPSE_CHAR_THRESHOLD = 220;

export function StorySummarySection({ summary }: StorySummarySectionProps) {
  const headingId = useId();
  const [expanded, setExpanded] = useState(false);

  const text = summary?.trim();
  if (!text) {
    return null;
  }

  const isLong =
    text.length > COLLAPSE_CHAR_THRESHOLD || text.split(/\r?\n/).length > 3;

  return (
    <section aria-labelledby={headingId} className="mb-6">
      <div className="flex items-center justify-between gap-3">
        <h2 id={headingId} className={studioSectionLabel}>
          Summary
        </h2>
        <button
          type="button"
          onClick={openStorySummaryEditor}
          className="shrink-0 text-xs font-medium text-[var(--brand-accent)] transition hover:text-[var(--foreground)]"
        >
          Edit
        </button>
      </div>
      <div className="mt-2 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-3">
        <p
          className={`whitespace-pre-wrap text-sm leading-relaxed text-[var(--brand-text-secondary)] ${
            !expanded && isLong ? "line-clamp-3" : ""
          }`}
        >
          {text}
        </p>
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((open) => !open)}
            className="mt-2 text-xs font-medium text-[var(--brand-accent)] transition hover:text-[var(--foreground)]"
            aria-expanded={expanded}
          >
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>
    </section>
  );
}
