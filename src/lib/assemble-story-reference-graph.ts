import { STORY_CORE_SLOT_ROLES } from "@/types/story-image";
import { isStorySlotRole } from "@/types/story-image";
import type { StoryImageWithUrl } from "@/types/story-image";
import type { StoryImageSlotAssignment } from "@/types/story-image-slot";
import type { Story } from "@/types/story";
import type { StoryBible } from "@/types/story-bible";
import type {
  StoryReferenceGraph,
  StoryReferenceGraphNode,
  StoryReferenceGraphNodeType,
  StoryCanonDescriptors,
} from "@/types/story-reference-graph";
import {
  buildStorySlotAssignmentMap,
  isGalleryStoryAssetType,
} from "@/lib/story-slot-assignments";

const CORE_ROLE_ORDER = [...STORY_CORE_SLOT_ROLES];

function nodeTypeFromRole(role: string): StoryReferenceGraphNodeType {
  if (role === "cover") return "canonical";
  if (role === "reference" || role === "other") return "reference";
  if (role === "scene_reference" || role.startsWith("scene_")) return "scene";
  if (role === "mood_board") return "mood";
  if (role === "storyboard" || role.startsWith("storyboard_")) {
    return "storyboard";
  }
  if (role === "chapter_reference" || role.startsWith("chapter_")) {
    return "chapter";
  }
  return "extended";
}

function slotKeyFromRole(role: string): string | null {
  if (isStorySlotRole(role)) return role;
  return null;
}

function roleSortPriority(role: string): number {
  const coreIndex = CORE_ROLE_ORDER.indexOf(
    role as (typeof CORE_ROLE_ORDER)[number]
  );
  if (coreIndex >= 0) return coreIndex;
  if (role.startsWith("scene_")) return 20;
  if (role.startsWith("chapter_")) return 30;
  if (role.startsWith("storyboard_")) return 40;
  if (role === "reference" || role === "other") return 100;
  return 50;
}

function buildDescriptors(story: Story, bible: StoryBible): StoryCanonDescriptors {
  return {
    title: story.title,
    slug: story.slug,
    summary: bible.summary ?? story.summary,
    status: story.status,
    projectType: story.project_type,
    themes: bible.themes,
    tone: bible.tone,
    timeline: bible.timeline,
    majorEvents: bible.major_events,
    keyCharacters: bible.key_characters,
    keyLocations: bible.key_locations,
    notes: bible.notes,
  };
}

function countByType(
  nodes: StoryReferenceGraphNode[]
): Record<StoryReferenceGraphNodeType, number> {
  const counts: Record<StoryReferenceGraphNodeType, number> = {
    canonical: 0,
    reference: 0,
    scene: 0,
    mood: 0,
    storyboard: 0,
    chapter: 0,
    extended: 0,
  };
  for (const node of nodes) {
    counts[node.nodeType] += 1;
  }
  return counts;
}

function imageNode(
  image: StoryImageWithUrl,
  assetRole: string,
  featuredImageId: string | null,
  assignmentSource?: string | null
): StoryReferenceGraphNode {
  return {
    imageId: image.id,
    assetRole,
    assetType: image.asset_type,
    caption: image.caption,
    nodeType: nodeTypeFromRole(assetRole),
    slotKey: slotKeyFromRole(assetRole),
    sortOrder: image.sort_order,
    imagePath: image.image_path,
    url: image.url,
    isFeatured: image.id === featuredImageId,
    assignmentSource: assignmentSource ?? null,
  };
}

export function assembleStoryReferenceGraph(
  story: Story,
  bible: StoryBible,
  images: StoryImageWithUrl[],
  featuredImageId: string | null = story.featured_image_id,
  slotAssignments: StoryImageSlotAssignment[] = []
): StoryReferenceGraph {
  const slotMap = buildStorySlotAssignmentMap(images, slotAssignments);
  const imageById = new Map(images.map((img) => [img.id, img]));
  const nodes: StoryReferenceGraphNode[] = [];

  for (const assignment of Object.values(slotMap)) {
    const image = imageById.get(assignment.image_id);
    if (!image) continue;
    nodes.push(
      imageNode(image, assignment.slot_role, featuredImageId, assignment.source)
    );
  }

  const galleryReferenceCount = images.length;

  for (const image of images) {
    if (isGalleryStoryAssetType(image.asset_type)) {
      nodes.push(
        imageNode(image, image.asset_type, featuredImageId)
      );
    } else if (
      !isStorySlotRole(image.asset_type) &&
      !Object.values(slotMap).some((a) => a.image_id === image.id)
    ) {
      nodes.push(imageNode(image, image.asset_type, featuredImageId));
    }
  }

  nodes.sort((a, b) => {
    const roleDiff = roleSortPriority(a.assetRole) - roleSortPriority(b.assetRole);
    if (roleDiff !== 0) return roleDiff;
    return a.sortOrder - b.sortOrder;
  });

  const coverNode =
    nodes.find((node) => node.assetRole === "cover") ??
    nodes.find((node) => node.imageId === featuredImageId);

  return {
    storyId: story.id,
    bibleId: bible.story_id,
    versionLabel: bible.version_label,
    nodes,
    nodeCountByType: countByType(nodes),
    descriptors: buildDescriptors(story, bible),
    coverImageId: coverNode?.imageId ?? null,
    galleryReferenceCount,
  };
}
