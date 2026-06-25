import type { ProductionData } from "@/app/actions/production/index";

export function isProductionStructureEmpty(data: ProductionData): boolean {
  if (!data) return true;

  switch (data.kind) {
    case "novel":
      return data.parts.length === 0;
    case "comic": {
      const pageCount = data.issues.reduce((sum, issue) => sum + issue.pages.length, 0);
      return pageCount === 0;
    }
    case "picture_book":
      return data.spreads.length === 0;
    case "screenplay":
      return data.acts.length === 0;
    default:
      return true;
  }
}

export function formatProductionStructureSummary(data: ProductionData): string | undefined {
  if (!data) return undefined;

  switch (data.kind) {
    case "novel": {
      const partCount = data.parts.length;
      const chapterCount = data.parts.reduce(
        (sum, part) => sum + part.chapters.length,
        0
      );
      return `${partCount} part${partCount === 1 ? "" : "s"} · ${chapterCount} manuscript chapter${chapterCount === 1 ? "" : "s"}`;
    }
    case "comic": {
      const pageCount = data.issues.reduce((sum, i) => sum + i.pages.length, 0);
      const panelCount = data.issues.reduce(
        (sum, i) => sum + i.pages.reduce((pSum, p) => pSum + p.panels.length, 0),
        0
      );
      return `${pageCount} page${pageCount === 1 ? "" : "s"} · ${panelCount} panel${panelCount === 1 ? "" : "s"}`;
    }
    case "picture_book": {
      const spreadCount = data.spreads.length;
      return `${spreadCount} spread${spreadCount === 1 ? "" : "s"}`;
    }
    case "screenplay": {
      const actCount = data.acts.length;
      const beatCount = data.acts.reduce((sum, act) => sum + act.beats.length, 0);
      return `${beatCount} beat${beatCount === 1 ? "" : "s"} across ${actCount} act${actCount === 1 ? "" : "s"}`;
    }
    default:
      return undefined;
  }
}
