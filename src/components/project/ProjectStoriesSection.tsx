"use client";

import Link from "next/link";
import { NewStoryModal } from "@/app/dashboard/NewStoryModal";
import { StoryStatusBadge } from "@/components/StoryStatusBadge";
import { StudioEmptyState } from "@/components/studio/StudioEmptyState";
import type { ProjectStoryEntry } from "@/app/actions/projects";
import type { ProjectStoryProgress } from "@/lib/project-finish-path";
import { isAutoProvisionedSetting } from "@/lib/project-setting";
import { STUDIO_EMPTY_COPY } from "@/lib/studio-empty-copy";

type ProjectStoriesSectionProps = {
  projectId: string;
  entries: ProjectStoryEntry[];
  storyProgress: ProjectStoryProgress[];
  projectTitle?: string;
};

export function ProjectStoriesSection({
  projectId,
  entries,
  storyProgress,
  projectTitle,
}: ProjectStoriesSectionProps) {
  const sceneCountByStory = new Map(
    storyProgress.map((story) => [story.id, story.sceneCount])
  );

  if (entries.length === 0) {
    return (
      <div className="space-y-4">
        <StudioEmptyState
          headline={STUDIO_EMPTY_COPY.story.headline}
          description={STUDIO_EMPTY_COPY.story.description}
        />
        <NewStoryModal projectId={projectId} />
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {entries.map(({ story, world }) => {
        const sceneCount = sceneCountByStory.get(story.id) ?? 0;
        const showSettingLink = !isAutoProvisionedSetting(world, projectTitle);

        return (
          <li key={story.id}>
            <Link
              href={`/dashboard/worlds/${world.id}/stories/${story.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-3 transition hover:border-neutral-300 hover:bg-[var(--brand-surface-elevated)]"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium text-[var(--foreground)]">
                    {story.title}
                  </p>
                  <StoryStatusBadge status={story.status} />
                </div>
                <p className="mt-0.5 text-xs text-[var(--brand-text-muted)]">
                  {sceneCount}{" "}
                  {sceneCount === 1 ? "scene" : "scenes"}
                  {showSettingLink ? ` · ${world.name}` : ""}
                </p>
              </div>
              <span className="shrink-0 text-xs font-medium text-[var(--brand-text-secondary)]">
                Open →
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
