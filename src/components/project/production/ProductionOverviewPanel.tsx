"use client";

import type {
  ProjectCharacterEntry,
  ProjectSceneRollupEntry,
  ProjectStoryEntry,
} from "@/app/actions/projects";
import { ProductionStorySourcePanel } from "@/components/project/production/ProductionStorySourcePanel";
import {
  getProductionPipeline,
  type ProductionPipelineStep,
} from "@/lib/production-navigation";
import type { ProjectWorkIntent } from "@/types/project";
import { PROJECT_WORK_INTENT_LABELS } from "@/types/project";

type ProductionOverviewPanelProps = {
  workIntent: ProjectWorkIntent;
  stories: ProjectStoryEntry[];
  sceneRollup: ProjectSceneRollupEntry[];
  characters: ProjectCharacterEntry[];
  structureSummary?: string;
};

function ProductionPipelineDiagram({ steps }: { steps: ProductionPipelineStep[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {steps.map((step, index) => (
        <span key={`${step.label}-${index}`} className="flex items-center gap-2">
          {index > 0 && (
            <span className="text-[var(--brand-text-muted)]" aria-hidden>
              ↓
            </span>
          )}
          <span
            className={
              step.muted
                ? "rounded-md border border-dashed border-[var(--brand-border)] px-2 py-1 text-[var(--brand-text-muted)]"
                : "rounded-md border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] px-2 py-1 font-medium text-[var(--foreground)]"
            }
          >
            {step.label}
          </span>
        </span>
      ))}
    </div>
  );
}

export function ProductionOverviewPanel({
  workIntent,
  stories,
  sceneRollup,
  characters,
  structureSummary,
}: ProductionOverviewPanelProps) {
  const pipeline = getProductionPipeline(workIntent);
  const formatLabel = PROJECT_WORK_INTENT_LABELS[workIntent];

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
          {formatLabel} production
        </h3>
        <p className="mt-2 text-sm text-[var(--brand-text-secondary)]">
          Create Story Once, Produce Anywhere. Your Story Layer stays canonical;
          Production is the format-specific structure built on top of it.
        </p>

        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-muted)]">
            Pipeline
          </p>
          <ProductionPipelineDiagram steps={pipeline} />
        </div>

        {structureSummary && (
          <p className="mt-4 text-sm text-[var(--brand-text-secondary)]">
            Current structure: {structureSummary}
          </p>
        )}
      </div>

      <ProductionStorySourcePanel
        stories={stories}
        sceneRollup={sceneRollup}
        characters={characters}
      />
    </div>
  );
}
