import Link from "next/link";
import type { ProjectSceneRollupEntry } from "@/app/actions/projects";
import { StudioEmptyState } from "@/components/studio/StudioEmptyState";

type ProjectScenesSectionProps = {
  entries: ProjectSceneRollupEntry[];
  storyCount: number;
};

export function ProjectScenesSection({
  entries,
  storyCount,
}: ProjectScenesSectionProps) {
  if (storyCount === 0) {
    return null;
  }

  if (entries.length === 0) {
    return (
      <StudioEmptyState
        headline="No scenes yet"
        description="Scenes are story beats — add your first one from the Story section above."
      />
    );
  }

  return (
    <ul className="space-y-2">
      {entries.map((entry) => (
        <li key={entry.sceneId}>
          <Link
            href={`/dashboard/worlds/${entry.worldId}/stories/${entry.storyId}/scenes/${entry.sceneId}`}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-3 transition hover:border-neutral-300 hover:bg-[var(--brand-surface-elevated)]"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[var(--foreground)]">
                {entry.sceneTitle}
              </p>
              <p className="mt-0.5 truncate text-xs text-[var(--brand-text-muted)]">
                in {entry.storyTitle}
              </p>
            </div>
            <span className="shrink-0 text-xs font-medium text-[var(--brand-text-secondary)]">
              Open →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
