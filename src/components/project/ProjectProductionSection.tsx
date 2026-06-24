"use client";

import type {
  ProjectCharacterEntry,
  ProjectSceneRollupEntry,
  ProjectStoryEntry,
} from "@/app/actions/projects";
import type { ProductionData } from "@/app/actions/production/index";
import { ProductionUnsupportedIntent } from "@/components/project/production/ProductionUnsupportedIntent";
import { ProductionWorkspaceShell } from "@/components/project/production/ProductionWorkspaceShell";
import type { ProjectWorkIntent } from "@/types/project";
import type { WorldMoodboardBundle } from "@/types/world-moodboard";

const PRODUCTION_INTENTS: ProjectWorkIntent[] = [
  "novel",
  "comic",
  "picture_book",
  "screenplay",
];

type ProjectProductionSectionProps = {
  projectId: string;
  workIntent: ProjectWorkIntent | null;
  productionData: ProductionData;
  productionError?: string;
  stories: ProjectStoryEntry[];
  sceneRollup: ProjectSceneRollupEntry[];
  characters: ProjectCharacterEntry[];
  moodboardBundle: WorldMoodboardBundle | null;
  primaryWorldId: string | null;
  styleReferenceCount: number;
};

export function ProjectProductionSection({
  projectId,
  workIntent,
  productionData,
  productionError,
  stories,
  sceneRollup,
  characters,
  moodboardBundle,
  primaryWorldId,
  styleReferenceCount,
}: ProjectProductionSectionProps) {
  if (!workIntent || !PRODUCTION_INTENTS.includes(workIntent)) {
    return <ProductionUnsupportedIntent workIntent={workIntent} />;
  }

  if (!productionData) {
    return (
      <ProductionUnsupportedIntent workIntent={workIntent} />
    );
  }

  return (
    <ProductionWorkspaceShell
      projectId={projectId}
      workIntent={workIntent}
      productionData={productionData}
      stories={stories}
      sceneRollup={sceneRollup}
      characters={characters}
      moodboardBundle={moodboardBundle}
      primaryWorldId={primaryWorldId}
      styleReferenceCount={styleReferenceCount}
      migrationError={productionError}
    />
  );
}
