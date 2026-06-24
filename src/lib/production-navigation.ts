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
};

export const PRODUCTION_TABS_BY_INTENT: Partial<
  Record<ProjectWorkIntent, ProductionTab[]>
> = {
  novel: [
    { id: "overview", label: "Overview" },
    { id: "parts", label: "Parts" },
    { id: "compile", label: "Compile" },
    { id: "download", label: "Download" },
  ],
  comic: [
    { id: "overview", label: "Overview" },
    { id: "issues", label: "Issues" },
    { id: "art-direction", label: "Art Direction" },
    { id: "compile", label: "Compile" },
    { id: "download", label: "Download" },
  ],
  picture_book: [
    { id: "overview", label: "Overview" },
    { id: "book-settings", label: "Book Settings" },
    { id: "spreads", label: "Spreads" },
    { id: "compile", label: "Compile" },
    { id: "download", label: "Download" },
  ],
  screenplay: [
    { id: "overview", label: "Overview" },
    { id: "acts", label: "Acts" },
    { id: "compile", label: "Compile" },
    { id: "download", label: "Download" },
  ],
};

export type ProductionPipelineStep = {
  label: string;
  muted?: boolean;
};

export const PRODUCTION_PIPELINES: Partial<
  Record<ProjectWorkIntent, ProductionPipelineStep[]>
> = {
  novel: [
    { label: "Story" },
    { label: "Parts" },
    { label: "Chapters" },
    { label: "Novel" },
  ],
  comic: [
    { label: "Story" },
    { label: "Issue" },
    { label: "Page" },
    { label: "Panel" },
    { label: "Graphic Novel" },
  ],
  picture_book: [
    { label: "Story" },
    { label: "Spreads" },
    { label: "Illustrations", muted: true },
    { label: "Storybook" },
  ],
  screenplay: [
    { label: "Story" },
    { label: "Beat Sheet" },
    { label: "Acts" },
    { label: "Screenplay" },
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
