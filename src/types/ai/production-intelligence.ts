import type { AiProjectTypeId } from "@/types/ai/core";

export const STORY_TYPES = [
  "Adventure",
  "Drama",
  "Comedy",
  "Mystery",
  "Fantasy",
  "Sci-Fi",
  "Slice of Life",
] as const;

export type StoryType = (typeof STORY_TYPES)[number];

export const DENSITY_LEVELS = ["Low", "Medium", "High"] as const;
export type DensityLevel = (typeof DENSITY_LEVELS)[number];

export const PACING_LEVELS = ["Slow", "Medium", "Fast"] as const;
export type PacingLevel = (typeof PACING_LEVELS)[number];

export const SCENE_PURPOSES = [
  "Introduction",
  "Character Development",
  "Action",
  "Transition",
  "Climax",
  "Resolution",
] as const;

export type ScenePurpose = (typeof SCENE_PURPOSES)[number];

export const CAMERA_RECOMMENDATIONS = [
  "Close-up",
  "Medium",
  "Wide",
  "Extreme Wide",
  "Overhead",
  "Low Angle",
  "High Angle",
] as const;

export type CameraRecommendation = (typeof CAMERA_RECOMMENDATIONS)[number];

export const PAGE_LAYOUT_STYLES = [
  "Standard grid",
  "Large splash page",
  "Six panel grid",
  "Three cinematic panels",
  "Single focus panel",
  "Asymmetric drama layout",
] as const;

export type PageLayoutStyle = (typeof PAGE_LAYOUT_STYLES)[number];

export type IntelligenceRecommendation = {
  explanation: string;
};

export type StoryIntelligence = {
  storyType: StoryType;
  pacing: PacingLevel;
  dialogueDensity: DensityLevel;
  actionDensity: DensityLevel;
  estimatedReadingTime: string;
  estimatedGraphicNovelLength: string;
  estimatedStorybookLength: string;
  estimatedFilmRuntime: string;
  complexityScore: number;
  recommendedStyle: string;
  productionSummary: string;
  recommendations: IntelligenceRecommendation[];
};

export type SceneIntelligence = {
  sceneId: string;
  sceneTitle: string;
  purpose: ScenePurpose;
  estimatedPanels: number;
  recommendedPacing: PacingLevel;
  dialogueLoad: DensityLevel;
  actionLoad: DensityLevel;
  visualComplexity: DensityLevel;
  sceneImportance: DensityLevel;
  recommendedPageBreak: boolean;
  recommendations: IntelligenceRecommendation[];
};

export type PageIntelligence = {
  pageNumber: number;
  recommendedPanelCount: number;
  layoutStyle: PageLayoutStyle;
  layoutComplexity: DensityLevel;
  recommendedPacing: PacingLevel;
  sceneBreakSuggestion: string | null;
  recommendations: IntelligenceRecommendation[];
};

export type PanelIntelligence = {
  panelIndex: number;
  cameraRecommendation: CameraRecommendation;
  recommendedEmotion: string;
  focusCharacter: string | null;
  dialogueDensity: DensityLevel;
  visualImportance: DensityLevel;
  recommendations: IntelligenceRecommendation[];
};

export type FilmPlanningPreview = {
  sceneDuration: string;
  estimatedShotCount: number;
  recommendedKeyframes: {
    firstFrame: string;
    lastFrame: string;
    intermediateFrames: string[];
  };
  cameraMotionSuggestion: string;
  recommendations: IntelligenceRecommendation[];
};

export type AdvertisementPlanningPreview = {
  campaignGoal: string;
  targetAudience: string;
  primaryProduct: string;
  supportingAssets: string[];
  recommendedLayoutStyle: string;
  recommendedVisualHierarchy: string;
  recommendedCallToAction: string;
  recommendations: IntelligenceRecommendation[];
};

export type ProductionSummary = {
  storySummary: string;
  productionSummary: string;
  estimatedPages: number;
  estimatedPanels: number;
  estimatedCredits: number;
  estimatedGenerationTime: string | null;
  recommendedStyle: string;
  readingPace: string;
  dialogueDensity: DensityLevel;
  projectType: AiProjectTypeId;
};

export type ProductionIntelligenceBundle = {
  projectType: AiProjectTypeId;
  story: StoryIntelligence;
  scenes: SceneIntelligence[];
  pages: PageIntelligence[];
  filmPreview: FilmPlanningPreview | null;
  advertisementPreview: AdvertisementPlanningPreview | null;
  summary: ProductionSummary;
  createdAt: string;
};
