"use client";

const SUGGESTION_PLACEHOLDERS = [
  "Suggested panel layout",
  "Suggested camera angle",
  "Suggested pacing",
  "Suggested bubble placement",
  "Suggested character consistency",
] as const;

type StudioProductionAiPanelProps = {
  projectTitle: string;
  pageName: string;
};

export function StudioProductionAiPanel({ projectTitle, pageName }: StudioProductionAiPanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium text-[var(--foreground)]">Production AI</p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--brand-text-muted)]">
          Your production assistant — suggestions appear here as you work. Nothing changes without
          your approval.
        </p>
      </div>
      <ul className="space-y-2">
        {SUGGESTION_PLACEHOLDERS.map((label) => (
          <li
            key={label}
            className="rounded-md border border-dashed border-[var(--brand-border)] px-3 py-2.5 text-[11px] text-[var(--brand-text-muted)]"
          >
            {label}
          </li>
        ))}
      </ul>
      <p className="pt-1 text-[10px] text-[var(--brand-text-muted)]">
        {projectTitle} · {pageName}
      </p>
    </div>
  );
}
