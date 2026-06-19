import { WORLD_CORE_SLOT_ROLES } from "@/types/world-image";
import { isWorldSlotRole } from "@/types/world-image";
import type { WorldImageWithUrl } from "@/types/world-image";
import type { WorldImageSlotAssignment } from "@/types/world-image-slot";
import type { World } from "@/types/world";
import type { WorldBible } from "@/types/world-bible";
import type {
  WorldReferenceGraph,
  WorldReferenceGraphNode,
  WorldReferenceGraphNodeType,
  WorldCanonDescriptors,
} from "@/types/world-reference-graph";
import { buildWorldSlotAssignmentMap } from "@/lib/world-slot-assignments";

const CORE_ROLE_ORDER = [...WORLD_CORE_SLOT_ROLES];

function nodeTypeFromRole(role: string): WorldReferenceGraphNodeType {
  if (role === "canonical_map" || role === "canonical_reference") {
    return "canonical";
  }
  if (role === "location" || role.startsWith("location_")) {
    return "location";
  }
  if (role === "mood_board" || role.startsWith("atmosphere_")) {
    return "mood";
  }
  if (role === "environment") {
    return "environment";
  }
  if (role === "architecture" || role.startsWith("culture_")) {
    return "architecture";
  }
  if (role === "reference" || role === "other") {
    return "reference";
  }
  if (
    role.startsWith("faction_") ||
    role.startsWith("region_") ||
    role.startsWith("nation_") ||
    role.startsWith("species_") ||
    role.startsWith("organization_")
  ) {
    return "extended";
  }
  return "extended";
}

function slotKeyFromRole(role: string): string | null {
  if (isWorldSlotRole(role)) return role;
  if (role.startsWith("location_")) return role;
  return null;
}

function roleSortPriority(role: string): number {
  const coreIndex = CORE_ROLE_ORDER.indexOf(
    role as (typeof CORE_ROLE_ORDER)[number]
  );
  if (coreIndex >= 0) return coreIndex;
  if (role.startsWith("location_")) return 20;
  if (role.startsWith("faction_")) return 30;
  if (role.startsWith("region_")) return 31;
  if (role.startsWith("nation_")) return 32;
  if (role.startsWith("species_")) return 33;
  if (role.startsWith("organization_")) return 34;
  if (role.startsWith("culture_")) return 35;
  if (role === "reference" || role === "other") return 100;
  return 50;
}

function buildDescriptors(world: World, bible: WorldBible): WorldCanonDescriptors {
  return {
    name: world.name,
    slug: world.slug,
    description: world.description,
    genre: bible.genre,
    tone: bible.tone,
    themes: bible.themes,
    rules: bible.rules,
    era: bible.era,
    climate: bible.climate,
    overview: bible.overview,
  };
}

function countByType(
  nodes: WorldReferenceGraphNode[]
): Record<WorldReferenceGraphNodeType, number> {
  const counts: Record<WorldReferenceGraphNodeType, number> = {
    canonical: 0,
    reference: 0,
    location: 0,
    mood: 0,
    environment: 0,
    architecture: 0,
    extended: 0,
  };
  for (const node of nodes) {
    counts[node.nodeType] += 1;
  }
  return counts;
}

function imageNode(
  image: WorldImageWithUrl,
  assetRole: string,
  assignmentSource?: string | null
): WorldReferenceGraphNode {
  return {
    imageId: image.id,
    assetRole,
    assetRoleLabel: image.asset_role_label,
    caption: image.caption,
    nodeType: nodeTypeFromRole(assetRole),
    slotKey: slotKeyFromRole(assetRole),
    sortOrder: image.sort_order,
    imagePath: image.image_path,
    url: image.url,
    assignmentSource: assignmentSource ?? null,
  };
}

export function assembleWorldReferenceGraph(
  world: World,
  bible: WorldBible,
  images: WorldImageWithUrl[],
  slotAssignments: WorldImageSlotAssignment[] = []
): WorldReferenceGraph {
  const slotMap = buildWorldSlotAssignmentMap(images, slotAssignments);
  const imageById = new Map(images.map((img) => [img.id, img]));
  const nodes: WorldReferenceGraphNode[] = [];

  for (const assignment of Object.values(slotMap)) {
    const image = imageById.get(assignment.image_id);
    if (!image) continue;
    nodes.push(
      imageNode(image, assignment.slot_role, assignment.source)
    );
  }

  const galleryReferenceCount = images.length;

  for (const image of images) {
    if (image.asset_role === "reference" || image.asset_role === "other") {
      nodes.push(imageNode(image, image.asset_role));
    }
  }

  nodes.sort((a, b) => {
    const roleDiff = roleSortPriority(a.assetRole) - roleSortPriority(b.assetRole);
    if (roleDiff !== 0) return roleDiff;
    return a.sortOrder - b.sortOrder;
  });

  const canonicalMapNode = nodes.find(
    (node) => node.assetRole === "canonical_map"
  );
  const canonicalReferenceNode = nodes.find(
    (node) => node.assetRole === "canonical_reference"
  );

  return {
    worldId: world.id,
    bibleId: bible.world_id,
    versionLabel: bible.version_label,
    nodes,
    nodeCountByType: countByType(nodes),
    descriptors: buildDescriptors(world, bible),
    canonicalMapImageId: canonicalMapNode?.imageId ?? null,
    canonicalReferenceImageId: canonicalReferenceNode?.imageId ?? null,
    galleryReferenceCount,
  };
}
