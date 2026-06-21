import { labelForStoryAssetRole } from "@/lib/story-asset-role-labels";
import {
  storyRecommendationTarget,
  type StoryNavigationTarget,
  type StorySectionId,
} from "@/lib/story-bible-navigation";
import { hasStoryGraphRole } from "@/lib/story-slot-assignments";
import type { StoryReferenceGraph } from "@/types/story-reference-graph";
import { STORY_CORE_SLOT_ROLES } from "@/types/story-image";

export type StoryBibleRecommendation = {
  id: string;
  priority: number;
  title: string;
  description: string;
  section: StorySectionId;
  target: StoryNavigationTarget;
};

function isFilled(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

export function computeStoryBibleRecommendations(
  graph: StoryReferenceGraph
): StoryBibleRecommendation[] {
  const recs: StoryBibleRecommendation[] = [];
  const { descriptors } = graph;

  if (!isFilled(descriptors.summary)) {
    recs.push({
      id: "summary",
      priority: 100,
      section: "overview",
      target: storyRecommendationTarget("overview", undefined, "story-summary"),
      title: "Write a story summary",
      description:
        "A clear summary anchors every scene, character beat, and reference you add later.",
    });
  }

  if (!hasStoryGraphRole(graph.nodes, "cover")) {
    recs.push({
      id: "cover",
      priority: 95,
      section: "assets",
      target: storyRecommendationTarget("assets", "story-reference-upload"),
      title: "Add a cover image",
      description:
        "Upload an image first, then assign the Cover role. Your cover sets the visual tone for the whole story.",
    });
  }

  if (!isFilled(descriptors.themes) || !isFilled(descriptors.tone)) {
    recs.push({
      id: "themes_tone",
      priority: 88,
      section: "overview",
      target: storyRecommendationTarget("overview"),
      title: "Set themes and tone",
      description:
        "Themes and tone keep your story emotionally consistent across chapters and scenes.",
    });
  }

  if (!isFilled(descriptors.timeline)) {
    recs.push({
      id: "timeline",
      priority: 82,
      section: "timeline",
      target: storyRecommendationTarget("timeline", undefined, "story-timeline"),
      title: "Outline your timeline",
      description:
        "When events happen matters as much as what happens — timeline notes prevent continuity drift.",
    });
  }

  if (!isFilled(descriptors.majorEvents)) {
    recs.push({
      id: "major_events",
      priority: 78,
      section: "major_events",
      target: storyRecommendationTarget(
        "major_events",
        undefined,
        "story-major-events"
      ),
      title: "Document major events",
      description:
        "Key plot beats become the backbone for scene references and chapter planning.",
    });
  }

  if (!hasStoryGraphRole(graph.nodes, "scene_reference")) {
    recs.push({
      id: "scene_reference",
      priority: 75,
      section: "assets",
      target: storyRecommendationTarget("assets", "story-reference-upload"),
      title: `Assign a ${labelForStoryAssetRole("scene_reference").toLowerCase()}`,
      description:
        "Scene references visualize pivotal moments — upload first, then assign the role.",
    });
  }

  if (!isFilled(descriptors.keyCharacters)) {
    recs.push({
      id: "key_characters",
      priority: 70,
      section: "characters",
      target: storyRecommendationTarget("characters"),
      title: "Note key characters",
      description:
        "List the characters who drive this story, then add them from Characters above.",
    });
  }

  if (!isFilled(descriptors.keyLocations)) {
    recs.push({
      id: "key_locations",
      priority: 65,
      section: "locations",
      target: storyRecommendationTarget(
        "locations",
        undefined,
        "story-key-locations"
      ),
      title: "Describe key locations",
      description:
        "Where scenes unfold helps you pick the right reference images and mood boards.",
    });
  }

  for (const role of STORY_CORE_SLOT_ROLES) {
    if (role === "cover" || role === "scene_reference" || role === "reference") {
      continue;
    }
    if (!hasStoryGraphRole(graph.nodes, role)) {
      recs.push({
        id: role,
        priority: 50,
        section: "assets",
        target: storyRecommendationTarget("assets", "story-reference-upload"),
        title: `Add ${labelForStoryAssetRole(role).toLowerCase()}`,
        description:
          "Upload images to your gallery, then assign roles — one asset can fill multiple slots.",
      });
    }
  }

  if (graph.galleryReferenceCount < 2) {
    recs.push({
      id: "reference_gallery",
      priority: 60,
      section: "assets",
      target: storyRecommendationTarget("assets", "story-reference-upload"),
      title: "Build your reference gallery",
      description:
        "More reference images mean stronger visual consistency when you create scenes and chapters.",
    });
  }

  return recs.sort((a, b) => b.priority - a.priority).slice(0, 5);
}
