import type { BibleRecommendation } from "@/lib/character-bible-recommendations";
import type { BibleNavigationTarget } from "@/lib/bible-navigation";

const SECTION_LABELS: Record<BibleRecommendation["section"], string> = {
  identity: "Identity",
  reference: "Reference",
  turnaround: "Turnaround",
  expressions: "Expressions",
  details: "Details",
};

type CharacterBibleRecommendationsProps = {
  recommendations: BibleRecommendation[];
  onNavigate: (target: BibleNavigationTarget) => void;
};

export function CharacterBibleRecommendations({
  recommendations,
  onNavigate,
}: CharacterBibleRecommendationsProps) {
  if (recommendations.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-4 sm:p-5">
        <p className="text-sm font-medium text-emerald-300">
          Your character profile is in great shape.
        </p>
        <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">
          Keep refining references and descriptors as your character evolves.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 sm:p-6">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
        Recommended next steps
      </h2>
      <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">
        Highest-impact actions to strengthen consistency across your projects.
      </p>
      <ol className="mt-4 space-y-3">
        {recommendations.map((rec, index) => (
          <li
            key={rec.id}
            className="flex gap-3 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] p-3 sm:p-4"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-semibold text-neutral-600">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-[var(--brand-text-secondary)]">{rec.title}</p>
                <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--brand-text-secondary)]">
                  {SECTION_LABELS[rec.section]}
                </span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-[var(--brand-text-secondary)]">
                {rec.description}
              </p>
              <button
                type="button"
                onClick={() => onNavigate(rec.target)}
                className="mt-2 text-xs font-medium text-neutral-500 transition hover:text-neutral-600"
              >
                Go to {SECTION_LABELS[rec.section]} →
              </button>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
