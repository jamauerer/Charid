import type { ComicPlanProposal, StoryAnalysisResult } from "@/types/ai/comic-planning";
import type { ProductionIntelligenceBundle, ProductionSummary } from "@/types/ai/production-intelligence";
import { AI_CREDIT_COSTS } from "@/types/credit";
import type { AiProjectTypeId } from "@/types/ai/core";
import {
  buildAdvertisementPlanningPreview,
  buildFilmPlanningPreview,
} from "@/lib/ai/production-intelligence/film-ad-planning";
import { enrichPagePlan, buildPageIntelligenceList } from "@/lib/ai/production-intelligence/page-intelligence";
import { analyzeScenes } from "@/lib/ai/production-intelligence/scene-intelligence";
import { enrichStoryAnalysis } from "@/lib/ai/production-intelligence/story-intelligence";
import { getProjectTypeStrategy } from "@/lib/ai/production-intelligence/project-type";
import { saveProductionIntelligenceSnapshot } from "@/lib/ai/production-intelligence/store";

export function estimatePlanningCredits(pageCount: number): number {
  return (
    AI_CREDIT_COSTS.story_analysis +
    AI_CREDIT_COSTS.comic_page_planning +
    pageCount * AI_CREDIT_COSTS.panel_planning
  );
}

export function buildProductionSummary(input: {
  analysis: StoryAnalysisResult;
  plan: ComicPlanProposal;
  projectType: AiProjectTypeId;
  artStyle?: string;
}): ProductionSummary {
  const panels = input.plan.pages.reduce((sum, page) => sum + page.panelCount, 0);
  return {
    storySummary: input.analysis.storySummary,
    productionSummary:
      input.plan.productionSummary ??
      input.analysis.intelligence?.productionSummary ??
      input.plan.issueDescription,
    estimatedPages: input.plan.pageCount,
    estimatedPanels: panels,
    estimatedCredits: estimatePlanningCredits(input.plan.pageCount),
    estimatedGenerationTime: null,
    recommendedStyle:
      input.analysis.intelligence?.recommendedStyle ?? input.artStyle ?? "Visual storytelling",
    readingPace: input.analysis.suggestedReadingPace,
    dialogueDensity: input.analysis.intelligence?.dialogueDensity ?? "Medium",
    projectType: input.projectType,
  };
}

export function runProductionIntelligence(input: {
  analysis: StoryAnalysisResult;
  plan: ComicPlanProposal;
  scenes: { id: string; title: string; summary?: string }[];
  projectType: AiProjectTypeId;
  storyTitle: string;
  synopsis: string;
  characterCount: number;
  artStyle?: string;
}): ProductionIntelligenceBundle {
  const strategy = getProjectTypeStrategy(input.projectType);

  const enrichedAnalysis = enrichStoryAnalysis(input.analysis, {
    storyTitle: input.storyTitle,
    synopsis: input.synopsis,
    sceneCount: input.scenes.length,
    characterCount: input.characterCount,
    projectType: input.projectType,
    artStyle: input.artStyle,
  });

  const sceneIntelligence = analyzeScenes({
    scenes: input.scenes,
    storyIntelligence: enrichedAnalysis.intelligence!,
    projectType: input.projectType,
  });

  const enrichedPlan = enrichPagePlan(input.plan, {
    analysis: enrichedAnalysis,
    sceneIntelligence,
    projectType: input.projectType,
  });

  const summary = buildProductionSummary({
    analysis: enrichedAnalysis,
    plan: enrichedPlan,
    projectType: input.projectType,
    artStyle: input.artStyle,
  });

  const bundle: ProductionIntelligenceBundle = {
    projectType: input.projectType,
    story: enrichedAnalysis.intelligence!,
    scenes: sceneIntelligence,
    pages: buildPageIntelligenceList(enrichedPlan),
    filmPreview: strategy.enableFilmPreview
      ? buildFilmPlanningPreview({
          storyTitle: input.storyTitle,
          scenes: sceneIntelligence,
          storyIntelligence: enrichedAnalysis.intelligence!,
        })
      : null,
    advertisementPreview: strategy.enableAdvertisementPreview
      ? buildAdvertisementPlanningPreview({
          storyTitle: input.storyTitle,
          storyIntelligence: enrichedAnalysis.intelligence!,
        })
      : null,
    summary,
    createdAt: new Date().toISOString(),
  };

  saveProductionIntelligenceSnapshot(bundle);

  return bundle;
}

export function applyIntelligenceToPlan(
  analysis: StoryAnalysisResult,
  plan: ComicPlanProposal,
  bundle: ProductionIntelligenceBundle
): { analysis: StoryAnalysisResult; plan: ComicPlanProposal } {
  return {
    analysis: { ...analysis, intelligence: bundle.story },
    plan: {
      ...plan,
      productionSummary: bundle.summary.productionSummary,
      pages: plan.pages.map((page) => {
        const pageIntel = bundle.pages.find((p) => p.pageNumber === page.pageNumber);
        return pageIntel ? { ...page, intelligence: pageIntel, panelCount: pageIntel.recommendedPanelCount } : page;
      }),
    },
  };
}

export type { AiProjectTypeId };
export { mapWorkIntentToProjectType, getProjectTypeStrategy } from "@/lib/ai/production-intelligence/project-type";
export { listProductionIntelligenceSnapshots, getLatestProductionIntelligenceSnapshot } from "@/lib/ai/production-intelligence/store";
