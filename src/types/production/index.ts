export type {
  NovelPart,
  NovelChapter,
  NovelPartWithChapters,
} from "@/types/production/novel";
export type {
  ComicIssue,
  ComicPage,
  ComicPanel,
  ComicIssueWithPages,
  ComicArtDirection,
  ComicArtStylePreset,
} from "@/types/production/comic";
export { COMIC_ART_STYLE_PRESETS } from "@/types/production/comic";
export type {
  StorybookSettings,
  StorybookSpread,
} from "@/types/production/storybook";
export type {
  ScreenplayAct,
  ScreenplayBeat,
  ScreenplayActWithBeats,
} from "@/types/production/screenplay";

export type ProductionEntityKind =
  | "part"
  | "chapter"
  | "issue"
  | "page"
  | "panel"
  | "spread"
  | "act"
  | "beat";

export const PRODUCTION_DEFAULT_NAMES: Record<ProductionEntityKind, string> = {
  part: "Part",
  chapter: "Chapter",
  issue: "Issue",
  page: "Page",
  panel: "Panel",
  spread: "Spread",
  act: "Act",
  beat: "Beat",
};

export function defaultProductionName(
  kind: ProductionEntityKind,
  index: number
): string {
  return `${PRODUCTION_DEFAULT_NAMES[kind]} ${index}`;
}
