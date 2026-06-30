import type { StoryAnalysisResult } from "@/types/ai/comic-planning";
import type { StoryIntelligence } from "@/types/ai/production-intelligence";
import {
  complexityScore,
  formatFilmRuntime,
  formatReadingTime,
  inferDensity,
  inferPacing,
  inferStoryType,
} from "@/lib/ai/production-intelligence/heuristics";
import { getProjectTypeStrategy } from "@/lib/ai/production-intelligence/project-type";
import type { AiProjectTypeId } from "@/types/ai/core";

export function enrichStoryAnalysis(
  analysis: StoryAnalysisResult,
  input: {
    storyTitle: string;
    synopsis: string;
    sceneCount: number;
    characterCount: number;
    projectType: AiProjectTypeId;
    artStyle?: string;
  }
): StoryAnalysisResult {
  const strategy = getProjectTypeStrategy(input.projectType);
  const combinedText = `${input.synopsis} ${analysis.storySummary}`;
  const storyType = inferStoryType(input.storyTitle, combinedText);
  const dialogueDensity = inferDensity(combinedText);
  const actionDensity = inferDensity(combinedText, 1);
  const pacing = inferPacing(input.sceneCount, strategy.pagesPerScene);
  const pages = analysis.suggestedPageCount;
  const panels = analysis.suggestedPanelCount;
  const complexity = complexityScore({
    sceneCount: input.sceneCount,
    characterCount: input.characterCount,
    dialogueDensity,
    actionDensity,
  });

  const recommendations: StoryIntelligence["recommendations"] = [];
  if (dialogueDensity === "High") {
    recommendations.push({
      explanation:
        "This story appears dialogue-heavy, so smaller panel grids and readable pacing are recommended.",
    });
  }
  if (actionDensity === "High") {
    recommendations.push({
      explanation:
        "Action beats are prominent — consider wider panels and splash pages for impact moments.",
    });
  }
  if (pacing === "Fast") {
    recommendations.push({
      explanation: "Scene count suggests brisk pacing — shorter page allocations per scene may work well.",
    });
  }

  const intelligence: StoryIntelligence = {
    storyType,
    pacing,
    dialogueDensity,
    actionDensity,
    estimatedReadingTime: formatReadingTime(input.sceneCount, pacing),
    estimatedGraphicNovelLength: `${pages} pages · ~${panels} panels`,
    estimatedStorybookLength: `${Math.max(1, Math.ceil(pages / 2))} spreads`,
    estimatedFilmRuntime: formatFilmRuntime(input.sceneCount),
    complexityScore: complexity,
    recommendedStyle: input.artStyle ?? strategy.styleHint,
    productionSummary: `A ${storyType.toLowerCase()} ${strategy.label.toLowerCase()} production with ${pacing.toLowerCase()} pacing and ${dialogueDensity.toLowerCase()} dialogue density.`,
    recommendations,
  };

  return { ...analysis, intelligence };
}
