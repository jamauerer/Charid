import Link from "next/link";
import type { ProjectAssetRollupEntry } from "@/app/actions/projects";
import { ProjectStyleReferencesSection } from "@/components/project/ProjectStyleReferencesSection";
import { StudioEmptyState } from "@/components/studio/StudioEmptyState";
import type { WorldImageWithUrl } from "@/types/world-image";
import type { WorldMoodboardBundle } from "@/types/world-moodboard";

type ProjectAssetsSectionProps = {
  projectId: string;
  coverUrl: string | null;
  primaryWorldId: string | null;
  moodboardBundle: WorldMoodboardBundle | null;
  galleryImages: WorldImageWithUrl[];
  assetEntries: ProjectAssetRollupEntry[];
};

const SOURCE_LABELS: Record<ProjectAssetRollupEntry["source"], string> = {
  character: "Character",
  world: "Setting",
  story: "Story",
};

export function ProjectAssetsSection({
  projectId,
  coverUrl,
  primaryWorldId,
  moodboardBundle,
  galleryImages,
  assetEntries,
}: ProjectAssetsSectionProps) {
  return (
    <div className="space-y-8">
      <ProjectStyleReferencesSection
        projectId={projectId}
        coverUrl={coverUrl}
        worldId={primaryWorldId}
        moodboardBundle={moodboardBundle}
        galleryImages={galleryImages}
      />

      <div>
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
          Gallery rollup
        </h3>
        <p className="mb-4 text-xs text-[var(--brand-text-muted)]">
          Images across characters, settings, and stories in this project.
        </p>

        {assetEntries.length === 0 ? (
          <StudioEmptyState
            headline="No gallery images yet"
            description="Upload reference art from a character, setting, or story workspace."
          />
        ) : (
          <ul className="space-y-2">
            {assetEntries.map((entry) => (
              <li key={`${entry.source}-${entry.sourceId}`}>
                <Link
                  href={entry.editHref}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-3 transition hover:border-neutral-300 hover:bg-[var(--brand-surface-elevated)]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--foreground)]">
                      {entry.sourceName}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--brand-text-muted)]">
                      {SOURCE_LABELS[entry.source]} · {entry.imageCount} image
                      {entry.imageCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-[var(--brand-text-secondary)]">
                    Open gallery →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
