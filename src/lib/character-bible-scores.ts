import {
  CREATURE_ARCHETYPES,
  isHumanoidArchetype,
  type IdentityArchetype,
} from "@/types/identity-archetype";
import {
  EXPRESSION_ROLES,
  TURNAROUND_ROLES,
} from "@/types/character-image";
import type { CharacterBibleScores, AiReadinessTier } from "@/types/context-packet";
import type { ReferenceGraph } from "@/types/reference-graph";
import type { VisualIdentityDescriptors } from "@/types/reference-graph";

function isFilled(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

function clampPercent(value: number): number {
  return Math.round(Math.max(0, Math.min(100, value)));
}

function hasRole(graph: ReferenceGraph, role: string): boolean {
  return graph.nodes.some((node) => node.assetRole === role);
}

function referenceCount(graph: ReferenceGraph): number {
  if (graph.galleryReferenceCount > 0) {
    return graph.galleryReferenceCount;
  }
  return graph.nodes.filter(
    (node) => node.assetRole === "reference" || node.assetRole === "other"
  ).length;
}

function expressionCount(graph: ReferenceGraph): number {
  return graph.nodes.filter((node) => node.nodeType === "expression").length;
}

function turnaroundCount(graph: ReferenceGraph): number {
  return graph.nodes.filter((node) => node.nodeType === "turnaround").length;
}

function tierFromScore(score: number): AiReadinessTier {
  if (score >= 91) return "ai_ready";
  if (score >= 76) return "strong";
  if (score >= 51) return "growing";
  if (score >= 26) return "developing";
  return "started";
}

/** Archetype-weighted reference graph completion (RGC). */
export function computeReferenceGraphCompletion(
  graph: ReferenceGraph
): number {
  const archetype = graph.identityArchetype;
  const refs = referenceCount(graph);
  let score = 0;

  if (hasRole(graph, "canonical")) {
    score += 30;
  }

  if (CREATURE_ARCHETYPES.includes(archetype)) {
    if (refs >= 2) score += 40;
    else if (refs >= 1) score += 20;
    if (turnaroundCount(graph) >= 1) score += 10;
    if (expressionCount(graph) >= 1) score += 5;
    return clampPercent(score);
  }

  if (hasRole(graph, "turnaround_front")) score += 20;

  const needsNeutral =
    archetype === "humanoid_anime" ||
    archetype === "anthropomorphic" ||
    archetype === "humanoid_realistic" ||
    archetype === "humanoid_stylized";

  if (needsNeutral && hasRole(graph, "expression_neutral")) {
    score += 15;
  } else if (
    !needsNeutral &&
    isHumanoidArchetype(archetype) &&
    hasRole(graph, "expression_neutral")
  ) {
    score += 10;
  }

  for (const role of TURNAROUND_ROLES) {
    if (role === "turnaround_front") continue;
    if (hasRole(graph, role)) score += 5;
  }

  const minRefs =
    archetype === "humanoid_anime" || archetype === "humanoid_realistic" ? 2 : 1;
  if (refs >= minRefs) score += 10;
  else if (refs >= 1) score += 5;

  const bonusExpressions = graph.nodes.filter(
    (node) =>
      node.nodeType === "expression" && node.assetRole !== "expression_neutral"
  ).length;
  score += Math.min(10, bonusExpressions * 2);

  return clampPercent(score);
}

function identitySectionScore(descriptors: VisualIdentityDescriptors): number {
  const fields = [
    descriptors.name,
    descriptors.species,
    descriptors.corePersonality,
    descriptors.permanentFeatures,
    descriptors.backstory,
    descriptors.identityArchetype,
  ];
  const filled = fields.filter(isFilled).length;
  return (filled / fields.length) * 100;
}

function referenceSectionScore(graph: ReferenceGraph): number {
  let score = 0;
  if (hasRole(graph, "canonical")) score += 50;
  const refs = referenceCount(graph);
  if (refs >= 2) score += 50;
  else if (refs >= 1) score += 25;
  return score;
}

function turnaroundSectionScore(graph: ReferenceGraph): number {
  const filled = TURNAROUND_ROLES.filter((role) => hasRole(graph, role)).length;
  return (filled / TURNAROUND_ROLES.length) * 100;
}

function expressionSectionScore(graph: ReferenceGraph): number {
  const filled = EXPRESSION_ROLES.filter((role) => hasRole(graph, role)).length;
  return (filled / EXPRESSION_ROLES.length) * 100;
}

function detailsSectionScore(descriptors: VisualIdentityDescriptors): number {
  const fields = [
    descriptors.age,
    descriptors.height,
    descriptors.build,
    descriptors.hair,
    descriptors.eyes,
    descriptors.clothing,
    descriptors.accessories,
    descriptors.scarsTattoos,
    descriptors.otherDetails,
  ];
  const filled = fields.filter(isFilled).length;
  return (filled / fields.length) * 100;
}

/** Five-section bible completion (BBC), archetype-adjusted for creatures. */
export function computeBibleCompletion(
  graph: ReferenceGraph,
  descriptors: VisualIdentityDescriptors
): number {
  const archetype = graph.identityArchetype;
  const identity = identitySectionScore(descriptors);
  const reference = referenceSectionScore(graph);
  const details = detailsSectionScore(descriptors);

  if (CREATURE_ARCHETYPES.includes(archetype)) {
    const creatureReference = referenceSectionScore(graph);
    return clampPercent(
      identity * 0.25 + creatureReference * 0.45 + details * 0.3
    );
  }

  const turnaround = turnaroundSectionScore(graph);
  const expression = expressionSectionScore(graph);
  return clampPercent(
    identity * 0.2 +
      reference * 0.2 +
      turnaround * 0.2 +
      expression * 0.2 +
      details * 0.2
  );
}

function identityDescriptorScore(descriptors: VisualIdentityDescriptors): number {
  const fields = [
    descriptors.species,
    descriptors.corePersonality,
    descriptors.permanentFeatures,
    descriptors.backstory,
  ];
  const filled = fields.filter(isFilled).length;
  return (filled / fields.length) * 100;
}

function versionDescriptorScore(descriptors: VisualIdentityDescriptors): number {
  const fields = [
    descriptors.hair,
    descriptors.eyes,
    descriptors.build,
    descriptors.height,
    descriptors.clothing,
  ];
  const filled = fields.filter(isFilled).length;
  return (filled / fields.length) * 100;
}

/**
 * Identity Strength — visual identity package quality (reference graph + descriptors).
 * CCS-like weighting toward canonical, turnaround, and expressions.
 */
export function computeIdentityStrength(
  graph: ReferenceGraph,
  descriptors: VisualIdentityDescriptors
): number {
  const archetype = graph.identityArchetype;
  const refs = referenceCount(graph);
  const identity = identityDescriptorScore(descriptors);
  const details = versionDescriptorScore(descriptors);

  let canonical = hasRole(graph, "canonical") ? 100 : 0;
  let gallery = refs >= 2 ? 100 : refs >= 1 ? 60 : 0;
  let turnaround = turnaroundSectionScore(graph);
  let expressions = expressionSectionScore(graph);

  if (CREATURE_ARCHETYPES.includes(archetype)) {
    turnaround = refs >= 2 ? 100 : refs >= 1 ? 60 : 0;
    expressions = refs >= 1 ? 50 : 0;
  }

  const score =
    identity * 0.15 +
    gallery * 0.1 +
    canonical * 0.15 +
    turnaround * 0.25 +
    expressions * 0.25 +
    details * 0.1;

  return clampPercent(score);
}

function computeHumanoidAiReadiness(
  graph: ReferenceGraph,
  descriptors: VisualIdentityDescriptors
): number {
  let score = 0;
  if (isFilled(descriptors.name) && isFilled(descriptors.species)) score += 10;
  if (isFilled(descriptors.corePersonality)) score += 10;
  if (hasRole(graph, "canonical")) score += 25;
  if (hasRole(graph, "turnaround_front")) score += 15;
  if (hasRole(graph, "expression_neutral")) score += 15;
  if (
    isFilled(descriptors.hair) &&
    isFilled(descriptors.eyes) &&
    isFilled(descriptors.build)
  ) {
    score += 15;
  } else {
    const detailFields = [descriptors.hair, descriptors.eyes, descriptors.build];
    score += (detailFields.filter(isFilled).length / 3) * 15;
  }
  if (referenceCount(graph) >= 2) score += 10;
  else if (referenceCount(graph) >= 1) score += 5;
  return clampPercent(score);
}

function computeCreatureAiReadiness(
  graph: ReferenceGraph,
  descriptors: VisualIdentityDescriptors
): number {
  let score = 0;
  if (isFilled(descriptors.name) && isFilled(descriptors.species)) score += 15;
  if (hasRole(graph, "canonical")) score += 30;
  const refs = referenceCount(graph);
  if (refs >= 2) score += 30;
  else if (refs >= 1) score += 15;

  const descriptorFields = [
    descriptors.corePersonality,
    descriptors.permanentFeatures,
    descriptors.build,
    descriptors.otherDetails,
    descriptors.backstory,
  ];
  const filled = descriptorFields.filter(isFilled).length;
  score += (filled / descriptorFields.length) * 25;

  return clampPercent(score);
}

export function computeAiReadiness(
  graph: ReferenceGraph,
  descriptors: VisualIdentityDescriptors
): number {
  if (CREATURE_ARCHETYPES.includes(graph.identityArchetype)) {
    return computeCreatureAiReadiness(graph, descriptors);
  }
  return computeHumanoidAiReadiness(graph, descriptors);
}

export function computeCharacterBibleScores(
  graph: ReferenceGraph
): CharacterBibleScores {
  const referenceGraphCompletion = computeReferenceGraphCompletion(graph);
  const bibleCompletion = computeBibleCompletion(graph, graph.descriptors);
  const identityStrength = computeIdentityStrength(graph, graph.descriptors);
  const aiReadiness = computeAiReadiness(graph, graph.descriptors);

  return {
    referenceGraphCompletion,
    bibleCompletion,
    identityStrength,
    aiReadiness,
    aiReadinessTier: tierFromScore(aiReadiness),
  };
}

export function archetypeRequiresExpressions(
  archetype: IdentityArchetype
): boolean {
  return !CREATURE_ARCHETYPES.includes(archetype);
}
