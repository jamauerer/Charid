import type {
  PageIntelligence,
  PanelIntelligence,
  StoryIntelligence,
} from "@/types/ai/production-intelligence";

export type StoryAnalysisResult = {
  storySummary: string;
  sceneSummary: string;
  suggestedPageCount: number;
  suggestedPanelCount: number;
  suggestedReadingPace: string;
  characterNotes: string[];
  locationNotes: string[];
  timelineNotes: string[];
  intelligence?: StoryIntelligence;
};

export type ComicPagePlan = {
  id: string;
  pageNumber: number;
  title: string;
  description: string;
  panelCount: number;
  sceneIds: string[];
  pacing: string;
  intelligence?: PageIntelligence;
};

export type ComicPlanProposal = {
  issueTitle: string;
  issueDescription: string;
  pageCount: number;
  pages: ComicPagePlan[];
  sceneAllocation: { sceneId: string; sceneTitle: string; pageNumbers: number[] }[];
  pacingNotes: string;
  productionSummary?: string;
};

export type PanelPlanItem = {
  panelIndex: number;
  description: string;
  cameraAngle: string;
  composition: string;
  characterPlacement: string;
  emotion: string;
  lighting: string;
  dialogueSuggestion: string;
  captionSuggestion: string;
  sfxSuggestion: string;
  intelligence?: PanelIntelligence;
};

export type PagePanelPlan = {
  pageId: string;
  pageTitle: string;
  panels: PanelPlanItem[];
};

export type ComicGenerationStep =
  | "story_analyzed"
  | "scenes_analyzed"
  | "characters_loaded"
  | "references_loaded"
  | "page_planning"
  | "panel_planning"
  | "generating_page"
  | "generating_panel"
  | "finished"
  | "failed";

export type ComicGenerationProgress = {
  jobId: string;
  steps: { id: ComicGenerationStep; label: string; status: "pending" | "active" | "done" | "failed" }[];
  currentMessage: string;
  error: string | null;
};
