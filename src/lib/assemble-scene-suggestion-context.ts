import type { Chapter } from "@/types/chapter";
import type { SceneWithCast } from "@/types/scene";
import type { StoryCastBond } from "@/app/actions/story-workspace";
import type { StoryCharacterEntry } from "@/app/actions/stories";
import { STORY_PROJECT_TYPE_LABELS, type Story } from "@/types/story";
import type { World } from "@/types/world";
import type { WorldLocationWithCover } from "@/types/world-location";

export type SceneSuggestionContext = {
  story: {
    title: string;
    summary: string | null;
    format: string;
  };
  world: {
    name: string;
    description: string | null;
  };
  chapters: { title: string; excerpt: string }[];
  existingScenes: { title: string; summary: string }[];
  characters: { id: string; name: string }[];
  relationships: { from: string; to: string; label: string }[];
  locations: { id: string; name: string }[];
  /** Optional focus when generating from a chapter or scene workspace */
  focus?: {
    chapterTitle?: string;
    chapterExcerpt?: string;
    sceneTitle?: string;
    sceneSummary?: string;
  };
};

function excerpt(text: string, max = 280): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).trim()}…`;
}

export function assembleSceneSuggestionContext(input: {
  story: Story;
  world: World;
  cast: StoryCharacterEntry[];
  bonds: StoryCastBond[];
  locations: WorldLocationWithCover[];
  chapters: Chapter[];
  scenes: SceneWithCast[];
  focusChapter?: Chapter | null;
  focusScene?: SceneWithCast | null;
  storyBibleSummary?: string | null;
}): SceneSuggestionContext {
  const storySummary =
    input.storyBibleSummary?.trim() ||
    input.story.summary?.trim() ||
    null;

  const context: SceneSuggestionContext = {
    story: {
      title: input.story.title,
      summary: storySummary,
      format: STORY_PROJECT_TYPE_LABELS[input.story.project_type],
    },
    world: {
      name: input.world.name,
      description: input.world.description,
    },
    chapters: input.chapters.map((ch) => ({
      title: ch.title,
      excerpt: excerpt(ch.content),
    })),
    existingScenes: input.scenes.map((s) => ({
      title: s.title,
      summary: s.summary,
    })),
    characters: input.cast.map(({ character }) => ({
      id: character.id,
      name: character.name,
    })),
    relationships: input.bonds.map((b) => ({
      from: b.fromCharacter.name,
      to: b.toCharacter.name,
      label: b.label,
    })),
    locations: input.locations.map(({ location }) => ({
      id: location.id,
      name: location.name,
    })),
  };

  if (input.focusChapter) {
    context.focus = {
      chapterTitle: input.focusChapter.title,
      chapterExcerpt: excerpt(input.focusChapter.content, 400),
    };
  }

  if (input.focusScene) {
    context.focus = {
      ...context.focus,
      sceneTitle: input.focusScene.title,
      sceneSummary: input.focusScene.summary,
    };
  }

  return context;
}

export function sceneSuggestionContextToPrompt(context: SceneSuggestionContext): string {
  const lines: string[] = [
    `Story: ${context.story.title}`,
    `Format: ${context.story.format}`,
  ];

  if (context.story.summary) {
    lines.push(`Story summary: ${context.story.summary}`);
  }

  lines.push(`World: ${context.world.name}`);
  if (context.world.description) {
    lines.push(`World description: ${context.world.description}`);
  }

  if (context.characters.length > 0) {
    lines.push(
      `Characters: ${context.characters.map((c) => c.name).join(", ")}`
    );
  }

  if (context.relationships.length > 0) {
    lines.push(
      "Relationships:",
      ...context.relationships.map(
        (r) => `- ${r.from} ↔ ${r.to} (${r.label})`
      )
    );
  }

  if (context.locations.length > 0) {
    lines.push(
      `Locations: ${context.locations.map((l) => l.name).join(", ")}`
    );
  }

  if (context.chapters.length > 0) {
    lines.push("Chapters:");
    for (const ch of context.chapters) {
      lines.push(`- ${ch.title}: ${ch.excerpt || "(no content yet)"}`);
    }
  }

  if (context.existingScenes.length > 0) {
    lines.push("Existing scenes (do not duplicate):");
    for (const sc of context.existingScenes) {
      lines.push(`- ${sc.title}: ${sc.summary}`);
    }
  }

  if (context.focus?.chapterTitle) {
    lines.push(
      `Focus chapter: ${context.focus.chapterTitle}`,
      context.focus.chapterExcerpt
        ? `Chapter excerpt: ${context.focus.chapterExcerpt}`
        : ""
    );
  }

  if (context.focus?.sceneTitle) {
    lines.push(
      `Current scene context: ${context.focus.sceneTitle}`,
      context.focus.sceneSummary ?? ""
    );
  }

  return lines.filter(Boolean).join("\n");
}
