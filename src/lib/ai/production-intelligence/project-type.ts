import type { AiProjectTypeId } from "@/types/ai/core";
import type { ProjectWorkIntent } from "@/types/project";

export function mapWorkIntentToProjectType(
  workIntent: ProjectWorkIntent | null | undefined
): AiProjectTypeId {
  switch (workIntent) {
    case "picture_book":
      return "storybook";
    case "comic":
      return "graphic_novel";
    case "screenplay":
      return "film";
    default:
      return "general";
  }
}

export type ProjectTypeStrategy = {
  projectType: AiProjectTypeId;
  label: string;
  defaultPanelsPerPage: number;
  pagesPerScene: number;
  enableFilmPreview: boolean;
  enableAdvertisementPreview: boolean;
  styleHint: string;
};

export function getProjectTypeStrategy(projectType: AiProjectTypeId): ProjectTypeStrategy {
  switch (projectType) {
    case "storybook":
      return {
        projectType,
        label: "Storybook",
        defaultPanelsPerPage: 2,
        pagesPerScene: 1,
        enableFilmPreview: false,
        enableAdvertisementPreview: false,
        styleHint: "Illustrated spreads with gentle pacing and readable panel flow.",
      };
    case "graphic_novel":
      return {
        projectType,
        label: "Graphic Novel",
        defaultPanelsPerPage: 4,
        pagesPerScene: 2,
        enableFilmPreview: false,
        enableAdvertisementPreview: false,
        styleHint: "Cinematic graphic novel pacing with varied panel grids.",
      };
    case "film":
      return {
        projectType,
        label: "Film",
        defaultPanelsPerPage: 1,
        pagesPerScene: 1,
        enableFilmPreview: true,
        enableAdvertisementPreview: false,
        styleHint: "Shot-based planning with cinematic rhythm and keyframe thinking.",
      };
    case "advertisement":
      return {
        projectType,
        label: "Advertisement",
        defaultPanelsPerPage: 3,
        pagesPerScene: 1,
        enableFilmPreview: false,
        enableAdvertisementPreview: true,
        styleHint: "Character-driven campaign visuals with clear hierarchy and CTA focus.",
      };
    default:
      return {
        projectType: "general",
        label: "General",
        defaultPanelsPerPage: 4,
        pagesPerScene: 2,
        enableFilmPreview: false,
        enableAdvertisementPreview: false,
        styleHint: "Balanced visual storytelling adaptable to your production format.",
      };
  }
}
