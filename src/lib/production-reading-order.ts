import type { ComicIssueWithPages } from "@/types/production/comic";
import type { NovelPartWithChapters } from "@/types/production/novel";
import type { ScreenplayActWithBeats } from "@/types/production/screenplay";
import type { StorybookSpread } from "@/types/production/storybook";

export type ProductionUnitStatus = "empty" | "draft";

export type ComicPageListItem = {
  id: string;
  name: string;
  issueId: string;
  issueName: string;
  pageNumber: number;
  panelCount: number;
  status: ProductionUnitStatus;
};

export type StorybookSpreadListItem = {
  id: string;
  name: string;
  spreadNumber: number;
  status: ProductionUnitStatus;
};

export type NovelChapterListItem = {
  id: string;
  name: string;
  partId: string;
  partName: string;
  chapterNumber: number;
  status: ProductionUnitStatus;
};

export type ScreenplayBeatListItem = {
  id: string;
  name: string;
  actId: string;
  actName: string;
  beatNumber: number;
  status: ProductionUnitStatus;
};

function unitStatus(hasContent: boolean): ProductionUnitStatus {
  return hasContent ? "draft" : "empty";
}

export function flattenComicPages(issues: ComicIssueWithPages[]): ComicPageListItem[] {
  const items: ComicPageListItem[] = [];
  let pageNumber = 0;

  for (const issue of issues) {
    for (const page of issue.pages) {
      pageNumber += 1;
      items.push({
        id: page.id,
        name: page.name,
        issueId: issue.id,
        issueName: issue.name,
        pageNumber,
        panelCount: page.panels.length,
        status: unitStatus(page.panels.length > 0),
      });
    }
  }

  return items;
}

export function groupComicPagesByIssue(
  issues: ComicIssueWithPages[]
): { issueId: string; issueName: string; pages: ComicPageListItem[] }[] {
  const flat = flattenComicPages(issues);
  const byIssue = new Map<string, ComicPageListItem[]>();

  for (const page of flat) {
    const list = byIssue.get(page.issueId) ?? [];
    list.push(page);
    byIssue.set(page.issueId, list);
  }

  return issues.map((issue) => ({
    issueId: issue.id,
    issueName: issue.name,
    pages: byIssue.get(issue.id) ?? [],
  }));
}

export function flattenStorybookSpreads(
  spreads: StorybookSpread[]
): StorybookSpreadListItem[] {
  return spreads.map((spread, index) => ({
    id: spread.id,
    name: spread.name,
    spreadNumber: index + 1,
    status: unitStatus(Boolean(spread.surface_id)),
  }));
}

export function flattenNovelChapters(
  parts: NovelPartWithChapters[]
): NovelChapterListItem[] {
  const items: NovelChapterListItem[] = [];
  let chapterNumber = 0;

  for (const part of parts) {
    for (const chapter of part.chapters) {
      chapterNumber += 1;
      items.push({
        id: chapter.id,
        name: chapter.name,
        partId: part.id,
        partName: part.name,
        chapterNumber,
        status: "draft",
      });
    }
  }

  return items;
}

export function groupNovelChaptersByPart(
  parts: NovelPartWithChapters[]
): { partId: string; partName: string; chapters: NovelChapterListItem[] }[] {
  const flat = flattenNovelChapters(parts);
  const byPart = new Map<string, NovelChapterListItem[]>();

  for (const chapter of flat) {
    const list = byPart.get(chapter.partId) ?? [];
    list.push(chapter);
    byPart.set(chapter.partId, list);
  }

  return parts.map((part) => ({
    partId: part.id,
    partName: part.name,
    chapters: byPart.get(part.id) ?? [],
  }));
}

export function flattenScreenplayBeats(
  acts: ScreenplayActWithBeats[]
): ScreenplayBeatListItem[] {
  const items: ScreenplayBeatListItem[] = [];
  let beatNumber = 0;

  for (const act of acts) {
    for (const beat of act.beats) {
      beatNumber += 1;
      items.push({
        id: beat.id,
        name: beat.name,
        actId: act.id,
        actName: act.name,
        beatNumber,
        status: "draft",
      });
    }
  }

  return items;
}

export function groupScreenplayBeatsByAct(
  acts: ScreenplayActWithBeats[]
): { actId: string; actName: string; beats: ScreenplayBeatListItem[] }[] {
  const flat = flattenScreenplayBeats(acts);
  const byAct = new Map<string, ScreenplayBeatListItem[]>();

  for (const beat of flat) {
    const list = byAct.get(beat.actId) ?? [];
    list.push(beat);
    byAct.set(beat.actId, list);
  }

  return acts.map((act) => ({
    actId: act.id,
    actName: act.name,
    beats: byAct.get(act.id) ?? [],
  }));
}

export function formatProductionUnitStatus(status: ProductionUnitStatus): string {
  return status === "empty" ? "Not started" : "Draft";
}
