import type { ComicPlanProposal, StoryAnalysisResult } from "@/types/ai/comic-planning";
import type { PageIntelligence, PageLayoutStyle } from "@/types/ai/production-intelligence";
import type { SceneIntelligence } from "@/types/ai/production-intelligence";
import type { AiProjectTypeId } from "@/types/ai/core";
import { getProjectTypeStrategy } from "@/lib/ai/production-intelligence/project-type";

function layoutForPage(input: {
  panelCount: number;
  pageNumber: number;
  sceneIntel: SceneIntelligence | null;
}): { layoutStyle: PageLayoutStyle; layoutComplexity: PageIntelligence["layoutComplexity"] } {
  if (input.sceneIntel?.purpose === "Climax" && input.pageNumber > 1) {
    return { layoutStyle: "Large splash page", layoutComplexity: "Low" };
  }
  if (input.panelCount >= 6) {
    return { layoutStyle: "Six panel grid", layoutComplexity: "High" };
  }
  if (input.panelCount === 3) {
    return { layoutStyle: "Three cinematic panels", layoutComplexity: "Medium" };
  }
  if (input.panelCount === 1) {
    return { layoutStyle: "Single focus panel", layoutComplexity: "Low" };
  }
  if (input.sceneIntel?.dialogueLoad === "High") {
    return { layoutStyle: "Six panel grid", layoutComplexity: "High" };
  }
  return { layoutStyle: "Standard grid", layoutComplexity: "Medium" };
}

export function enrichPagePlan(
  plan: ComicPlanProposal,
  input: {
    analysis: StoryAnalysisResult;
    sceneIntelligence: SceneIntelligence[];
    projectType: AiProjectTypeId;
  }
): ComicPlanProposal {
  const strategy = getProjectTypeStrategy(input.projectType);
  const sceneById = new Map(input.sceneIntelligence.map((s) => [s.sceneId, s]));

  const pages = plan.pages.map((page) => {
    const sceneIntel = page.sceneIds[0] ? sceneById.get(page.sceneIds[0]) ?? null : null;
    const recommendedPanelCount = sceneIntel?.estimatedPanels ?? page.panelCount;
    const { layoutStyle, layoutComplexity } = layoutForPage({
      panelCount: recommendedPanelCount,
      pageNumber: page.pageNumber,
      sceneIntel,
    });

    const recommendations: PageIntelligence["recommendations"] = [];
    if (layoutStyle === "Large splash page") {
      recommendations.push({
        explanation: "This moment appears climactic, so a splash page is recommended.",
      });
    }
    if (layoutStyle === "Six panel grid") {
      recommendations.push({
        explanation: "This scene is dialogue-heavy, so six smaller panels are recommended.",
      });
    }
    if (layoutStyle === "Three cinematic panels") {
      recommendations.push({
        explanation: "Cinematic pacing suits this beat — three wide panels preserve rhythm.",
      });
    }

    const intelligence: PageIntelligence = {
      pageNumber: page.pageNumber,
      recommendedPanelCount,
      layoutStyle,
      layoutComplexity,
      recommendedPacing: sceneIntel?.recommendedPacing ?? input.analysis.intelligence?.pacing ?? "Medium",
      sceneBreakSuggestion: sceneIntel?.recommendedPageBreak
        ? `Consider a page break after "${sceneIntel.sceneTitle}".`
        : null,
      recommendations,
    };

    return {
      ...page,
      panelCount: recommendedPanelCount,
      intelligence,
      pacing: `${page.pacing} · ${layoutStyle}`,
    };
  });

  const productionSummary =
    input.analysis.intelligence?.productionSummary ??
    `Production plan for ${strategy.label} with ${pages.length} pages.`;

  return {
    ...plan,
    pages,
    pageCount: pages.length,
    productionSummary,
    pacingNotes: `${plan.pacingNotes} Layout recommendations included — edit before approval.`,
  };
}

export function buildPageIntelligenceList(plan: ComicPlanProposal): PageIntelligence[] {
  return plan.pages
    .map((page) => page.intelligence)
    .filter((item): item is PageIntelligence => item != null);
}
