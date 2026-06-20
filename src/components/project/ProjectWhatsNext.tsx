import Link from "next/link";
import type { ProjectFinishPathResult } from "@/lib/project-finish-path";
import { CREATOR_PROJECT } from "@/lib/creator-vocabulary";
import { studioBtnPrimary, studioInspirePanel } from "@/lib/visual-identity";

type ProjectWhatsNextProps = {
  finishPath: ProjectFinishPathResult;
};

function PrimaryAction({ finishPath }: { finishPath: ProjectFinishPathResult }) {
  const { primary } = finishPath;

  if (primary.kind === "link") {
    return (
      <Link href={primary.href} className={studioBtnPrimary}>
        {primary.label}
      </Link>
    );
  }

  if (primary.kind === "scroll") {
    return (
      <a href={`#${primary.hash}`} className={studioBtnPrimary}>
        {primary.label}
      </a>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled
        className="inline-flex cursor-not-allowed items-center justify-center rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] px-5 py-2.5 text-sm font-medium text-neutral-400"
      >
        {primary.label}
      </button>
      <p className="text-xs text-neutral-600">{primary.hint}</p>
    </div>
  );
}

function ChecklistRow({ finishPath }: { finishPath: ProjectFinishPathResult }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-neutral-600">
      {finishPath.checklist.map((item) => (
        <li key={item.id} className="tabular-nums">
          <span className={item.complete ? "text-neutral-900" : "text-neutral-500"}>
            {item.complete ? "✓" : "○"}
          </span>{" "}
          <span className={item.complete ? "font-medium text-neutral-800" : ""}>
            {item.id === "cover"
              ? "Cover"
              : item.id === "style_refs"
                ? item.complete
                  ? `${item.count} Style refs`
                  : "Style refs"
                : `${item.count} ${item.label}`}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function ProjectWhatsNext({ finishPath }: ProjectWhatsNextProps) {
  return (
    <section
      id="project-whats-next"
      aria-labelledby="project-whats-next-heading"
      className={studioInspirePanel}
    >
      <h2
        id="project-whats-next-heading"
        className="text-sm font-semibold uppercase tracking-wider text-neutral-600"
      >
        {CREATOR_PROJECT.whatsNextLabel}
      </h2>
      <p className="mt-1 text-sm text-neutral-600">{CREATOR_PROJECT.whatsNextHint}</p>
      <ChecklistRow finishPath={finishPath} />
      <div className="mt-4">
        <PrimaryAction finishPath={finishPath} />
      </div>
      {finishPath.hints.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-600">
          {finishPath.hints.map((hint) => (
            <li key={hint.label}>
              {hint.href ? (
                <Link
                  href={hint.href}
                  className="underline-offset-2 transition hover:text-neutral-900 hover:underline"
                >
                  {hint.label}
                </Link>
              ) : hint.hash ? (
                <a
                  href={`#${hint.hash}`}
                  className="underline-offset-2 transition hover:text-neutral-900 hover:underline"
                >
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
