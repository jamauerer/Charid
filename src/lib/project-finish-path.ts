import type { ProjectWorkIntent } from "@/types/project";
import type { StoryProjectType } from "@/types/story";
import { PROJECT_SECTION_IDS } from "@/lib/project-tabs";

export type ProjectFinishStepId =
  | "first_story"
  | "first_character"
  | "first_scene"
  | "continue_story"
  | "style_references"
  | "add_scene";

export type ProjectFinishPathAction =
  | { kind: "link"; href: string; label: string }
  | { kind: "scroll"; hash: string; label: string }
  | { kind: "disabled"; label: string; hint: string };

export type ProjectFinishPathHint = {
  label: string;
  href?: string;
  hash?: string;
};

export type ProjectFinishChecklistItemId =
  | "characters"
  | "stories"
  | "scenes"
  | "chapters"
  | "cover"
  | "style_refs";

export type ProjectFinishChecklistItem = {
  id: ProjectFinishChecklistItemId;
  label: string;
  count: number;
  complete: boolean;
  optional: boolean;
};

export type ProjectFinishPathResult = {
  primaryStep: ProjectFinishStepId;
  primary: ProjectFinishPathAction;
  hints: ProjectFinishPathHint[];
  checklist: ProjectFinishChecklistItem[];
};

export type ProjectStoryProgress = {
  id: string;
  title: string;
  worldId: string;
  sceneCount: number;
  updatedAt: string;
  projectType: StoryProjectType;
};

function isNovelLike(
  workIntent: ProjectWorkIntent | null,
  stories: ProjectStoryProgress[]
): boolean {
  if (workIntent === "novel" || workIntent === "screenplay") return true;
  return stories.some((s) => s.projectType === "novel");
}

function pickContinueStory(stories: ProjectStoryProgress[]): ProjectStoryProgress | null {
  if (stories.length === 0) return null;

  const withScenes = stories.filter((s) => s.sceneCount > 0);
  const pool = withScenes.length > 0 ? withScenes : stories;

  return [...pool].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0];
}

function buildChecklist(input: {
  workIntent: ProjectWorkIntent | null;
  stories: ProjectStoryProgress[];
  characterCount: number;
  sceneCount: number;
  chapterCount: number;
  hasCover: boolean;
  styleReferenceCount: number;
}): ProjectFinishChecklistItem[] {
  const novelLike = isNovelLike(input.workIntent, input.stories);

  return [
    {
      id: "characters",
      label: input.characterCount === 1 ? "Character" : "Characters",
      count: input.characterCount,
      complete: input.characterCount >= 1,
      optional: false,
    },
    {
      id: "stories",
      label: input.stories.length === 1 ? "Story" : "Stories",
      count: input.stories.length,
      complete: input.stories.length >= 1,
      optional: false,
    },
    {
      id: "scenes",
      label: input.sceneCount === 1 ? "Scene" : "Scenes",
      count: input.sceneCount,
      complete: input.sceneCount >= 1,
      optional: false,
    },
    {
      id: "chapters",
      label: input.chapterCount === 1 ? "Chapter" : "Chapters",
      count: input.chapterCount,
      complete: input.chapterCount >= 1,
      optional: !novelLike,
    },
    {
      id: "cover",
      label: "Cover",
      count: input.hasCover ? 1 : 0,
      complete: input.hasCover,
      optional: true,
    },
    {
      id: "style_refs",
      label: "Style refs",
      count: input.styleReferenceCount,
      complete: input.styleReferenceCount >= 1,
      optional: true,
    },
  ];
}

export function resolveProjectFinishPath(input: {
  workIntent: ProjectWorkIntent | null;
  stories: ProjectStoryProgress[];
  characterCount: number;
  sceneCount: number;
  chapterCount: number;
  hasCover: boolean;
  styleReferenceCount: number;
}): ProjectFinishPathResult {
  const continueStory = pickContinueStory(input.stories);
  const checklist = buildChecklist(input);

  if (input.stories.length === 0) {
    return {
      primaryStep: "first_story",
      primary: {
        kind: "scroll",
        hash: PROJECT_SECTION_IDS.story,
        label: "Start your first story",
      },
      hints:
        input.characterCount === 0
          ? [
              {
                label: "Or add a character first",
                hash: PROJECT_SECTION_IDS.characters,
              },
            ]
          : [],
      checklist,
    };
  }

  if (input.characterCount === 0) {
    return {
      primaryStep: "first_character",
      primary: {
        kind: "scroll",
        hash: PROJECT_SECTION_IDS.characters,
        label: "Add your first character",
      },
      hints: [
        {
          label: "Continue your story",
          hash: PROJECT_SECTION_IDS.story,
        },
      ],
      checklist,
    };
  }

  const primaryStory =
    input.stories.find((s) => s.sceneCount === 0) ?? continueStory;

  if (primaryStory && primaryStory.sceneCount === 0) {
    return {
      primaryStep: "first_scene",
      primary: {
        kind: "link",
        href: `/dashboard/worlds/${primaryStory.worldId}/stories/${primaryStory.id}#story-timeline-section`,
        label: `Add first scene in ${primaryStory.title}`,
      },
      hints: [{ label: "Set style references", hash: PROJECT_SECTION_IDS.styleReferences }],
      checklist,
    };
  }

  if (continueStory) {
    return {
      primaryStep: "continue_story",
      primary: {
        kind: "link",
        href: `/dashboard/worlds/${continueStory.worldId}/stories/${continueStory.id}`,
        label: `Continue ${continueStory.title}`,
      },
      hints: [
        ...(input.sceneCount > 0
          ? [
              {
                label: "Add another scene",
                href: `/dashboard/worlds/${continueStory.worldId}/stories/${continueStory.id}#story-timeline-section`,
              },
            ]
          : []),
        ...(!input.hasCover || input.styleReferenceCount === 0
          ? [{ label: "Add style references", hash: PROJECT_SECTION_IDS.styleReferences }]
          : []),
      ],
      checklist,
    };
  }

  if (!input.hasCover || input.styleReferenceCount === 0) {
    return {
      primaryStep: "style_references",
      primary: {
        kind: "scroll",
        hash: PROJECT_SECTION_IDS.styleReferences,
        label: "Add style references",
      },
      hints: [],
      checklist,
    };
  }

  return {
    primaryStep: "add_scene",
    primary: {
      kind: "scroll",
      hash: PROJECT_SECTION_IDS.scenes,
      label: "Review your scenes",
    },
    hints: [],
    checklist,
  };
}
