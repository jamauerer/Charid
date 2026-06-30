"use client";

import Image from "next/image";
import {
  GENERATE_COVER_REFERENCE_GROUP_HINTS,
  GENERATE_COVER_REFERENCE_GROUP_LABELS,
  type GenerateCoverReferenceGroup,
  type GenerateCoverReferenceItem,
} from "@/types/generate-cover";
import { studioWarmChip } from "@/lib/visual-identity";

type GenerateCoverReferencesPanelProps = {
  title?: string;
  subtitle?: string;
  items: GenerateCoverReferenceItem[];
  /** When true, included refs show a toggle-off affordance (Generate dialog). */
  interactive?: boolean;
  onToggleRef?: (id: string) => void;
};

const GROUP_ORDER: GenerateCoverReferenceGroup[] = ["creator", "context"];

function statusGlyph(status: GenerateCoverReferenceItem["status"]): string {
  if (status === "included") return "✓";
  if (status === "excluded") return "—";
  return "○";
}

function statusClass(status: GenerateCoverReferenceItem["status"]): string {
  if (status === "included") return "text-neutral-600/90";
  if (status === "excluded") return "text-[var(--brand-text-secondary)] line-through";
  return "text-[var(--brand-text-secondary)]";
}

export function GenerateCoverReferencesPanel({
  title = "References CharID will use",
  subtitle = "Your approved references first. CharID adds context from your story and characters.",
  items,
  interactive = false,
  onToggleRef,
}: GenerateCoverReferencesPanelProps) {
  return (
    <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] p-4">
      <h3 className="text-sm font-semibold text-[var(--brand-text-secondary)]">{title}</h3>
      {subtitle && (
        <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">{subtitle}</p>
      )}

      <div className="mt-4 space-y-5">
        {GROUP_ORDER.map((group) => {
          const groupItems = items.filter((item) => item.group === group);
          if (groupItems.length === 0) return null;

          return (
            <section key={group} aria-labelledby={`ref-group-${group}`}>
              <h4
                id={`ref-group-${group}`}
                className="text-[11px] font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]"
              >
                {GENERATE_COVER_REFERENCE_GROUP_LABELS[group]}
              </h4>
              <p className="mt-0.5 text-[11px] text-[var(--brand-text-secondary)]">
                {GENERATE_COVER_REFERENCE_GROUP_HINTS[group]}
              </p>
              <ul className="mt-2 space-y-2">
                {groupItems.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 rounded-lg border border-white/[0.05] bg-[var(--brand-surface)] px-3 py-2"
                  >
                    {item.thumbnailUrl ? (
                      <Image
                        src={item.thumbnailUrl}
                        alt=""
                        width={40}
                        height={40}
                        unoptimized
                        className="mt-0.5 shrink-0 rounded-md border border-[var(--brand-border)] object-cover"
                      />
                    ) : (
                      <span
                        className={`mt-0.5 w-4 shrink-0 text-xs tabular-nums ${statusClass(item.status)}`}
                        aria-hidden
                      >
                        {statusGlyph(item.status)}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm ${statusClass(item.status)} ${
                          item.status === "missing" ? "italic" : ""
                        }`}
                      >
                        {item.label}
                      </p>
                      {item.detail && (
                        <p className="mt-0.5 text-xs text-[var(--brand-text-secondary)] line-clamp-2">
                          {item.detail}
                        </p>
                      )}
                    </div>
                    {interactive &&
                      item.status === "included" &&
                      onToggleRef && (
                        <button
                          type="button"
                          onClick={() => onToggleRef(item.id)}
                          className="shrink-0 text-xs text-[var(--brand-text-secondary)] transition hover:text-[var(--brand-text-secondary)]"
                        >
                          Remove
                        </button>
                      )}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {items.some((i) => i.thumbnailUrl) && (
        <p className="mt-3">
          <span className={studioWarmChip}>Image refs show thumbnails</span>
        </p>
      )}
    </div>
  );
}
