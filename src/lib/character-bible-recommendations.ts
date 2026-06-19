import { CREATURE_ARCHETYPES } from "@/types/identity-archetype";
import { EXPRESSION_ROLES, TURNAROUND_ROLES } from "@/types/character-image";
import { labelForAssetRole } from "@/lib/asset-role-labels";
import {
  recommendationTarget,
  type BibleNavigationTarget,
} from "@/lib/bible-navigation";
import type { ReferenceGraph } from "@/types/reference-graph";

export type BibleSectionId =
  | "identity"
  | "reference"
  | "turnaround"
  | "expressions"
  | "details";

export type BibleRecommendation = {
  id: string;
  priority: number;
  title: string;
  description: string;
  section: BibleSectionId;
  target: BibleNavigationTarget;
};

function isFilled(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

function hasRole(graph: ReferenceGraph, role: string): boolean {
  return graph.nodes.some((node) => node.assetRole === role);
}

function referenceCount(graph: ReferenceGraph): number {
  return graph.nodes.filter(
    (node) => node.assetRole === "reference" || node.assetRole === "other"
  ).length;
}

export function computeBibleRecommendations(
  graph: ReferenceGraph
): BibleRecommendation[] {
  const recs: BibleRecommendation[] = [];
  const { descriptors } = graph;
  const archetype = graph.identityArchetype;
  const isCreature = CREATURE_ARCHETYPES.includes(archetype);
  const refs = referenceCount(graph);

  if (!hasRole(graph, "canonical")) {
    recs.push({
      id: "canonical",
      priority: 100,
      section: "reference",
      target: recommendationTarget("canonical"),
      title: "Add a main portrait",
      description:
        "Your main portrait is the anchor for every reference. Consistency checks and generation start here.",
    });
  }

  if (!isFilled(descriptors.species)) {
    recs.push({
      id: "species",
      priority: 92,
      section: "identity",
      target: recommendationTarget("species"),
      title: "Set species or character type",
      description:
        "Species tells CharID what kind of character you are building and adjusts which reference views matter most.",
    });
  }

  if (!isFilled(descriptors.corePersonality)) {
    recs.push({
      id: "core_personality",
      priority: 88,
      section: "identity",
      target: recommendationTarget("core_personality"),
      title: "Describe core personality",
      description:
        "Personality guides expression choices and helps generated work stay true to who your character is, not just how they look.",
    });
  }

  if (!isCreature) {
    if (!hasRole(graph, "turnaround_front")) {
      recs.push({
        id: "turnaround_front",
        priority: 85,
        section: "turnaround",
        target: recommendationTarget("turnaround_front"),
        title: "Add front turnaround view",
        description:
          "A clear front view is the strongest multi-angle signal for keeping your character on-model.",
      });
    }

    for (const role of TURNAROUND_ROLES) {
      if (role === "turnaround_front") continue;
      if (!hasRole(graph, role)) {
        recs.push({
          id: role,
          priority: 60,
          section: "turnaround",
          target: recommendationTarget(role),
          title: `Add ${labelForAssetRole(role).toLowerCase()}`,
          description:
            "More turnaround views mean fewer guesswork angles — your character stays consistent from every side.",
        });
      }
    }

    if (!hasRole(graph, "expression_neutral")) {
      recs.push({
        id: "expression_neutral",
        priority: 82,
        section: "expressions",
        target: recommendationTarget("expression_neutral"),
        title: "Add neutral expression",
        description:
          "Neutral is the baseline expression. Other faces build from this starting point.",
      });
    }

    for (const role of EXPRESSION_ROLES) {
      if (role === "expression_neutral") continue;
      if (!hasRole(graph, role)) {
        recs.push({
          id: role,
          priority: 45,
          section: "expressions",
          target: recommendationTarget(role),
          title: `Add ${labelForAssetRole(role).toLowerCase()} expression`,
          description:
            "Each expression you add widens the emotional range your character can hit without drifting off-model.",
        });
      }
    }
  }

  const minRefs =
    isCreature ||
    archetype === "humanoid_anime" ||
    archetype === "humanoid_realistic"
      ? 2
      : 1;

  if (refs < minRefs) {
    recs.push({
      id: "reference_gallery",
      priority: isCreature ? 90 : 75,
      section: "reference",
      target: recommendationTarget("reference_gallery"),
      title: `Add ${minRefs - refs} more reference image${minRefs - refs > 1 ? "s" : ""}`,
      description: isCreature
        ? "Full-body reference images help CharID understand your creature's proportions and silhouette."
        : "Supporting reference images fill in outfit details, props, and variations that a single portrait cannot cover.",
    });
  }

  if (!isFilled(descriptors.hair) || !isFilled(descriptors.eyes)) {
    recs.push({
      id: "visual_descriptors",
      priority: 72,
      section: "details",
      target: recommendationTarget("visual_descriptors"),
      title: "Fill in hair and eyes",
      description:
        "These details pair with your reference images to complete how your character looks on the page.",
    });
  }

  if (!isFilled(descriptors.build) && !isFilled(descriptors.height)) {
    recs.push({
      id: "body_descriptors",
      priority: 55,
      section: "details",
      target: recommendationTarget("body_descriptors"),
      title: "Add build or height details",
      description:
        "Body descriptors help distinguish your character's silhouette when references alone are ambiguous.",
    });
  }

  if (!isFilled(descriptors.backstory)) {
    recs.push({
      id: "backstory",
      priority: 40,
      section: "identity",
      target: recommendationTarget("backstory"),
      title: "Write a backstory",
      description:
        "Backstory travels with your character across stories and projects.",
    });
  }

  return recs.sort((a, b) => b.priority - a.priority).slice(0, 5);
}
