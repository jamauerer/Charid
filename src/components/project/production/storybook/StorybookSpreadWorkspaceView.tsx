import type {
  ProjectCharacterEntry,
  ProjectSceneRollupEntry,
  ProjectStoryEntry,
} from "@/app/actions/projects";
import type { SpreadLayoutState } from "@/app/actions/production/spread-layout";
import type { StorybookSpreadWorkspaceData } from "@/app/actions/production/workspace";
import { ProductionCanonReferences } from "@/components/project/production/ProductionCanonReferences";
import { ProductionPlaceholderSection } from "@/components/project/production/ProductionPlaceholderSection";
import { ProductionReadingNav } from "@/components/project/production/ProductionReadingNav";
import { ProductionWorkspaceFrame } from "@/components/project/production/ProductionWorkspaceFrame";
import { StorybookSpreadLayoutWorkspace } from "@/components/project/production/storybook/StorybookSpreadLayoutWorkspace";
import {
  flattenStorybookSpreads,
  formatProductionUnitStatus,
} from "@/lib/production-reading-order";
import { storybookSpreadWorkspacePath } from "@/lib/production-routes";
import type { StorybookSpread } from "@/types/production/storybook";

type StorybookSpreadWorkspaceViewProps = {
  projectId: string;
  data: StorybookSpreadWorkspaceData;
  layout: SpreadLayoutState;
  spreads: StorybookSpread[];
  stories: ProjectStoryEntry[];
  sceneRollup: ProjectSceneRollupEntry[];
  characters: ProjectCharacterEntry[];
};

export function StorybookSpreadWorkspaceView({
  projectId,
  data,
  layout,
  spreads,
  stories,
  sceneRollup,
  characters,
}: StorybookSpreadWorkspaceViewProps) {
  const { spread, reading } = data;
  const flatSpreads = flattenStorybookSpreads(spreads);
  const spreadItem = flatSpreads.find((entry) => entry.id === spread.id);
  const status = spreadItem?.status ?? "empty";

  const prevHref =
    reading.currentIndex > 0
      ? storybookSpreadWorkspacePath(
          projectId,
          reading.orderedIds[reading.currentIndex - 1]
        )
      : null;
  const nextHref =
    reading.currentIndex < reading.total - 1
      ? storybookSpreadWorkspacePath(
          projectId,
          reading.orderedIds[reading.currentIndex + 1]
        )
      : null;

  const jumpOptions = flatSpreads.map((entry) => ({
    id: entry.id,
    label: `Spread ${entry.spreadNumber} — ${entry.name}`,
    href: storybookSpreadWorkspacePath(projectId, entry.id),
  }));

  return (
    <ProductionWorkspaceFrame
      projectId={projectId}
      title={spread.name}
      subtitle={`${data.projectTitle} · Spread ${reading.currentIndex + 1} of ${reading.total}`}
      backLabel="Back to Storybook"
    >
      <ProductionReadingNav
        unitLabel="Spread"
        currentIndex={reading.currentIndex}
        total={reading.total}
        prevHref={prevHref}
        nextHref={nextHref}
        jumpOptions={jumpOptions}
      />

      <ProductionPlaceholderSection title="Spread information">
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-[var(--brand-text-muted)]">Spread number</dt>
            <dd className="tabular-nums text-[var(--foreground)]">
              {reading.currentIndex + 1} of {reading.total}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--brand-text-muted)]">Regions</dt>
            <dd className="tabular-nums text-[var(--foreground)]">{layout.zones.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--brand-text-muted)]">Status</dt>
            <dd className="text-[var(--foreground)]">{formatProductionUnitStatus(status)}</dd>
          </div>
        </dl>
      </ProductionPlaceholderSection>

      <StorybookSpreadLayoutWorkspace
        projectId={projectId}
        spreadId={spread.id}
        layout={layout}
      />

      <ProductionCanonReferences
        stories={stories}
        sceneRollup={sceneRollup}
        characters={characters}
      />

      <ProductionPlaceholderSection
        title="Illustrations & text"
        description="Illustrations and text editing will be added here in a future milestone."
        placeholder
      />
    </ProductionWorkspaceFrame>
  );
}
