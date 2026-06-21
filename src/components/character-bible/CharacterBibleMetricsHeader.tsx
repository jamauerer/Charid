import type { CharacterBibleScores } from "@/types/context-packet";
import type { AiReadinessTier } from "@/types/context-packet";
import {
  CONSISTENCY_TIER_LABELS,
  CREATOR_CHARACTER,
  CREATOR_METRICS,
} from "@/lib/creator-vocabulary";

const TIER_COLORS: Record<AiReadinessTier, string> = {
  started: "text-[var(--brand-text-secondary)]",
  developing: "text-neutral-500",
  growing: "text-sky-400",
  strong: "text-neutral-500",
  ai_ready: "text-emerald-400",
};

type MetricBarProps = {
  label: string;
  value: number;
  highlight?: boolean;
};

function MetricBar({ label, value, highlight }: MetricBarProps) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-xs text-[var(--brand-text-secondary)]">{label}</span>
        <span
          className={`text-sm font-semibold tabular-nums ${
            highlight ? "text-neutral-600" : "text-[var(--brand-text-secondary)]"
          }`}
        >
          {value}%
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full rounded-full transition-all ${
            highlight
              ? "bg-[var(--brand-accent)]"
              : "bg-[var(--tag-primary-bg)]"
          }`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

type CharacterBibleMetricsHeaderProps = {
  scores: CharacterBibleScores;
  characterName: string;
  archetypeLabel: string;
  creativeFormat: string | null;
};

export function CharacterBibleMetricsHeader({
  scores,
  characterName,
  archetypeLabel,
  creativeFormat,
}: CharacterBibleMetricsHeaderProps) {
  return (
    <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
            {CREATOR_CHARACTER.workspaceLabel}
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-[var(--brand-text-secondary)] sm:text-2xl">
            {characterName}
          </h1>
          <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">
            {archetypeLabel}
            {creativeFormat ? ` · ${creativeFormat}` : ""}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--brand-text-secondary)]">
            {CREATOR_METRICS.consistencyScore}
          </p>
          <p
            className={`mt-0.5 text-lg font-semibold ${TIER_COLORS[scores.aiReadinessTier]}`}
          >
            {scores.aiReadiness}%
          </p>
          <p className={`text-xs ${TIER_COLORS[scores.aiReadinessTier]}`}>
            {CONSISTENCY_TIER_LABELS[scores.aiReadinessTier]}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricBar
          label={CREATOR_METRICS.profileComplete}
          value={scores.bibleCompletion}
          highlight
        />
        <MetricBar
          label={CREATOR_METRICS.visualConsistency}
          value={scores.identityStrength}
        />
        <MetricBar
          label={CREATOR_METRICS.referenceCoverage}
          value={scores.referenceGraphCompletion}
        />
        <MetricBar
          label={CREATOR_METRICS.consistencyScore}
          value={scores.aiReadiness}
        />
      </div>
    </div>
  );
}
