import { WORLD_CORE_SLOT_ROLES } from "@/types/world-image";
import type { AiReadinessTier } from "@/types/context-packet";
import type { WorldBibleScores } from "@/types/world-context-packet";
import type {
  WorldReferenceGraph,
  WorldCanonDescriptors,
} from "@/types/world-reference-graph";
import {
  hasWorldGraphRole,
  hasWorldGraphRolePrefix,
} from "@/lib/world-slot-assignments";

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

function referenceCount(graph: WorldReferenceGraph): number {
  return graph.galleryReferenceCount;
}

function identityFieldScore(descriptors: WorldCanonDescriptors): number {
  const fields = [
    descriptors.name,
    descriptors.description,
    descriptors.genre,
    descriptors.tone,
    descriptors.themes,
    descriptors.overview,
  ];
  const filled = fields.filter(isFilled).length;
  return (filled / fields.length) * 100;
}

function canonFieldScore(descriptors: WorldCanonDescriptors): number {
  const fields = [descriptors.rules, descriptors.era, descriptors.climate];
  const filled = fields.filter(isFilled).length;
  return (filled / fields.length) * 100;
}

function assetSectionScore(graph: WorldReferenceGraph): number {
  let score = 0;
  if (hasWorldGraphRole(graph.nodes, "canonical_map")) score += 25;
  if (hasWorldGraphRole(graph.nodes, "canonical_reference")) score += 25;
  const refs = referenceCount(graph);
  if (refs >= 2) score += 50;
  else if (refs >= 1) score += 25;
  return score;
}

function locationSectionScore(graph: WorldReferenceGraph): number {
  const coreLocation = hasWorldGraphRole(graph.nodes, "location") ? 1 : 0;
  const extendedLocations = graph.nodes.filter(
    (node) =>
      node.nodeType === "location" && node.assetRole.startsWith("location_")
  ).length;
  const filled = Math.min(1, coreLocation) + Math.min(2, extendedLocations);
  return (filled / 3) * 100;
}

function moodSectionScore(graph: WorldReferenceGraph): number {
  return hasWorldGraphRole(graph.nodes, "mood_board") ? 100 : 0;
}

function environmentSectionScore(graph: WorldReferenceGraph): number {
  return hasWorldGraphRole(graph.nodes, "environment") ? 100 : 0;
}

function architectureSectionScore(graph: WorldReferenceGraph): number {
  let score = 0;
  if (hasWorldGraphRole(graph.nodes, "architecture")) score += 70;
  if (hasWorldGraphRolePrefix(graph.nodes, "culture")) score += 30;
  return clampPercent(score);
}

/** World canon text + metadata completion. */
export function computeWorldCompletion(
  graph: WorldReferenceGraph
): number {
  const { descriptors } = graph;
  const identity = identityFieldScore(descriptors);
  const canon = canonFieldScore(descriptors);
  const assets = assetSectionScore(graph) * 0.5;
  const location = locationSectionScore(graph);
  const mood = moodSectionScore(graph);
  const environment = environmentSectionScore(graph);
  const architecture = architectureSectionScore(graph);

  return clampPercent(
    identity * 0.25 +
      canon * 0.15 +
      assets * 0.2 +
      location * 0.15 +
      mood * 0.1 +
      environment * 0.075 +
      architecture * 0.075
  );
}

/** Reference graph slot coverage (RGC equivalent). */
export function computeWorldReferenceGraphCompletion(
  graph: WorldReferenceGraph
): number {
  let score = 0;

  if (hasWorldGraphRole(graph.nodes, "canonical_map")) score += 25;
  if (hasWorldGraphRole(graph.nodes, "canonical_reference")) score += 15;
  if (
    hasWorldGraphRole(graph.nodes, "location") ||
    hasWorldGraphRolePrefix(graph.nodes, "location")
  ) {
    score += 15;
  }
  if (hasWorldGraphRole(graph.nodes, "environment")) score += 10;
  if (hasWorldGraphRole(graph.nodes, "architecture")) score += 10;
  if (hasWorldGraphRole(graph.nodes, "mood_board")) score += 10;

  const refs = referenceCount(graph);
  if (refs >= 2) score += 15;
  else if (refs >= 1) score += 8;

  const extendedNodes = graph.nodes.filter((node) => node.nodeType === "extended");
  score += Math.min(5, extendedNodes.length * 2);

  return clampPercent(score);
}

/** Visual + textual reference package quality. */
export function computeWorldConsistency(
  graph: WorldReferenceGraph
): number {
  const { descriptors } = graph;
  const identity = identityFieldScore(descriptors);
  const canon = canonFieldScore(descriptors);
  const canonicalMap = hasWorldGraphRole(graph.nodes, "canonical_map") ? 100 : 0;
  const canonicalRef = hasWorldGraphRole(graph.nodes, "canonical_reference")
    ? 100
    : 0;
  const location = locationSectionScore(graph);
  const mood = moodSectionScore(graph);
  const environment = environmentSectionScore(graph);
  const architecture = architectureSectionScore(graph);
  const gallery =
    referenceCount(graph) >= 2 ? 100 : referenceCount(graph) >= 1 ? 60 : 0;

  return clampPercent(
    identity * 0.15 +
      canon * 0.1 +
      canonicalMap * 0.15 +
      canonicalRef * 0.1 +
      location * 0.15 +
      mood * 0.1 +
      environment * 0.1 +
      architecture * 0.1 +
      gallery * 0.05
  );
}

export function computeWorldAiReadiness(
  graph: WorldReferenceGraph
): number {
  const { descriptors } = graph;
  let score = 0;

  if (isFilled(descriptors.name) && isFilled(descriptors.overview)) score += 15;
  else if (isFilled(descriptors.name)) score += 8;

  if (isFilled(descriptors.genre) && isFilled(descriptors.tone)) score += 10;
  if (isFilled(descriptors.rules)) score += 10;

  if (hasWorldGraphRole(graph.nodes, "canonical_map")) score += 20;
  if (hasWorldGraphRole(graph.nodes, "canonical_reference")) score += 15;

  if (
    hasWorldGraphRole(graph.nodes, "location") ||
    hasWorldGraphRolePrefix(graph.nodes, "location")
  ) {
    score += 10;
  }

  if (hasWorldGraphRole(graph.nodes, "environment")) score += 5;
  if (hasWorldGraphRole(graph.nodes, "mood_board")) score += 5;
  if (hasWorldGraphRole(graph.nodes, "architecture")) score += 5;

  const refs = referenceCount(graph);
  if (refs >= 2) score += 10;
  else if (refs >= 1) score += 5;

  const canonFields = [descriptors.era, descriptors.climate, descriptors.themes];
  score += (canonFields.filter(isFilled).length / canonFields.length) * 5;

  return clampPercent(score);
}

export function computeWorldBibleScores(
  graph: WorldReferenceGraph
): WorldBibleScores {
  const referenceGraphCompletion = computeWorldReferenceGraphCompletion(graph);
  const worldCompletion = computeWorldCompletion(graph);
  const worldConsistency = computeWorldConsistency(graph);
  const aiReadiness = computeWorldAiReadiness(graph);

  return {
    referenceGraphCompletion,
    worldCompletion,
    worldConsistency,
    aiReadiness,
    aiReadinessTier: tierFromScore(aiReadiness),
  };
}

export function coreWorldSlotRolesFilled(
  graph: WorldReferenceGraph
): Record<(typeof WORLD_CORE_SLOT_ROLES)[number], boolean> {
  const result = {} as Record<(typeof WORLD_CORE_SLOT_ROLES)[number], boolean>;
  for (const role of WORLD_CORE_SLOT_ROLES) {
    result[role] = hasWorldGraphRole(graph.nodes, role);
  }
  return result;
}
