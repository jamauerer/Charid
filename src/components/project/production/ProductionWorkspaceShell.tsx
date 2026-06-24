"use client";

import { useState } from "react";
import type {
  ProjectCharacterEntry,
  ProjectSceneRollupEntry,
  ProjectStoryEntry,
} from "@/app/actions/projects";
import type { ProductionData } from "@/app/actions/production/index";
import { ComicArtDirectionPanel } from "@/components/project/production/comic/ComicArtDirectionPanel";
import { ComicIssuesPanel } from "@/components/project/production/comic/ComicIssuesPanel";
import { NovelPartsPanel } from "@/components/project/production/novel/NovelPartsPanel";
import { ProductionOverviewPanel } from "@/components/project/production/ProductionOverviewPanel";
import { ProductionPlaceholderPanel } from "@/components/project/production/ProductionPlaceholderPanel";
import { ScreenplayActsPanel } from "@/components/project/production/screenplay/ScreenplayActsPanel";
import { StorybookSettingsForm } from "@/components/project/production/storybook/StorybookSettingsForm";
import { StorybookSpreadsPanel } from "@/components/project/production/storybook/StorybookSpreadsPanel";
import {
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

function structureSummary(data: ProductionData): string | undefined {
  if (!data) return undefined;

  switch (data.kind) {
    case "novel": {
      const partCount = data.parts.length;
      const chapterCount = data.parts.reduce(
        (sum, part) => sum + part.chapters.length,
        0
      );
      return `${partCount} part${partCount === 1 ? "" : "s"} · ${chapterCount} chapter${chapterCount === 1 ? "" : "s"}`;
    }
    case "comic": {
      const issueCount = data.issues.length;
      const pageCount = data.issues.reduce((sum, i) => sum + i.pages.length, 0);
      const panelCount = data.issues.reduce(
        (sum, i) => sum + i.pages.reduce((pSum, p) => pSum + p.panels.length, 0),
        0
      );
      return `${issueCount} issue${issueCount === 1 ? "" : "s"} · ${pageCount} page${pageCount === 1 ? "" : "s"} · ${panelCount} panel${panelCount === 1 ? "" : "s"}`;
    }
    case "picture_book": {
      const spreadCount = data.spreads.length;
      return `${spreadCount} spread${spreadCount === 1 ? "" : "s"}`;
    }
    case "screenplay": {
      const actCount = data.acts.length;
      const beatCount = data.acts.reduce((sum, act) => sum + act.beats.length, 0);
      return `${actCount} act${actCount === 1 ? "" : "s"} · ${beatCount} beat${beatCount === 1 ? "" : "s"}`;
    }
    default:
      return undefined;
  }
}

function productLabel(workIntent: ProjectWorkIntent): string {
  return PROJECT_WORK_INTENT_LABELS[workIntent].toLowerCase();
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
  const [activeTab, setActiveTab] = useState<ProductionTabId>("overview");

  if (!productionData) {
    return null;
  }

  const summary = structureSummary(productionData);
  const label = productLabel(workIntent);

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
                className={`inline-flex shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
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
          workIntent={workIntent}
          stories={stories}
          sceneRollup={sceneRollup}
          characters={characters}
          structureSummary={summary}
        />
      )}

      {activeTab === "parts" && productionData.kind === "novel" && (
        <NovelPartsPanel projectId={projectId} parts={productionData.parts} />
      )}

      {activeTab === "issues" && productionData.kind === "comic" && (
        <ComicIssuesPanel projectId={projectId} issues={productionData.issues} />
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
        <ScreenplayActsPanel projectId={projectId} acts={productionData.acts} />
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
