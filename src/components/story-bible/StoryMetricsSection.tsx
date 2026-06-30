import type { StoryBibleScores } from "@/types/story-context-packet";
import {
  CONSISTENCY_TIER_LABELS,
  CREATOR_STORY_METRICS,
} from "@/lib/creator-vocabulary";
import type { AiReadinessTier } from "@/types/context-packet";

const TIER_COLORS: Record<AiReadinessTier, string> = {
  started: "text-[var(--brand-text-secondary)]",
  developing: "text-neutral-500",
  growing: "text-sky-400",
  strong: "text-neutral-500",
  ai_ready: "text-emerald-400",
};

type StoryMetricsSectionProps = {
  scores: StoryBibleScores;
};

function MetricRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-3">
      <span className="text-sm text-[var(--brand-text-secondary)]">{label}</span>
      <span className="text-sm font-semibold tabular-nums text-[var(--brand-text-secondary)]">
        {value}%
      </span>
    </div>
  );
}

export function StoryMetricsSection({ scores }: StoryMetricsSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Story metrics
        </h3>
        <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">
          How complete and consistent your story profile is across story
          information and references.
        </p>
      </div>

      <div className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4">
        <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--brand-text-secondary)]">
          Overall readiness
        </p>
        <p
          className={`mt-1 text-2xl font-semibold ${TIER_COLORS[scores.aiReadinessTier]}`}
        >
          {CONSISTENCY_TIER_LABELS[scores.aiReadinessTier]}
        </p>
        <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">
          {scores.aiReadiness}% {CREATOR_STORY_METRICS.consistencyScore.toLowerCase()}
        </p>
      </div>

      <div className="space-y-2">
        <MetricRow
          label={CREATOR_STORY_METRICS.storyComplete}
          value={scores.storyCompletion}
        />
        <MetricRow
          label={CREATOR_STORY_METRICS.storyConsistency}
          value={scores.storyConsistency}
        />
        <MetricRow
          label={CREATOR_STORY_METRICS.referenceCoverage}
          value={scores.referenceGraphCompletion}
        />
        <MetricRow
          label={CREATOR_STORY_METRICS.consistencyScore}
          value={scores.aiReadiness}
        />
      </div>
    </div>
  );
}
