"use client";

import type {
  ProjectCharacterEntry,
  ProjectSceneRollupEntry,
  ProjectStoryEntry,
} from "@/app/actions/projects";
import { ProductionStorySourcePanel } from "@/components/project/production/ProductionStorySourcePanel";
import {
  getPrimaryStructureTab,
  getProductionPipeline,
  getStartProductionCtaLabel,
  type ProductionPipelineStep,
  type ProductionTabId,
} from "@/lib/production-navigation";
import { studioBtnPrimarySm } from "@/lib/visual-identity";
import type { ProjectWorkIntent } from "@/types/project";
import { PROJECT_WORK_INTENT_LABELS } from "@/types/project";

type ProductionOverviewPanelProps = {
  workIntent: ProjectWorkIntent;
  stories: ProjectStoryEntry[];
  sceneRollup: ProjectSceneRollupEntry[];
  characters: ProjectCharacterEntry[];
  structureSummary?: string;
  structureEmpty: boolean;
  onNavigateToTab: (tabId: ProductionTabId) => void;
};

type ProductionPipelineDiagramProps = {
  steps: ProductionPipelineStep[];
  onNavigateToTab: (tabId: ProductionTabId) => void;
};

function ProductionPipelineDiagram({
  steps,
  onNavigateToTab,
}: ProductionPipelineDiagramProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {steps.map((step, index) => {
        const isClickable =
          !step.muted && (Boolean(step.tabId) || Boolean(step.projectSectionId));
        const className = step.muted
          ? "rounded-md border border-dashed border-[var(--brand-border)] px-2 py-1 text-[var(--brand-text-muted)]"
          : isClickable
            ? "rounded-md border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] px-2 py-1 font-medium text-[var(--foreground)] transition hover:border-[var(--brand-accent)] hover:bg-[var(--brand-surface)]"
            : "rounded-md border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] px-2 py-1 font-medium text-[var(--foreground)]";

        const content = (
          <>
            {step.label}
            {step.muted && (
              <span className="ml-1 text-[10px] font-normal uppercase text-[var(--brand-text-muted)]">
                Soon
              </span>
            )}
          </>
        );

        return (
          <span key={`${step.label}-${index}`} className="flex items-center gap-2">
            {index > 0 && (
              <span className="text-[var(--brand-text-muted)]" aria-hidden>
                ↓
              </span>
            )}
            {isClickable && step.tabId ? (
              <button
                type="button"
                onClick={() => onNavigateToTab(step.tabId!)}
                className={className}
              >
                {content}
              </button>
            ) : isClickable && step.projectSectionId ? (
              <a href={`#${step.projectSectionId}`} className={className}>
                {content}
              </a>
            ) : (
              <span className={className}>{content}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}

export function ProductionOverviewPanel({
  workIntent,
  stories,
  sceneRollup,
  characters,
  structureSummary,
  structureEmpty,
  onNavigateToTab,
}: ProductionOverviewPanelProps) {
  const pipeline = getProductionPipeline(workIntent);
  const formatLabel = PROJECT_WORK_INTENT_LABELS[workIntent];
  const primaryTab = getPrimaryStructureTab(workIntent);
  const startLabel = getStartProductionCtaLabel(workIntent);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
          {formatLabel} production
        </h3>
        <p className="mt-2 text-sm text-[var(--brand-text-secondary)]">
          Your Story Layer is the source of truth. Production turns your story into a
          finished {formatLabel.toLowerCase()} — pages, spreads, or manuscript
          sections you can review and refine.
        </p>

        {(structureEmpty || structureSummary) && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {structureEmpty ? (
              <>
                <p className="text-sm text-[var(--brand-text-secondary)]">
                  You haven&apos;t started production yet.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigateToTab(primaryTab)}
                  className={studioBtnPrimarySm}
                >
                  {startLabel}
                </button>
              </>
            ) : (
              structureSummary && (
                <p className="text-sm text-[var(--brand-text-secondary)]">
                  Current progress: {structureSummary}
                </p>
              )
            )}
            {!structureEmpty && (
              <button
                type="button"
                onClick={() => onNavigateToTab(primaryTab)}
                className="rounded-lg border border-[var(--brand-border)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition hover:bg-[var(--brand-surface-elevated)]"
              >
                Continue building
              </button>
            )}
          </div>
        )}

        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-muted)]">
            Workflow
          </p>
          <ProductionPipelineDiagram steps={pipeline} onNavigateToTab={onNavigateToTab} />
          <p className="mt-2 text-xs text-[var(--brand-text-muted)]">
            Click a step to jump there. Story opens your project stories section.
          </p>
        </div>
      </div>

      <ProductionStorySourcePanel
        stories={stories}
        sceneRollup={sceneRollup}
        characters={characters}
      />
    </div>
  );
}
