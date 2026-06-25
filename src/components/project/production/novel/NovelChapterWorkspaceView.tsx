import type {
  ProjectCharacterEntry,
  ProjectSceneRollupEntry,
  ProjectStoryEntry,
} from "@/app/actions/projects";
import type { NovelChapterWorkspaceData } from "@/app/actions/production/workspace";
import { ProductionCanonReferences } from "@/components/project/production/ProductionCanonReferences";
import { ProductionPlaceholderSection } from "@/components/project/production/ProductionPlaceholderSection";
import { ProductionReadingNav } from "@/components/project/production/ProductionReadingNav";
import { ProductionWorkspaceFrame } from "@/components/project/production/ProductionWorkspaceFrame";
import { flattenNovelChapters } from "@/lib/production-reading-order";
import { novelChapterWorkspacePath } from "@/lib/production-routes";
import type { NovelPartWithChapters } from "@/types/production/novel";

type NovelChapterWorkspaceViewProps = {
  projectId: string;
  data: NovelChapterWorkspaceData;
  parts: NovelPartWithChapters[];
  stories: ProjectStoryEntry[];
  sceneRollup: ProjectSceneRollupEntry[];
  characters: ProjectCharacterEntry[];
};

export function NovelChapterWorkspaceView({
  projectId,
  data,
  parts,
  stories,
  sceneRollup,
  characters,
}: NovelChapterWorkspaceViewProps) {
  const { chapter, partName, reading } = data;
  const flatChapters = flattenNovelChapters(parts);

  const prevHref =
    reading.currentIndex > 0
      ? novelChapterWorkspacePath(
          projectId,
          reading.orderedIds[reading.currentIndex - 1]
        )
      : null;
  const nextHref =
    reading.currentIndex < reading.total - 1
      ? novelChapterWorkspacePath(
          projectId,
          reading.orderedIds[reading.currentIndex + 1]
        )
      : null;

  const jumpOptions = flatChapters.map((entry) => ({
    id: entry.id,
    label: `Chapter ${entry.chapterNumber} — ${entry.name}`,
    href: novelChapterWorkspacePath(projectId, entry.id),
  }));

  return (
    <ProductionWorkspaceFrame
      projectId={projectId}
      title={chapter.name}
      subtitle={`${data.projectTitle} · ${partName} · Chapter ${reading.currentIndex + 1} of ${reading.total}`}
      backLabel="Back to Manuscript"
    >
      <ProductionReadingNav
        unitLabel="Chapter"
        currentIndex={reading.currentIndex}
        total={reading.total}
        prevHref={prevHref}
        nextHref={nextHref}
        jumpOptions={jumpOptions}
      />

      <ProductionPlaceholderSection title="Chapter information">
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-[var(--brand-text-muted)]">Part</dt>
            <dd className="text-[var(--foreground)]">{partName}</dd>
          </div>
          <div>
            <dt className="text-xs text-[var(--brand-text-muted)]">Chapter number</dt>
            <dd className="tabular-nums text-[var(--foreground)]">
              {reading.currentIndex + 1} of {reading.total}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-[var(--brand-text-muted)]">
          Manuscript chapters organize your novel production. Story scenes remain in
          your Story Layer until linking is available.
        </p>
      </ProductionPlaceholderSection>

      <ProductionPlaceholderSection
        title="Chapter editor"
        description="Chapter writing and review tools will open here in a future milestone."
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
