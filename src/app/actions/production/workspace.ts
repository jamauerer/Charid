"use server";

import {
  getProjectById,
  getProjectCharacters,
  getProjectSceneRollup,
  getProjectStories,
} from "@/app/actions/projects";
import { getComicProduction } from "@/app/actions/production/comic";
import { getNovelProduction } from "@/app/actions/production/novel";
import { getScreenplayProduction } from "@/app/actions/production/screenplay";
import { getStorybookProduction } from "@/app/actions/production/storybook";
import {
  flattenComicPages,
  flattenNovelChapters,
  flattenScreenplayBeats,
  flattenStorybookSpreads,
} from "@/lib/production-reading-order";
import type { ComicPageWithPanels } from "@/types/production/comic";
import type { NovelChapter } from "@/types/production/novel";
import type { ScreenplayBeat } from "@/types/production/screenplay";
import type { StorybookSpread } from "@/types/production/storybook";

export type ReadingOrderContext = {
  currentIndex: number;
  total: number;
  orderedIds: string[];
};

export type ComicPageWorkspaceData = {
  projectTitle: string;
  page: ComicPageWithPanels;
  issueName: string;
  issueId: string;
  reading: ReadingOrderContext;
};

export type StorybookSpreadWorkspaceData = {
  projectTitle: string;
  spread: StorybookSpread;
  reading: ReadingOrderContext;
};

export type NovelChapterWorkspaceData = {
  projectTitle: string;
  chapter: NovelChapter;
  partName: string;
  partId: string;
  reading: ReadingOrderContext;
};

export type ScreenplayBeatWorkspaceData = {
  projectTitle: string;
  beat: ScreenplayBeat;
  actName: string;
  actId: string;
  reading: ReadingOrderContext;
};

export type ProjectCanonContext = {
  stories: Awaited<ReturnType<typeof getProjectStories>>["entries"];
  characters: Awaited<ReturnType<typeof getProjectCharacters>>["entries"];
  sceneRollup: Awaited<ReturnType<typeof getProjectSceneRollup>>["entries"];
};

export async function getProjectCanonContext(
  projectId: string
): Promise<ProjectCanonContext> {
  const [storiesResult, charactersResult, sceneRollupResult] = await Promise.all([
    getProjectStories(projectId),
    getProjectCharacters(projectId),
    getProjectSceneRollup(projectId, 100),
  ]);

  return {
    stories: storiesResult.entries,
    characters: charactersResult.entries,
    sceneRollup: sceneRollupResult.entries,
  };
}

function readingContext(
  orderedIds: string[],
  entityId: string
): ReadingOrderContext | null {
  const currentIndex = orderedIds.indexOf(entityId);
  if (currentIndex === -1) return null;

  return {
    currentIndex,
    total: orderedIds.length,
    orderedIds,
  };
}

export async function getComicPageWorkspace(
  projectId: string,
  pageId: string
): Promise<{ data?: ComicPageWorkspaceData; error?: string }> {
  const [projectResult, comicResult] = await Promise.all([
    getProjectById(projectId),
    getComicProduction(projectId),
  ]);

  if (!projectResult.project) {
    return { error: projectResult.error ?? "Project not found." };
  }

  if (comicResult.error) {
    return { error: comicResult.error };
  }

  const orderedIds = flattenComicPages(comicResult.issues).map((page) => page.id);
  const reading = readingContext(orderedIds, pageId);
  if (!reading) {
    return { error: "Page not found." };
  }

  for (const issue of comicResult.issues) {
    const page = issue.pages.find((entry) => entry.id === pageId);
    if (page) {
      return {
        data: {
          projectTitle: projectResult.project.title,
          page,
          issueName: issue.name,
          issueId: issue.id,
          reading,
        },
      };
    }
  }

  return { error: "Page not found." };
}

export async function getStorybookSpreadWorkspace(
  projectId: string,
  spreadId: string
): Promise<{ data?: StorybookSpreadWorkspaceData; error?: string }> {
  const [projectResult, storybookResult] = await Promise.all([
    getProjectById(projectId),
    getStorybookProduction(projectId),
  ]);

  if (!projectResult.project) {
    return { error: projectResult.error ?? "Project not found." };
  }

  if (storybookResult.error) {
    return { error: storybookResult.error };
  }

  const spread = storybookResult.spreads.find((entry) => entry.id === spreadId);
  if (!spread) {
    return { error: "Spread not found." };
  }

  const orderedIds = flattenStorybookSpreads(storybookResult.spreads).map(
    (entry) => entry.id
  );
  const reading = readingContext(orderedIds, spreadId);
  if (!reading) {
    return { error: "Spread not found." };
  }

  return {
    data: {
      projectTitle: projectResult.project.title,
      spread,
      reading,
    },
  };
}

export async function getNovelChapterWorkspace(
  projectId: string,
  chapterId: string
): Promise<{ data?: NovelChapterWorkspaceData; error?: string }> {
  const [projectResult, novelResult] = await Promise.all([
    getProjectById(projectId),
    getNovelProduction(projectId),
  ]);

  if (!projectResult.project) {
    return { error: projectResult.error ?? "Project not found." };
  }

  if (novelResult.error) {
    return { error: novelResult.error };
  }

  const orderedIds = flattenNovelChapters(novelResult.parts).map(
    (chapter) => chapter.id
  );
  const reading = readingContext(orderedIds, chapterId);
  if (!reading) {
    return { error: "Chapter not found." };
  }

  for (const part of novelResult.parts) {
    const chapter = part.chapters.find((entry) => entry.id === chapterId);
    if (chapter) {
      return {
        data: {
          projectTitle: projectResult.project.title,
          chapter,
          partName: part.name,
          partId: part.id,
          reading,
        },
      };
    }
  }

  return { error: "Chapter not found." };
}

export async function getScreenplayBeatWorkspace(
  projectId: string,
  beatId: string
): Promise<{ data?: ScreenplayBeatWorkspaceData; error?: string }> {
  const [projectResult, screenplayResult] = await Promise.all([
    getProjectById(projectId),
    getScreenplayProduction(projectId),
  ]);

  if (!projectResult.project) {
    return { error: projectResult.error ?? "Project not found." };
  }

  if (screenplayResult.error) {
    return { error: screenplayResult.error };
  }

  const orderedIds = flattenScreenplayBeats(screenplayResult.acts).map(
    (beat) => beat.id
  );
  const reading = readingContext(orderedIds, beatId);
  if (!reading) {
    return { error: "Beat not found." };
  }

  for (const act of screenplayResult.acts) {
    const beat = act.beats.find((entry) => entry.id === beatId);
    if (beat) {
      return {
        data: {
          projectTitle: projectResult.project.title,
          beat,
          actName: act.name,
          actId: act.id,
          reading,
        },
      };
    }
  }

  return { error: "Beat not found." };
}
