import type { Chapter } from "@/types/chapter";
import type { StoryProjectType } from "@/types/story";

export type FinishStepId =
  | "first_scene"
  | "first_chapter"
  | "continue_chapter"
  | "continue_scenes"
  | "characters_linked"
  | "locations_optional"
  | "comic_draft_ready"
  | "publish_ready";

export type FinishPathAction =
  | { kind: "link"; href: string; label: string }
  | { kind: "scroll"; hash: string; label: string }
  | { kind: "disabled"; label: string; hint: string };

export type FinishPathHint = {
  label: string;
  href?: string;
  hash?: string;
};

export type FinishChecklistItemId =
  | "characters"
  | "scenes"
  | "chapters"
  | "locations"
  | "cover";

export type FinishChecklistItem = {
  id: FinishChecklistItemId;
  label: string;
  count: number;
  complete: boolean;
  optional: boolean;
};

export type FinishPathResult = {
  primaryStep: FinishStepId;
  primary: FinishPathAction;
  hints: FinishPathHint[];
  continueChapter: Chapter | null;
  checklist: FinishChecklistItem[];
};

const COMIC_PROJECT_TYPES: StoryProjectType[] = [
  "childrens_book",
  "graphic_novel",
];

export function isComicProjectType(projectType: StoryProjectType): boolean {
  return COMIC_PROJECT_TYPES.includes(projectType);
}

function isNovelProjectType(projectType: StoryProjectType): boolean {
  return projectType === "novel";
}

export function pickContinueChapter(chapters: Chapter[]): Chapter | null {
  if (chapters.length === 0) {
    return null;
  }

  return [...chapters].sort((a, b) => {
    if (b.sort_order !== a.sort_order) {
      return b.sort_order - a.sort_order;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  })[0];
}

function buildChecklist(input: {
  projectType: StoryProjectType;
  characterCount: number;
  sceneCount: number;
  chapterCount: number;
  locationCount: number;
  hasCoverImage: boolean;
}): FinishChecklistItem[] {
  const chaptersOptional = !isNovelProjectType(input.projectType);

  return [
    {
      id: "characters",
      label: input.characterCount === 1 ? "Character" : "Characters",
      count: input.characterCount,
      complete: input.characterCount >= 1,
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
      optional: chaptersOptional,
    },
    {
      id: "locations",
      label: input.locationCount === 1 ? "Location" : "Locations",
      count: input.locationCount,
      complete: input.locationCount >= 1,
      optional: true,
    },
    {
      id: "cover",
      label: "Cover image",
      count: input.hasCoverImage ? 1 : 0,
      complete: input.hasCoverImage,
      optional: true,
    },
  ];
}

export function resolveStoryFinishPath(input: {
  worldId: string;
  storyId: string;
  projectType: StoryProjectType;
  chapters: Chapter[];
  characterCount: number;
  sceneCount: number;
  locationCount: number;
  hasCoverImage: boolean;
}): FinishPathResult {
  const {
    worldId,
    storyId,
    projectType,
    chapters,
    characterCount,
    sceneCount,
    locationCount,
    hasCoverImage,
  } = input;

  const chapterCount = chapters.length;
  const continueChapter = pickContinueChapter(chapters);
  const continueHref = continueChapter
    ? `/dashboard/worlds/${worldId}/stories/${storyId}/chapters/${continueChapter.id}`
    : undefined;

  const checklist = buildChecklist({
    projectType,
    characterCount,
    sceneCount,
    chapterCount,
    locationCount,
    hasCoverImage,
  });

  if (characterCount === 0) {
    return {
      primaryStep: "characters_linked",
      primary: {
        kind: "scroll",
        hash: "story-characters",
        label: isComicProjectType(projectType)
          ? "Add characters to your story"
          : "Add characters",
      },
      hints: [],
      continueChapter: null,
      checklist,
    };
  }

  if (sceneCount === 0) {
    return {
      primaryStep: "first_scene",
      primary: {
        kind: "scroll",
        hash: "story-timeline-section",
        label: "Add your first scene",
      },
      hints:
        isNovelProjectType(projectType) && chapterCount === 0
          ? [{ label: "Or start with a chapter", hash: "story-chapters" }]
          : [],
      continueChapter,
      checklist,
    };
  }

  if (isNovelProjectType(projectType) && chapterCount === 0) {
    return {
      primaryStep: "first_chapter",
      primary: {
        kind: "scroll",
        hash: "story-chapters",
        label: "Add your first chapter",
      },
      hints: [{ label: "Review your timeline", hash: "story-timeline-section" }],
      continueChapter: null,
      checklist,
    };
  }

  if (continueHref) {
    return {
      primaryStep: "continue_chapter",
      primary: {
        kind: "link",
        href: continueHref,
        label: "Continue writing",
      },
      hints: [
        { label: "Add another scene", hash: "story-timeline-section" },
        ...(locationCount === 0
          ? [{ label: "Add places in Setting", hash: "story-setting" }]
          : []),
      ],
      continueChapter,
      checklist,
    };
  }

  if (isComicProjectType(projectType) && sceneCount >= 1) {
    return {
      primaryStep: "continue_scenes",
      primary: {
        kind: "scroll",
        hash: "story-timeline-section",
        label: "Add another scene",
      },
      hints: locationCount === 0
        ? [{ label: "Explore places in Setting", hash: "story-setting" }]
        : [],
      continueChapter: null,
      checklist,
    };
  }

  return {
    primaryStep: "continue_scenes",
    primary: {
      kind: "scroll",
      hash: "story-timeline-section",
      label: "Add another scene",
    },
    hints: [],
    continueChapter: null,
    checklist,
  };
}
