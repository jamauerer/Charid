import type { SceneIntelligence } from "@/types/ai/production-intelligence";
import {
  inferDensity,
  inferPacing,
  scenePurposeForIndex,
} from "@/lib/ai/production-intelligence/heuristics";
import { getProjectTypeStrategy } from "@/lib/ai/production-intelligence/project-type";
import type { AiProjectTypeId } from "@/types/ai/core";
import type { StoryIntelligence } from "@/types/ai/production-intelligence";

export function analyzeScenes(input: {
  scenes: { id: string; title: string; summary?: string }[];
  storyIntelligence: StoryIntelligence;
  projectType: AiProjectTypeId;
}): SceneIntelligence[] {
  const strategy = getProjectTypeStrategy(input.projectType);
  const total = input.scenes.length;

  return input.scenes.map((scene, index) => {
    const text = `${scene.title} ${scene.summary ?? ""}`;
    const dialogueLoad = inferDensity(text);
    const actionLoad = inferDensity(text, 1);
    const purpose = scenePurposeForIndex(index, total);
    const visualComplexity: SceneIntelligence["visualComplexity"] =
      actionLoad === "High" ? "High" : dialogueLoad === "High" ? "Medium" : "Low";
    const sceneImportance: SceneIntelligence["sceneImportance"] =
      purpose === "Climax" || purpose === "Introduction" ? "High" : "Medium";

    let estimatedPanels = strategy.defaultPanelsPerPage;
    if (dialogueLoad === "High") estimatedPanels = Math.min(6, estimatedPanels + 2);
    if (purpose === "Climax") estimatedPanels = Math.max(estimatedPanels, 5);
    if (purpose === "Introduction") estimatedPanels = Math.max(3, estimatedPanels - 1);

    const recommendations: SceneIntelligence["recommendations"] = [];
    if (dialogueLoad === "High") {
      recommendations.push({
        explanation:
          "This scene is dialogue-heavy, so six smaller panels are recommended.",
      });
    }
    if (purpose === "Climax") {
      recommendations.push({
        explanation: "This moment appears climactic, so a splash page is recommended.",
      });
    }
    if (actionLoad === "High") {
      recommendations.push({
        explanation: "High action load — favor wider panels and dynamic composition.",
      });
    }

    return {
      sceneId: scene.id,
      sceneTitle: scene.title,
      purpose,
      estimatedPanels,
      recommendedPacing: inferPacing(total, strategy.pagesPerScene),
      dialogueLoad,
      actionLoad,
      visualComplexity,
      sceneImportance,
      recommendedPageBreak: index > 0 && (purpose === "Climax" || purpose === "Transition"),
      recommendations,
    };
  });
}

export async function runSceneIntelligenceJob(input: {
  userId: string;
  projectId: string;
  storyId: string;
  scenes: { id: string; title: string; summary?: string }[];
  storyIntelligence: StoryIntelligence;
  projectType: AiProjectTypeId;
}): Promise<{ scenes: SceneIntelligence[]; jobId: string }> {
  const scenes = analyzeScenes(input);
  return { scenes, jobId: "intelligence-scene" };
}
