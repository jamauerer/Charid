import { STORY_CORE_SLOT_ROLES } from "@/types/story-image";
import type { AiReadinessTier } from "@/types/context-packet";
import type { StoryBibleScores } from "@/types/story-context-packet";
import type {
  StoryReferenceGraph,
  StoryCanonDescriptors,
} from "@/types/story-reference-graph";
import {
  hasStoryGraphRole,
  hasStoryGraphRolePrefix,
} from "@/lib/story-slot-assignments";

function isFilled(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

function clampPercent(value: number): number {
  return Math.round(Math.max(0, Math.min(100, value)));
}

function tierFromScore(score: number): AiReadinessTier {
  if (score >= 91) return "ai_ready";
  if (score >= 76) return "strong";
  if (score >= 51) return "growing";
  if (score >= 26) return "developing";
  return "started";
}

function referenceCount(graph: StoryReferenceGraph): number {
  return graph.galleryReferenceCount;
}

function identityFieldScore(descriptors: StoryCanonDescriptors): number {
  const fields = [descriptors.title, descriptors.summary];
  const filled = fields.filter(isFilled).length;
  return (filled / fields.length) * 100;
}

function canonFieldScore(descriptors: StoryCanonDescriptors): number {
  const fields = [
    descriptors.themes,
    descriptors.tone,
    descriptors.timeline,
    descriptors.majorEvents,
    descriptors.keyCharacters,
    descriptors.keyLocations,
    descriptors.notes,
  ];
  const filled = fields.filter(isFilled).length;
  return (filled / fields.length) * 100;
}

function assetSectionScore(graph: StoryReferenceGraph): number {
  let score = 0;
  if (hasStoryGraphRole(graph.nodes, "cover")) score += 30;
  if (hasStoryGraphRole(graph.nodes, "scene_reference")) score += 20;
  if (hasStoryGraphRole(graph.nodes, "mood_board")) score += 15;
  if (hasStoryGraphRole(graph.nodes, "storyboard")) score += 15;
  const refs = referenceCount(graph);
  if (refs >= 2) score += 20;
  else if (refs >= 1) score += 10;
  return clampPercent(score);
}

function sceneSectionScore(graph: StoryReferenceGraph): number {
  if (hasStoryGraphRole(graph.nodes, "scene_reference")) return 100;
  if (hasStoryGraphRolePrefix(graph.nodes, "scene")) return 70;
  return 0;
}

function moodSectionScore(graph: StoryReferenceGraph): number {
  return hasStoryGraphRole(graph.nodes, "mood_board") ? 100 : 0;
}

function storyboardSectionScore(graph: StoryReferenceGraph): number {
  if (hasStoryGraphRole(graph.nodes, "storyboard")) return 100;
  if (hasStoryGraphRolePrefix(graph.nodes, "storyboard")) return 70;
  return 0;
}

function chapterSectionScore(graph: StoryReferenceGraph): number {
  if (hasStoryGraphRole(graph.nodes, "chapter_reference")) return 100;
  if (hasStoryGraphRolePrefix(graph.nodes, "chapter")) return 70;
  return 0;
}

/** Story canon text + metadata completion. */
export function computeStoryCompletion(graph: StoryReferenceGraph): number {
  const { descriptors } = graph;
  const identity = identityFieldScore(descriptors);
  const canon = canonFieldScore(descriptors);
  const assets = assetSectionScore(graph);
  const scene = sceneSectionScore(graph);
  const mood = moodSectionScore(graph);
  const storyboard = storyboardSectionScore(graph);
  const chapter = chapterSectionScore(graph);

  return clampPercent(
    identity * 0.2 +
      canon * 0.25 +
      assets * 0.2 +
      scene * 0.15 +
      mood * 0.1 +
      storyboard * 0.05 +
      chapter * 0.05
  );
}

/** Reference graph slot coverage. */
export function computeStoryReferenceGraphCompletion(
  graph: StoryReferenceGraph
): number {
  let score = 0;

  if (hasStoryGraphRole(graph.nodes, "cover")) score += 25;
  if (hasStoryGraphRole(graph.nodes, "scene_reference")) score += 20;
  if (hasStoryGraphRole(graph.nodes, "mood_board")) score += 15;
  if (hasStoryGraphRole(graph.nodes, "storyboard")) score += 15;
  if (hasStoryGraphRole(graph.nodes, "chapter_reference")) score += 10;

  const refs = referenceCount(graph);
  if (refs >= 2) score += 15;
  else if (refs >= 1) score += 8;

  const extendedNodes = graph.nodes.filter((node) => node.nodeType === "extended");
  score += Math.min(5, extendedNodes.length * 2);

  return clampPercent(score);
}

/** Visual + textual reference package quality. */
export function computeStoryConsistency(graph: StoryReferenceGraph): number {
  const { descriptors } = graph;
  const identity = identityFieldScore(descriptors);
  const canon = canonFieldScore(descriptors);
  const cover = hasStoryGraphRole(graph.nodes, "cover") ? 100 : 0;
  const scene = sceneSectionScore(graph);
  const mood = moodSectionScore(graph);
  const storyboard = storyboardSectionScore(graph);
  const chapter = chapterSectionScore(graph);
  const gallery =
    referenceCount(graph) >= 2 ? 100 : referenceCount(graph) >= 1 ? 60 : 0;

  return clampPercent(
    identity * 0.15 +
      canon * 0.2 +
      cover * 0.15 +
      scene * 0.15 +
      mood * 0.1 +
      storyboard * 0.1 +
      chapter * 0.05 +
      gallery * 0.1
  );
}

export function computeStoryAiReadiness(graph: StoryReferenceGraph): number {
  const { descriptors } = graph;
  let score = 0;

  if (isFilled(descriptors.title) && isFilled(descriptors.summary)) score += 15;
  else if (isFilled(descriptors.title)) score += 8;

  if (isFilled(descriptors.themes) && isFilled(descriptors.tone)) score += 10;
  if (isFilled(descriptors.timeline)) score += 10;
  if (isFilled(descriptors.majorEvents)) score += 10;

  if (hasStoryGraphRole(graph.nodes, "cover")) score += 20;
  if (hasStoryGraphRole(graph.nodes, "scene_reference")) score += 15;
  if (hasStoryGraphRole(graph.nodes, "mood_board")) score += 5;
  if (hasStoryGraphRole(graph.nodes, "storyboard")) score += 5;
  if (hasStoryGraphRole(graph.nodes, "chapter_reference")) score += 5;

  const refs = referenceCount(graph);
  if (refs >= 2) score += 10;
  else if (refs >= 1) score += 5;

  const canonFields = [
    descriptors.keyCharacters,
    descriptors.keyLocations,
    descriptors.notes,
  ];
  score += (canonFields.filter(isFilled).length / canonFields.length) * 5;

  return clampPercent(score);
}

export function computeStoryBibleScores(
  graph: StoryReferenceGraph
): StoryBibleScores {
  const referenceGraphCompletion = computeStoryReferenceGraphCompletion(graph);
  const storyCompletion = computeStoryCompletion(graph);
  const storyConsistency = computeStoryConsistency(graph);
  const aiReadiness = computeStoryAiReadiness(graph);

  return {
    referenceGraphCompletion,
    storyCompletion,
    storyConsistency,
    aiReadiness,
    aiReadinessTier: tierFromScore(aiReadiness),
  };
}

export function coreStorySlotRolesFilled(
  graph: StoryReferenceGraph
): Record<(typeof STORY_CORE_SLOT_ROLES)[number], boolean> {
  const result = {} as Record<(typeof STORY_CORE_SLOT_ROLES)[number], boolean>;
  for (const role of STORY_CORE_SLOT_ROLES) {
    result[role] = hasStoryGraphRole(graph.nodes, role);
  }
  return result;
}
