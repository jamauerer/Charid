import type { PanelPlanItem } from "@/types/ai/comic-planning";
import type {
  CameraRecommendation,
  DensityLevel,
  PanelIntelligence,
} from "@/types/ai/production-intelligence";

const CAMERAS: CameraRecommendation[] = [
  "Wide",
  "Medium",
  "Close-up",
  "Medium",
  "Low Angle",
  "High Angle",
  "Extreme Wide",
  "Overhead",
];

function cameraForIndex(index: number, total: number): CameraRecommendation {
  if (index === 0) return "Wide";
  if (index === total - 1 && total > 2) return "Medium";
  return CAMERAS[index % CAMERAS.length] ?? "Medium";
}

function dialogueDensityForPanel(text: string): DensityLevel {
  if (text.length > 80) return "High";
  if (text.length > 20) return "Medium";
  return "Low";
}

export function enrichPanelPlan(
  panels: PanelPlanItem[],
  input: { pageTitle: string; focusCharacter?: string | null }
): PanelPlanItem[] {
  return panels.map((panel, index) => {
    const cameraRecommendation = cameraForIndex(index, panels.length);
    const dialogueDensity = dialogueDensityForPanel(panel.dialogueSuggestion);
    const visualImportance: DensityLevel =
      index === 0 || index === panels.length - 1 ? "High" : "Medium";

    const recommendations: PanelIntelligence["recommendations"] = [];
    if (dialogueDensity === "High") {
      recommendations.push({
        explanation: "Dialogue-heavy beat — close framing keeps faces readable.",
      });
    }
    if (cameraRecommendation === "Wide" && index === 0) {
      recommendations.push({
        explanation: "Opening panel — wide shot establishes location and context.",
      });
    }
    if (cameraRecommendation === "Low Angle") {
      recommendations.push({
        explanation: "Low angle adds drama and emphasizes character presence.",
      });
    }

    const intelligence: PanelIntelligence = {
      panelIndex: panel.panelIndex,
      cameraRecommendation,
      recommendedEmotion: panel.emotion || "Story-appropriate",
      focusCharacter: input.focusCharacter ?? null,
      dialogueDensity,
      visualImportance,
      recommendations,
    };

    return {
      ...panel,
      cameraAngle: cameraRecommendation,
      intelligence,
    };
  });
}

export function templateIntelligentPanelPlan(
  pageTitle: string,
  panelCount: number,
  focusCharacter?: string | null
): PanelPlanItem[] {
  const base = Array.from({ length: panelCount }, (_, index) => ({
    panelIndex: index + 1,
    description: `Panel ${index + 1} of "${pageTitle}" — establish action or dialogue.`,
    cameraAngle: cameraForIndex(index, panelCount),
    composition: "Rule of thirds",
    characterPlacement: focusCharacter ? `${focusCharacter} foreground` : "Center foreground",
    emotion: "Neutral / story-appropriate",
    lighting: "Natural daylight",
    dialogueSuggestion: "",
    captionSuggestion: index === 0 ? "Scene opens…" : "",
    sfxSuggestion: "",
  }));
  return enrichPanelPlan(base, { pageTitle, focusCharacter });
}
