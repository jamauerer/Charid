import type { WorldBibleScores } from "@/types/world-context-packet";
import type { WorldReferenceGraph } from "@/types/world-reference-graph";
import { WORLD_CORE_SLOT_ROLES } from "@/types/world-image";
import { CREATOR_WORLD, CREATOR_WORLD_METRICS } from "@/lib/creator-vocabulary";
import { labelForWorldAssetRole } from "@/lib/world-asset-role-labels";
import { hasWorldGraphRole } from "@/lib/world-slot-assignments";
import {
  worldSlotTarget,
  type WorldNavigationTarget,
} from "@/lib/world-bible-navigation";

type WorldReferenceChecklistProps = {
  graph: WorldReferenceGraph;
  scores: WorldBibleScores;
  onNavigate: (target: WorldNavigationTarget) => void;
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

export function WorldReferenceChecklist({
  graph,
  scores,
  onNavigate,
}: WorldReferenceChecklistProps) {
  const hasRole = (role: string) => hasWorldGraphRole(graph.nodes, role);
  const assetCount = graph.galleryReferenceCount;

  const coreRoles = WORLD_CORE_SLOT_ROLES.filter(
    (role) => role === "canonical_map" || role === "canonical_reference"
  );
  const locationRoles = WORLD_CORE_SLOT_ROLES.filter(
    (role) =>
      role !== "canonical_map" && role !== "canonical_reference"
  );

  return (
    <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
            {CREATOR_WORLD.referenceChecklistTitle}
          </h2>
          <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
            {CREATOR_WORLD.referenceChecklistHint}
          </p>
        </div>
        <p className="text-xs text-[var(--brand-text-secondary)]">
          {assetCount} asset{assetCount === 1 ? "" : "s"} in gallery
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <ScoreMini
          label={CREATOR_WORLD_METRICS.worldConsistency}
          value={scores.worldConsistency}
        />
        <ScoreMini
          label={CREATOR_WORLD_METRICS.referenceCoverage}
          value={scores.referenceGraphCompletion}
        />
        <ScoreMini
          label={CREATOR_WORLD_METRICS.consistencyScore}
          value={scores.aiReadiness}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)]">
            Core
          </p>
          <div className="space-y-0.5">
            {coreRoles.map((role) => (
              <SlotRow
                key={role}
                label={labelForWorldAssetRole(role)}
                filled={hasRole(role)}
                onClick={() => onNavigate(worldSlotTarget(role))}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)]">
            Locations & atmosphere
          </p>
          <div className="space-y-0.5">
            {locationRoles.map((role) => (
              <SlotRow
                key={role}
                label={labelForWorldAssetRole(role)}
                filled={hasRole(role)}
                onClick={() => onNavigate(worldSlotTarget(role))}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
