import type { Character } from "@/types/character";
import type { CharacterBible } from "@/types/character-bible";
import type { CharacterImageWithUrl } from "@/types/character-image";
import { isSlotAssetRole } from "@/types/character-image";
import type { CharacterImageSlotAssignment } from "@/types/character-image-slot";
import {
  EXPRESSION_ROLES,
  TURNAROUND_ROLES,
} from "@/types/character-image";
import type {
  ReferenceGraph,
  ReferenceGraphNode,
  ReferenceGraphNodeType,
  VisualIdentityDescriptors,
} from "@/types/reference-graph";
import { buildSlotAssignmentMap } from "@/lib/character-slot-assignments";

const TURNAROUND_ORDER = [...TURNAROUND_ROLES];
const EXPRESSION_ORDER = [...EXPRESSION_ROLES];

function nodeTypeFromRole(role: string): ReferenceGraphNodeType {
  if (role === "canonical") return "canonical";
  if (role === "reference" || role === "other") return "reference";
  if (role.startsWith("turnaround_")) return "turnaround";
  if (role.startsWith("expression_")) return "expression";
  return "extended";
}

function slotKeyFromRole(role: string): string | null {
  if (role === "canonical") return "canonical";
  if (isSlotAssetRole(role)) return role;
  if (role.startsWith("turnaround_") || role.startsWith("expression_")) {
    return role;
  }
  return null;
}

function roleSortPriority(role: string): number {
  if (role === "canonical") return 0;
  const turnaroundIndex = TURNAROUND_ORDER.indexOf(
    role as (typeof TURNAROUND_ORDER)[number]
  );
  if (turnaroundIndex >= 0) return 10 + turnaroundIndex;
  const expressionIndex = EXPRESSION_ORDER.indexOf(
    role as (typeof EXPRESSION_ORDER)[number]
  );
  if (expressionIndex >= 0) return 20 + expressionIndex;
  if (role === "reference" || role === "other") return 100;
  return 50;
}

function buildDescriptors(
  character: Character,
  bible: CharacterBible
): VisualIdentityDescriptors {
  return {
    name: character.name,
    species: character.species,
    corePersonality: character.core_personality,
    permanentFeatures: character.permanent_features,
    backstory: character.backstory,
    identityArchetype: bible.identity_archetype,
    creativeFormat: bible.creative_format,
    age: bible.age,
    height: bible.height,
    build: bible.build,
    hair: bible.hair,
    eyes: bible.eyes,
    clothing: bible.clothing,
    accessories: bible.accessories,
    scarsTattoos: bible.scars_tattoos,
    otherDetails: bible.other_details,
  };
}

function countByType(
  nodes: ReferenceGraphNode[]
): Record<ReferenceGraphNodeType, number> {
  const counts: Record<ReferenceGraphNodeType, number> = {
    canonical: 0,
    reference: 0,
    turnaround: 0,
    expression: 0,
    extended: 0,
  };
  for (const node of nodes) {
    counts[node.nodeType] += 1;
  }
  return counts;
}

function imageNode(
  image: CharacterImageWithUrl,
  assetRole: string,
  featuredImageId: string | null,
  assignmentSource?: string | null
): ReferenceGraphNode {
  return {
    imageId: image.id,
    assetRole,
    assetRoleLabel: image.asset_role_label,
    nodeType: nodeTypeFromRole(assetRole),
    slotKey: slotKeyFromRole(assetRole),
    sortOrder: image.sort_order,
    imagePath: image.image_path,
    url: image.url,
    isFeatured: image.id === featuredImageId,
    assignmentSource: assignmentSource ?? null,
  };
}

export function assembleReferenceGraph(
  character: Character,
  bible: CharacterBible,
  images: CharacterImageWithUrl[],
  featuredImageId: string | null = character.featured_image_id,
  slotAssignments: CharacterImageSlotAssignment[] = []
): ReferenceGraph {
  const slotMap = buildSlotAssignmentMap(images, slotAssignments);
  const imageById = new Map(images.map((img) => [img.id, img]));
  const nodes: ReferenceGraphNode[] = [];

  for (const assignment of Object.values(slotMap)) {
    const image = imageById.get(assignment.image_id);
    if (!image) continue;
    nodes.push(
      imageNode(
        image,
        assignment.slot_role,
        featuredImageId,
        assignment.source
      )
    );
  }

  const galleryReferenceCount = images.length;

  for (const image of images) {
    if (image.asset_role === "reference" || image.asset_role === "other") {
      nodes.push(imageNode(image, image.asset_role, featuredImageId));
    } else if (
      !isSlotAssetRole(image.asset_role) &&
      !Object.values(slotMap).some((a) => a.image_id === image.id)
    ) {
      nodes.push(imageNode(image, image.asset_role, featuredImageId));
    }
  }

  nodes.sort((a, b) => {
    const roleDiff = roleSortPriority(a.assetRole) - roleSortPriority(b.assetRole);
    if (roleDiff !== 0) return roleDiff;
    return a.sortOrder - b.sortOrder;
  });

  const canonicalNode =
    nodes.find((node) => node.assetRole === "canonical") ??
    nodes.find((node) => node.imageId === featuredImageId);

  return {
    characterId: character.id,
    bibleId: bible.character_id,
    identityArchetype: bible.identity_archetype,
    creativeFormat: bible.creative_format,
    versionLabel: bible.version_label,
    nodes,
    nodeCountByType: countByType(nodes),
    descriptors: buildDescriptors(character, bible),
    canonicalImageId: canonicalNode?.imageId ?? null,
    galleryReferenceCount,
  };
}
