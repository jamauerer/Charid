import { assembleWorldReferenceGraph } from "@/lib/assemble-world-reference-graph";
import { computeWorldBibleScores } from "@/lib/world-bible-scores";
import type { World } from "@/types/world";
import type { WorldBible } from "@/types/world-bible";
import type { WorldImageWithUrl } from "@/types/world-image";
import type { WorldImageSlotAssignment } from "@/types/world-image-slot";
import type { WorldReferenceGraphNode } from "@/types/world-reference-graph";
import {
  worldLocationFromNode,
  worldReferenceGraphNodeToAsset,
  type WorldContextPacket,
} from "@/types/world-context-packet";

function nodesByRoles(
  nodes: WorldReferenceGraphNode[],
  roles: string[]
): WorldReferenceGraphNode[] {
  return nodes.filter((node) => roles.includes(node.assetRole));
}

function nodesByRolePrefix(
  nodes: WorldReferenceGraphNode[],
  prefix: string
): WorldReferenceGraphNode[] {
  return nodes.filter(
    (node) => node.assetRole === prefix || node.assetRole.startsWith(`${prefix}_`)
  );
}

export function assembleWorldContextPacket(
  world: World,
  bible: WorldBible,
  images: WorldImageWithUrl[],
  slotAssignments: WorldImageSlotAssignment[] = [],
  characterIds: string[] = []
): WorldContextPacket {
  const graph = assembleWorldReferenceGraph(
    world,
    bible,
    images,
    slotAssignments
  );
  const scores = computeWorldBibleScores(graph);
  const { descriptors } = graph;

  const locationNodes = graph.nodes.filter(
    (node) =>
      node.nodeType === "location" &&
      (node.assetRole === "location" || node.assetRole.startsWith("location_"))
  );

  const mapNodes = nodesByRoles(graph.nodes, ["canonical_map"]);
  const environmentNodes = nodesByRoles(graph.nodes, ["environment"]);
  const architectureNodes = [
    ...nodesByRoles(graph.nodes, ["architecture"]),
    ...nodesByRolePrefix(graph.nodes, "culture"),
  ];
  const moodNodes = nodesByRoles(graph.nodes, ["mood_board"]);
  const canonicalReferenceNode = graph.nodes.find(
    (node) => node.assetRole === "canonical_reference"
  );
  const galleryNodes = graph.nodes.filter(
    (node) => node.assetRole === "reference" || node.assetRole === "other"
  );

  return {
    kind: "world",
    schemaVersion: "1.0",
    assembledAt: new Date().toISOString(),
    userId: world.user_id,
    worldId: world.id,
    bibleId: bible.world_id,
    versionLabel: bible.version_label,
    identity: {
      name: descriptors.name,
      slug: descriptors.slug,
      description: descriptors.description,
      genre: descriptors.genre,
      tone: descriptors.tone,
      themes: descriptors.themes,
      overview: descriptors.overview,
    },
    canon: {
      rules: descriptors.rules,
      era: descriptors.era,
      climate: descriptors.climate,
    },
    locations: {
      references: locationNodes.map(worldLocationFromNode),
      descriptions: descriptors.overview,
    },
    assets: {
      maps: mapNodes.map(worldReferenceGraphNodeToAsset),
      environmentReferences: environmentNodes.map(worldReferenceGraphNodeToAsset),
      architectureReferences: architectureNodes.map(
        worldReferenceGraphNodeToAsset
      ),
      moodBoards: moodNodes.map(worldReferenceGraphNodeToAsset),
      canonicalReference: canonicalReferenceNode
        ? worldReferenceGraphNodeToAsset(canonicalReferenceNode)
        : null,
      gallery: galleryNodes.map(worldReferenceGraphNodeToAsset),
    },
    referenceGraph: {
      nodes: graph.nodes.map(worldReferenceGraphNodeToAsset),
      canonicalMapId: graph.canonicalMapImageId,
      canonicalReferenceId: graph.canonicalReferenceImageId,
    },
    scores: {
      worldCompletion: scores.worldCompletion,
      worldConsistency: scores.worldConsistency,
      aiReadiness: scores.aiReadiness,
      aiReadinessTier: scores.aiReadinessTier,
      referenceGraphCompletion: scores.referenceGraphCompletion,
    },
    roster: {
      characterIds,
    },
    derived: null,
  };
}
