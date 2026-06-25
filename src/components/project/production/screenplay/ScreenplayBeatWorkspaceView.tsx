import type {
  ProjectCharacterEntry,
  ProjectSceneRollupEntry,
  ProjectStoryEntry,
} from "@/app/actions/projects";
import type { ScreenplayBeatWorkspaceData } from "@/app/actions/production/workspace";
import { ProductionCanonReferences } from "@/components/project/production/ProductionCanonReferences";
import { ProductionPlaceholderSection } from "@/components/project/production/ProductionPlaceholderSection";
import { ProductionReadingNav } from "@/components/project/production/ProductionReadingNav";
import { ProductionWorkspaceFrame } from "@/components/project/production/ProductionWorkspaceFrame";
import { flattenScreenplayBeats } from "@/lib/production-reading-order";
import { screenplayBeatWorkspacePath } from "@/lib/production-routes";
import type { ScreenplayActWithBeats } from "@/types/production/screenplay";

type ScreenplayBeatWorkspaceViewProps = {
  projectId: string;
  data: ScreenplayBeatWorkspaceData;
  acts: ScreenplayActWithBeats[];
  stories: ProjectStoryEntry[];
  sceneRollup: ProjectSceneRollupEntry[];
  characters: ProjectCharacterEntry[];
};

export function ScreenplayBeatWorkspaceView({
  projectId,
  data,
  acts,
  stories,
  sceneRollup,
  characters,
}: ScreenplayBeatWorkspaceViewProps) {
  const { beat, actName, reading } = data;
  const flatBeats = flattenScreenplayBeats(acts);

  const prevHref =
    reading.currentIndex > 0
      ? screenplayBeatWorkspacePath(
          projectId,
          reading.orderedIds[reading.currentIndex - 1]
        )
      : null;
  const nextHref =
    reading.currentIndex < reading.total - 1
      ? screenplayBeatWorkspacePath(
          projectId,
          reading.orderedIds[reading.currentIndex + 1]
        )
      : null;

  const jumpOptions = flatBeats.map((entry) => ({
    id: entry.id,
    label: `Beat ${entry.beatNumber} — ${entry.name}`,
    href: screenplayBeatWorkspacePath(projectId, entry.id),
  }));

  return (
    <ProductionWorkspaceFrame
      projectId={projectId}
      title={beat.name}
      subtitle={`${data.projectTitle} · ${actName} · Beat ${reading.currentIndex + 1} of ${reading.total}`}
      backLabel="Back to Beat Sheet"
    >
      <ProductionReadingNav
        unitLabel="Beat"
        currentIndex={reading.currentIndex}
        total={reading.total}
        prevHref={prevHref}
        nextHref={nextHref}
        jumpOptions={jumpOptions}
      />

      <ProductionPlaceholderSection title="Beat information">
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-[var(--brand-text-muted)]">Act</dt>
            <dd className="text-[var(--foreground)]">{actName}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--brand-text-muted)]">Beat number</dt>
            <dd className="tabular-nums text-[var(--foreground)]">
              {reading.currentIndex + 1} of {reading.total}
            </dd>
          </div>
        </dl>
      </ProductionPlaceholderSection>

      <ProductionPlaceholderSection
        title="Beat editor"
        description="Script formatting and beat notes will open here in a future milestone."
        placeholder
      />

      <ProductionCanonReferences
        stories={stories}
        sceneRollup={sceneRollup}
        characters={characters}
      />
    </ProductionWorkspaceFrame>
  );
}
