import type { CharacterBibleScores } from "@/types/context-packet";
import type { ReferenceGraph } from "@/types/reference-graph";
import { CREATOR_CHARACTER, CREATOR_METRICS } from "@/lib/creator-vocabulary";
import { CREATURE_ARCHETYPES } from "@/types/identity-archetype";
import { EXPRESSION_ROLES, TURNAROUND_ROLES } from "@/types/character-image";
import { labelForAssetRole } from "@/lib/asset-role-labels";
import {
  bibleSlotTarget,
  type BibleNavigationTarget,
} from "@/lib/bible-navigation";

type ReferenceGraphInspectorProps = {
  graph: ReferenceGraph;
  scores: CharacterBibleScores;
  onNavigate: (target: BibleNavigationTarget) => void;
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

export function ReferenceGraphInspector({
  graph,
  scores,
  onNavigate,
}: ReferenceGraphInspectorProps) {
  const isCreature = CREATURE_ARCHETYPES.includes(graph.identityArchetype);
  const hasRole = (role: string) =>
    graph.nodes.some((node) => node.assetRole === role);
  const assetCount = graph.galleryReferenceCount;

  return (
    <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
            {CREATOR_CHARACTER.referenceChecklistTitle}
          </h2>
          <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
            {CREATOR_CHARACTER.referenceChecklistHint}
          </p>
        </div>
        <p className="text-xs text-[var(--brand-text-secondary)]">
          {assetCount} asset{assetCount === 1 ? "" : "s"} in gallery
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <ScoreMini
          label={CREATOR_METRICS.visualConsistency}
          value={scores.identityStrength}
        />
        <ScoreMini
          label={CREATOR_METRICS.referenceCoverage}
          value={scores.referenceGraphCompletion}
        />
        <ScoreMini
          label={CREATOR_METRICS.consistencyScore}
          value={scores.aiReadiness}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)]">
            Core
          </p>
          <SlotRow
            label={labelForAssetRole("canonical")}
            filled={hasRole("canonical")}
            onClick={() => onNavigate(bibleSlotTarget("canonical"))}
          />
        </div>

        {!isCreature && (
          <>
            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)]">
                Turnaround
              </p>
              <div className="space-y-0.5">
                {TURNAROUND_ROLES.map((role) => (
                  <SlotRow
                    key={role}
                    label={labelForAssetRole(role)}
                    filled={hasRole(role)}
                    onClick={() => onNavigate(bibleSlotTarget(role))}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-text-secondary)]">
                Expressions
              </p>
              <div className="space-y-0.5">
                {EXPRESSION_ROLES.map((role) => (
                  <SlotRow
                    key={role}
                    label={labelForAssetRole(role)}
                    filled={hasRole(role)}
                    onClick={() => onNavigate(bibleSlotTarget(role))}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
