import { assembleStoryReferenceGraph } from "@/lib/assemble-story-reference-graph";
import { computeStoryBibleScores } from "@/lib/story-bible-scores";
import type { Story } from "@/types/story";
import type { StoryBible } from "@/types/story-bible";
import type { StoryImageWithUrl } from "@/types/story-image";
import type { StoryImageSlotAssignment } from "@/types/story-image-slot";
import type { StoryReferenceGraphNode } from "@/types/story-reference-graph";
import {
  storyReferenceGraphNodeToAsset,
  type StoryContextPacket,
} from "@/types/story-context-packet";

function nodesByRoles(
  nodes: StoryReferenceGraphNode[],
  roles: string[]
): StoryReferenceGraphNode[] {
  return nodes.filter((node) => roles.includes(node.assetRole));
}

function nodesByRolePrefix(
  nodes: StoryReferenceGraphNode[],
  prefix: string
): StoryReferenceGraphNode[] {
  return nodes.filter(
    (node) => node.assetRole === prefix || node.assetRole.startsWith(`${prefix}_`)
  );
}

export function assembleStoryContextPacket(
  story: Story,
  bible: StoryBible,
  images: StoryImageWithUrl[],
  featuredImageId: string | null = story.featured_image_id,
  slotAssignments: StoryImageSlotAssignment[] = [],
  linkedCharacterIds: string[] = []
): StoryContextPacket {
  const graph = assembleStoryReferenceGraph(
    story,
    bible,
    images,
    featuredImageId,
    slotAssignments
  );
  const scores = computeStoryBibleScores(graph);
  const { descriptors } = graph;

  const coverNode = graph.nodes.find((node) => node.assetRole === "cover");
  const sceneNodes = [
    ...nodesByRoles(graph.nodes, ["scene_reference"]),
    ...nodesByRolePrefix(graph.nodes, "scene"),
  ];
  const moodNodes = nodesByRoles(graph.nodes, ["mood_board"]);
  const storyboardNodes = [
    ...nodesByRoles(graph.nodes, ["storyboard"]),
    ...nodesByRolePrefix(graph.nodes, "storyboard"),
  ];
  const chapterNodes = [
    ...nodesByRoles(graph.nodes, ["chapter_reference"]),
    ...nodesByRolePrefix(graph.nodes, "chapter"),
  ];
  const galleryNodes = graph.nodes.filter(
    (node) => node.assetRole === "reference" || node.assetRole === "other"
  );

  return {
    kind: "story",
    schemaVersion: "1.0",
    assembledAt: new Date().toISOString(),
    userId: story.user_id,
    storyId: story.id,
    bibleId: bible.story_id,
    versionLabel: bible.version_label,
    story: {
      title: story.title,
      slug: story.slug,
      summary: descriptors.summary,
      status: story.status,
      projectType: story.project_type,
      worldId: story.world_id,
    },
    canon: {
      summary: bible.summary,
      themes: bible.themes,
      tone: bible.tone,
      notes: bible.notes,
    },
    timeline: bible.timeline,
    events: bible.major_events,
    characters: {
      linkedCharacterIds,
      keyCharacters: bible.key_characters,
    },
    locations: {
      keyLocations: bible.key_locations,
    },
    assets: {
      cover: coverNode ? storyReferenceGraphNodeToAsset(coverNode) : null,
      sceneReferences: sceneNodes.map(storyReferenceGraphNodeToAsset),
      moodBoards: moodNodes.map(storyReferenceGraphNodeToAsset),
      storyboards: storyboardNodes.map(storyReferenceGraphNodeToAsset),
      chapterReferences: chapterNodes.map(storyReferenceGraphNodeToAsset),
      gallery: galleryNodes.map(storyReferenceGraphNodeToAsset),
    },
    referenceGraph: {
      nodes: graph.nodes.map(storyReferenceGraphNodeToAsset),
      coverId: graph.coverImageId,
    },
    scores: {
      storyCompletion: scores.storyCompletion,
      storyConsistency: scores.storyConsistency,
      aiReadiness: scores.aiReadiness,
      aiReadinessTier: scores.aiReadinessTier,
      referenceGraphCompletion: scores.referenceGraphCompletion,
    },
    derived: null,
  };
}
