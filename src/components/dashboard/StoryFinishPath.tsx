import Link from "next/link";
import type { FinishPathResult } from "@/lib/story-finish-path";
import { CREATOR_STORY } from "@/lib/creator-vocabulary";
import {
  dsWhatsNextCheckComplete,
  dsWhatsNextCheckIncomplete,
  dsWhatsNextChecklist,
  dsWhatsNextDisabledHint,
  dsWhatsNextHeading,
  dsWhatsNextHint,
  dsWhatsNextHintLink,
  dsWhatsNextLabelComplete,
  dsBtnPrimary,
  dsPanel,
} from "@/lib/design-system";

type StoryFinishPathProps = {
  finishPath: FinishPathResult;
};

function PrimaryAction({ finishPath }: { finishPath: FinishPathResult }) {
  const { primary } = finishPath;

  if (primary.kind === "link") {
    return (
      <Link href={primary.href} className={dsBtnPrimary}>
        {primary.label}
      </Link>
    );
  }

  if (primary.kind === "scroll") {
    return (
      <a href={`#${primary.hash}`} className={dsBtnPrimary}>
        {primary.label}
      </a>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled
        className="inline-flex cursor-not-allowed items-center justify-center rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] px-5 py-2.5 text-sm font-medium text-[var(--brand-text-secondary)]"
      >
        {primary.label}
      </button>
      <p className={dsWhatsNextDisabledHint}>{primary.hint}</p>
    </div>
  );
}

function ChecklistRow({ finishPath }: { finishPath: FinishPathResult }) {
  return (
    <ul className={dsWhatsNextChecklist}>
      {finishPath.checklist.map((item) => (
        <li key={item.id} className="tabular-nums">
          <span
            className={
              item.complete ? dsWhatsNextCheckComplete : dsWhatsNextCheckIncomplete
            }
          >
            {item.complete ? "✓" : "○"}
          </span>{" "}
          <span className={item.complete ? dsWhatsNextLabelComplete : undefined}>
            {item.id === "cover"
              ? "Cover image"
              : `${item.count} ${item.label}`}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function StoryFinishPath({ finishPath }: StoryFinishPathProps) {
  return (
    <section aria-labelledby="story-whats-next-heading" className={dsPanel}>
      <h2 id="story-whats-next-heading" className={dsWhatsNextHeading}>
        {CREATOR_STORY.whatsNextLabel}
      </h2>
      <p className={dsWhatsNextHint}>{CREATOR_STORY.whatsNextHint}</p>
      <ChecklistRow finishPath={finishPath} />
      <div className="mt-4">
        <PrimaryAction finishPath={finishPath} />
      </div>
      {finishPath.hints.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--brand-text-secondary)]">
          {finishPath.hints.map((hint) => (
            <li key={hint.label}>
              {hint.href ? (
                <Link href={hint.href} className={dsWhatsNextHintLink}>
                  {hint.label}
                </Link>
              ) : hint.hash ? (
                <a href={`#${hint.hash}`} className={dsWhatsNextHintLink}>
                  {hint.label}
                </a>
              ) : (
                hint.label
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
