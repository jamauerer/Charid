"use client";

import Link from "next/link";
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
import { comicPageStudioPath } from "@/lib/production-routes";
import { flattenComicPages } from "@/lib/production-reading-order";
import { studioBtnPrimarySm } from "@/lib/visual-identity";
import type { ComicIssueWithPages } from "@/types/production/comic";
import type { ProjectWorkIntent } from "@/types/project";
import { PROJECT_WORK_INTENT_LABELS } from "@/types/project";

type ProductionOverviewPanelProps = {
  projectId?: string;
  workIntent: ProjectWorkIntent;
  stories: ProjectStoryEntry[];
  sceneRollup: ProjectSceneRollupEntry[];
  characters: ProjectCharacterEntry[];
  comicIssues?: ComicIssueWithPages[];
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

        const content = step.label;

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

function ComicEditorBridge({
  projectId,
  comicIssues,
  structureEmpty,
  onNavigateToTab,
}: {
  projectId: string;
  comicIssues: ComicIssueWithPages[];
  structureEmpty: boolean;
  onNavigateToTab: (tabId: ProductionTabId) => void;
}) {
  const pages = flattenComicPages(comicIssues);
  const lastPage = pages.length > 0 ? pages[pages.length - 1] : null;

  return (
    <div className="mt-4 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] px-3 py-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
        CharID Studio
      </h4>
      <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">
        Bring your story to life. Create comic pages, arrange panels, upload artwork, add
        dialogue, captions and sound effects, then continue editing anytime.
      </p>
      <p className="mt-1 text-xs text-[var(--brand-text-muted)]">
        Use Generate Comic to analyze a story and propose pages — you review and approve before
        anything is created.
      </p>
      <ul className="mt-3 space-y-1.5 text-sm">
        {structureEmpty || pages.length === 0 ? (
          <>
            <li>
              <button
                type="button"
                onClick={() => onNavigateToTab("issues")}
                className="text-[var(--brand-accent)] hover:underline"
              >
                Create issue
              </button>
            </li>
            <li>
              <a href="#project-stories" className="text-[var(--brand-accent)] hover:underline">
                Choose story
              </a>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigateToTab("issues")}
                className="text-[var(--brand-accent)] hover:underline"
              >
                Start in CharID Studio
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              {lastPage ? (
                <Link
                  href={comicPageStudioPath(projectId, lastPage.id)}
                  className="font-medium text-[var(--brand-accent)] hover:underline"
                >
                  Continue editing
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigateToTab("issues")}
                  className="font-medium text-[var(--brand-accent)] hover:underline"
                >
                  Continue editing
                </button>
              )}
            </li>
            {lastPage && (
              <li className="text-[var(--brand-text-secondary)]">
                Last edited page:{" "}
                <Link
                  href={comicPageStudioPath(projectId, lastPage.id)}
                  className="text-[var(--foreground)] hover:underline"
                >
                  {lastPage.name}
                </Link>
              </li>
            )}
            <li>
              {lastPage ? (
                <Link
                  href={comicPageStudioPath(projectId, lastPage.id)}
                  className="text-[var(--brand-accent)] hover:underline"
                >
                  Open CharID Studio
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigateToTab("issues")}
                  className="text-[var(--brand-accent)] hover:underline"
                >
                  Open CharID Studio
                </button>
              )}
            </li>
          </>
        )}
      </ul>
    </div>
  );
}

export function ProductionOverviewPanel({
  projectId,
  workIntent,
  stories,
  sceneRollup,
  characters,
  comicIssues,
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
          {workIntent === "comic" ? "CharID Studio" : `${formatLabel} production`}
        </h3>
        <p className="mt-2 text-sm text-[var(--brand-text-secondary)]">
          {workIntent === "comic" ? (
            <>
              Bring your story to life. Create comic pages, arrange panels, upload artwork,
              add dialogue, captions and sound effects, then continue editing anytime.
            </>
          ) : (
            <>
              Your Story Layer is the source of truth. Production turns your story into a
              finished {formatLabel.toLowerCase()} — pages, spreads, or manuscript sections
              you can review and refine.
            </>
          )}
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

        {workIntent === "comic" && projectId && comicIssues && (
          <ComicEditorBridge
            projectId={projectId}
            comicIssues={comicIssues}
            structureEmpty={structureEmpty}
            onNavigateToTab={onNavigateToTab}
          />
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
