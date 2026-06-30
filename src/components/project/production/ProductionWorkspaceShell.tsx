"use client";

import { useState } from "react";
import type {
  ProjectCharacterEntry,
  ProjectSceneRollupEntry,
  ProjectStoryEntry,
} from "@/app/actions/projects";
import type { ProductionData } from "@/app/actions/production/index";
import { ComicArtDirectionPanel } from "@/components/project/production/comic/ComicArtDirectionPanel";
import { ComicPagesPanel } from "@/components/project/production/comic/ComicPagesPanel";
import { NovelChaptersPanel } from "@/components/project/production/novel/NovelChaptersPanel";
import { ProductionOverviewPanel } from "@/components/project/production/ProductionOverviewPanel";
import { ProductionPlaceholderPanel } from "@/components/project/production/ProductionPlaceholderPanel";
import { ScreenplayBeatsPanel } from "@/components/project/production/screenplay/ScreenplayBeatsPanel";
import { StorybookSettingsForm } from "@/components/project/production/storybook/StorybookSettingsForm";
import { StorybookSpreadsPanel } from "@/components/project/production/storybook/StorybookSpreadsPanel";
import {
  formatProductionStructureSummary,
  isProductionStructureEmpty,
} from "@/lib/production-structure";
import {
  getPrimaryStructureTab,
  getProductionTabs,
  type ProductionTabId,
} from "@/lib/production-navigation";
import {
  PROJECT_WORK_INTENT_LABELS,
  type ProjectWorkIntent,
} from "@/types/project";
import type { WorldMoodboardBundle } from "@/types/world-moodboard";

type ProductionWorkspaceShellProps = {
  projectId: string;
  workIntent: ProjectWorkIntent;
  productionData: ProductionData;
  stories: ProjectStoryEntry[];
  sceneRollup: ProjectSceneRollupEntry[];
  characters: ProjectCharacterEntry[];
  moodboardBundle: WorldMoodboardBundle | null;
  primaryWorldId: string | null;
  styleReferenceCount: number;
  migrationError?: string;
};

function productLabel(workIntent: ProjectWorkIntent): string {
  return PROJECT_WORK_INTENT_LABELS[workIntent].toLowerCase();
}

function resolveInitialTab(
  workIntent: ProjectWorkIntent,
  productionData: ProductionData
): ProductionTabId {
  if (isProductionStructureEmpty(productionData)) {
    return getPrimaryStructureTab(workIntent);
  }
  return "overview";
}

export function ProductionWorkspaceShell({
  projectId,
  workIntent,
  productionData,
  stories,
  sceneRollup,
  characters,
  moodboardBundle,
  primaryWorldId,
  styleReferenceCount,
  migrationError,
}: ProductionWorkspaceShellProps) {
  const tabs = getProductionTabs(workIntent);
  const structureEmpty = isProductionStructureEmpty(productionData);
  const [activeTab, setActiveTab] = useState<ProductionTabId>(() =>
    resolveInitialTab(workIntent, productionData)
  );

  if (!productionData) {
    return null;
  }

  const summary = formatProductionStructureSummary(productionData);
  const label = productLabel(workIntent);

  function navigateToTab(tabId: ProductionTabId) {
    setActiveTab(tabId);
  }

  return (
    <div className="space-y-5">
      {migrationError && (
        <p className="rounded-lg border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-3 py-2 text-sm text-[var(--status-info-text)]">
          {migrationError}
        </p>
      )}

      <nav
        aria-label="Production sections"
        className="-mx-1 overflow-x-auto border-b border-[var(--brand-border)] px-1 pb-px"
      >
        <ul className="flex min-w-min gap-1">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <button
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  activeTab === tab.id
                    ? "bg-[var(--brand-surface-elevated)] text-[var(--foreground)]"
                    : "text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface)] hover:text-[var(--foreground)]"
                }`}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {activeTab === "overview" && (
        <ProductionOverviewPanel
          projectId={projectId}
          workIntent={workIntent}
          stories={stories}
          sceneRollup={sceneRollup}
          characters={characters}
          comicIssues={productionData.kind === "comic" ? productionData.issues : undefined}
          structureSummary={summary}
          structureEmpty={structureEmpty}
          onNavigateToTab={navigateToTab}
        />
      )}

      {activeTab === "parts" && productionData.kind === "novel" && (
        <NovelChaptersPanel projectId={projectId} parts={productionData.parts} />
      )}

      {activeTab === "issues" && productionData.kind === "comic" && (
        <ComicPagesPanel
          projectId={projectId}
          issues={productionData.issues}
          stories={stories}
        />
      )}

      {activeTab === "art-direction" && productionData.kind === "comic" && (
        <ComicArtDirectionPanel
          projectId={projectId}
          artDirection={productionData.artDirection}
          moodboardBundle={moodboardBundle}
          primaryWorldId={primaryWorldId}
          styleReferenceCount={styleReferenceCount}
        />
      )}

      {activeTab === "book-settings" && productionData.kind === "picture_book" && (
        <StorybookSettingsForm
          projectId={projectId}
          settings={productionData.settings}
        />
      )}

      {activeTab === "spreads" && productionData.kind === "picture_book" && (
        <StorybookSpreadsPanel
          projectId={projectId}
          spreads={productionData.spreads}
        />
      )}

      {activeTab === "acts" && productionData.kind === "screenplay" && (
        <ScreenplayBeatsPanel projectId={projectId} acts={productionData.acts} />
      )}

      {activeTab === "compile" && (
        <ProductionPlaceholderPanel kind="compile" productLabel={label} />
      )}

      {activeTab === "download" && (
        <ProductionPlaceholderPanel kind="download" productLabel={label} />
      )}
    </div>
  );
}
