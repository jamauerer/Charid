"use server";

import type { ProjectWorkIntent } from "@/types/project";
import { getComicProduction } from "@/app/actions/production/comic";
import { getNovelProduction } from "@/app/actions/production/novel";
import { getScreenplayProduction } from "@/app/actions/production/screenplay";
import { getStorybookProduction } from "@/app/actions/production/storybook";
import type { ComicIssueWithPages, ComicArtDirection } from "@/types/production/comic";
import type { NovelPartWithChapters } from "@/types/production/novel";
import type { ScreenplayActWithBeats } from "@/types/production/screenplay";
import type { StorybookSettings, StorybookSpread } from "@/types/production/storybook";

export type NovelProductionData = {
  kind: "novel";
  parts: NovelPartWithChapters[];
};

export type ComicProductionData = {
  kind: "comic";
  issues: ComicIssueWithPages[];
  artDirection: ComicArtDirection | null;
};

export type StorybookProductionData = {
  kind: "picture_book";
  settings: StorybookSettings | null;
  spreads: StorybookSpread[];
};

export type ScreenplayProductionData = {
  kind: "screenplay";
  acts: ScreenplayActWithBeats[];
};

export type ProductionData =
  | NovelProductionData
  | ComicProductionData
  | StorybookProductionData
  | ScreenplayProductionData
  | null;

export async function getProductionData(
  projectId: string,
  workIntent: ProjectWorkIntent | null
): Promise<{ data: ProductionData; error?: string }> {
  switch (workIntent) {
    case "novel": {
      const result = await getNovelProduction(projectId);
      return {
        data: { kind: "novel", parts: result.parts },
        error: result.error,
      };
    }
    case "comic": {
      const result = await getComicProduction(projectId);
      return {
        data: {
          kind: "comic",
          issues: result.issues,
          artDirection: result.artDirection,
        },
        error: result.error,
      };
    }
    case "picture_book": {
      const result = await getStorybookProduction(projectId);
      return {
        data: {
          kind: "picture_book",
          settings: result.settings,
          spreads: result.spreads,
        },
        error: result.error,
      };
    }
    case "screenplay": {
      const result = await getScreenplayProduction(projectId);
      return {
        data: { kind: "screenplay", acts: result.acts },
        error: result.error,
      };
    }
    default:
      return { data: null };
  }
}
