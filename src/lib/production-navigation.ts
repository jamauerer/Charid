import { PROJECT_SECTION_IDS } from "@/lib/project-tabs";
import type { ProjectWorkIntent } from "@/types/project";

export type ProductionTabId =
  | "overview"
  | "parts"
  | "issues"
  | "art-direction"
  | "book-settings"
  | "spreads"
  | "acts"
  | "compile"
  | "download";

export type ProductionTab = {
  id: ProductionTabId;
  label: string;
  comingSoon?: boolean;
};

export const PRODUCTION_TABS_BY_INTENT: Partial<
  Record<ProjectWorkIntent, ProductionTab[]>
> = {
  novel: [
    { id: "overview", label: "Overview" },
    { id: "parts", label: "Manuscript" },
    { id: "compile", label: "Compile", comingSoon: true },
    { id: "download", label: "Download", comingSoon: true },
  ],
  comic: [
    { id: "overview", label: "Overview" },
    { id: "issues", label: "Pages" },
    { id: "art-direction", label: "Art Direction" },
    { id: "compile", label: "Compile", comingSoon: true },
    { id: "download", label: "Download", comingSoon: true },
  ],
  picture_book: [
    { id: "overview", label: "Overview" },
    { id: "spreads", label: "Spreads" },
    { id: "book-settings", label: "Book Settings" },
    { id: "compile", label: "Compile", comingSoon: true },
    { id: "download", label: "Download", comingSoon: true },
  ],
  screenplay: [
    { id: "overview", label: "Overview" },
    { id: "acts", label: "Beat Sheet" },
    { id: "compile", label: "Compile", comingSoon: true },
    { id: "download", label: "Download", comingSoon: true },
  ],
};

export type ProductionPipelineStep = {
  label: string;
  muted?: boolean;
  tabId?: ProductionTabId;
  projectSectionId?: string;
};

export const PRODUCTION_PIPELINES: Partial<
  Record<ProjectWorkIntent, ProductionPipelineStep[]>
> = {
  novel: [
    { label: "Story", projectSectionId: PROJECT_SECTION_IDS.story },
    { label: "Manuscript", tabId: "parts" },
    { label: "Chapters", tabId: "parts" },
    { label: "Novel", tabId: "compile", muted: true },
  ],
  comic: [
    { label: "Story", projectSectionId: PROJECT_SECTION_IDS.story },
    { label: "Pages", tabId: "issues" },
    { label: "Art Direction", tabId: "art-direction" },
    { label: "Graphic Novel", tabId: "compile", muted: true },
  ],
  picture_book: [
    { label: "Story", projectSectionId: PROJECT_SECTION_IDS.story },
    { label: "Spreads", tabId: "spreads" },
    { label: "Book Settings", tabId: "book-settings" },
    { label: "Storybook", tabId: "compile", muted: true },
  ],
  screenplay: [
    { label: "Story", projectSectionId: PROJECT_SECTION_IDS.story },
    { label: "Beat Sheet", tabId: "acts" },
    { label: "Screenplay", tabId: "compile", muted: true },
  ],
};

export function isProductionTabId(value: string): value is ProductionTabId {
  return [
    "overview",
    "parts",
    "issues",
    "art-direction",
    "book-settings",
    "spreads",
    "acts",
    "compile",
    "download",
  ].includes(value);
}

export function getProductionTabs(
  workIntent: ProjectWorkIntent | null
): ProductionTab[] {
  if (!workIntent) return [];
  return PRODUCTION_TABS_BY_INTENT[workIntent] ?? [];
}

export function getProductionPipeline(
  workIntent: ProjectWorkIntent | null
): ProductionPipelineStep[] {
  if (!workIntent) return [];
  return PRODUCTION_PIPELINES[workIntent] ?? [];
}

export function getPrimaryStructureTab(
  workIntent: ProjectWorkIntent
): ProductionTabId {
  switch (workIntent) {
    case "comic":
      return "issues";
    case "picture_book":
      return "spreads";
    case "novel":
      return "parts";
    case "screenplay":
      return "acts";
    default:
      return "overview";
  }
}

export function getStartProductionCtaLabel(workIntent: ProjectWorkIntent): string {
  switch (workIntent) {
    case "comic":
      return "Add your first page";
    case "picture_book":
      return "Add your first spread";
    case "novel":
      return "Start your manuscript";
    case "screenplay":
      return "Add your first beat";
    default:
      return "Get started";
  }
}

export function isProductionWorkIntent(
  workIntent: ProjectWorkIntent | null
): workIntent is "novel" | "comic" | "picture_book" | "screenplay" {
  return (
    workIntent === "novel" ||
    workIntent === "comic" ||
    workIntent === "picture_book" ||
    workIntent === "screenplay"
  );
}
