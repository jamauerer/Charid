import type { StoryBibleScores } from "@/types/story-context-packet";
import type { StoryReferenceGraph } from "@/types/story-reference-graph";
import { STORY_CORE_SLOT_ROLES } from "@/types/story-image";
import { CREATOR_STORY, CREATOR_STORY_METRICS } from "@/lib/creator-vocabulary";
import { labelForStoryAssetRole } from "@/lib/story-asset-role-labels";
import { hasStoryGraphRole } from "@/lib/story-slot-assignments";
import {
  storySlotTarget,
  type StoryNavigationTarget,
} from "@/lib/story-bible-navigation";

type StoryReferenceChecklistProps = {
  graph: StoryReferenceGraph;
  scores: StoryBibleScores;
  onNavigate: (target: StoryNavigationTarget) => void;
};

function SlotRow({
  label,
  filled,
  onClick,
}: {
  label: string;
  filled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition hover:bg-[var(--brand-surface)] ${
        filled ? "text-emerald-300" : "text-[var(--brand-text-secondary)]"
      }`}
    >
      <span className="w-4 shrink-0 tabular-nums" aria-hidden>
        {filled ? "✓" : "✗"}
      </span>
      <span>{label}</span>
    </button>
  );
}

function ScoreMini({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-[var(--brand-text-secondary)]">{label}</p>
      <p className="mt-0.5 text-sm font-semibold tabular-nums text-[var(--brand-text-secondary)]">
        {value}%
      </p>
    </div>
  );
}

export function StoryReferenceChecklist({
  graph,
  scores,
  onNavigate,
}: StoryReferenceChecklistProps) {
  const hasRole = (role: string) => hasStoryGraphRole(graph.nodes, role);
  const assetCount = graph.galleryReferenceCount;
  const roleSlots = STORY_CORE_SLOT_ROLES.filter((role) => role !== "reference");

  return (
    <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
            {CREATOR_STORY.referenceChecklistTitle}
          </h2>
          <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
            {CREATOR_STORY.referenceChecklistHint}
          </p>
        </div>
        <p className="text-xs text-[var(--brand-text-secondary)]">
          {assetCount} asset{assetCount === 1 ? "" : "s"} in gallery
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <ScoreMini
          label={CREATOR_STORY_METRICS.storyConsistency}
          value={scores.storyConsistency}
        />
        <ScoreMini
          label={CREATOR_STORY_METRICS.referenceCoverage}
          value={scores.referenceGraphCompletion}
        />
        <ScoreMini
          label={CREATOR_STORY_METRICS.consistencyScore}
          value={scores.aiReadiness}
        />
      </div>

      <div className="mt-4">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)]">
          Asset roles
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {roleSlots.map((role) => (
            <SlotRow
              key={role}
              label={labelForStoryAssetRole(role)}
              filled={hasRole(role)}
              onClick={() => onNavigate(storySlotTarget(role))}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
