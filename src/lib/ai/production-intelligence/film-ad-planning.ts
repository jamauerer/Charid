import type {
  AdvertisementPlanningPreview,
  FilmPlanningPreview,
} from "@/types/ai/production-intelligence";
import type { SceneIntelligence, StoryIntelligence } from "@/types/ai/production-intelligence";

export function buildFilmPlanningPreview(input: {
  storyTitle: string;
  scenes: SceneIntelligence[];
  storyIntelligence: StoryIntelligence;
}): FilmPlanningPreview {
  const shotCount = input.scenes.reduce((sum, scene) => sum + Math.max(3, scene.estimatedPanels), 0);
  const climax = input.scenes.find((s) => s.purpose === "Climax");

  return {
    sceneDuration: input.storyIntelligence.estimatedFilmRuntime,
    estimatedShotCount: shotCount,
    recommendedKeyframes: {
      firstFrame: `Establish "${input.scenes[0]?.sceneTitle ?? input.storyTitle}" — wide opening.`,
      lastFrame: `Resolve "${input.scenes[input.scenes.length - 1]?.sceneTitle ?? "finale"}" — emotional close.`,
      intermediateFrames: climax
        ? [`Climax beat: "${climax.sceneTitle}" — dynamic motion frame.`]
        : [],
    },
    cameraMotionSuggestion:
      input.storyIntelligence.actionDensity === "High"
        ? "Tracking shots and motivated camera moves for action beats."
        : "Slow push-ins and stable framing for dialogue-driven scenes.",
    recommendations: [
      {
        explanation:
          "Film planning metadata only — future integration with Kling, Runway, and Veo.",
      },
    ],
  };
}

export function buildAdvertisementPlanningPreview(input: {
  storyTitle: string;
  storyIntelligence: StoryIntelligence;
}): AdvertisementPlanningPreview {
  const minimalist = input.storyIntelligence.dialogueDensity === "Low";

  return {
    campaignGoal: "Character-driven brand storytelling with visual consistency.",
    targetAudience: "Audience aligned with story tone and character appeal.",
    primaryProduct: input.storyTitle,
    supportingAssets: ["Hero character", "Key environment", "Brand palette"],
    recommendedLayoutStyle: minimalist ? "Minimalist hero focus" : "Narrative multi-panel sequence",
    recommendedVisualHierarchy: "Product and character first, environment second, CTA last.",
    recommendedCallToAction: "Discover the story — learn more.",
    recommendations: [
      {
        explanation: minimalist
          ? "This advertisement focuses on a premium product, so a minimalist layout is recommended."
          : "Narrative beats support a story-led campaign with character consistency.",
      },
    ],
  };
}
