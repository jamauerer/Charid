"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";
import { reorderProjectStories } from "@/app/actions/projects";
import { NewStoryModal } from "@/app/dashboard/NewStoryModal";
import { StoryStatusBadge } from "@/components/StoryStatusBadge";
import { StudioEmptyState } from "@/components/studio/StudioEmptyState";
import type { ProjectStoryEntry } from "@/app/actions/projects";
import type { ProjectStoryProgress } from "@/lib/project-finish-path";
import { isAutoProvisionedSetting } from "@/lib/project-setting";
import { STUDIO_EMPTY_COPY } from "@/lib/studio-empty-copy";
import { studioBtnPrimarySm } from "@/lib/visual-identity";

type ProjectStoriesSectionProps = {
  projectId: string;
  entries: ProjectStoryEntry[];
  storyProgress: ProjectStoryProgress[];
  projectTitle?: string;
};

function reorderEntries(
  list: ProjectStoryEntry[],
  draggedId: string,
  targetId: string
): ProjectStoryEntry[] {
  const fromIndex = list.findIndex((entry) => entry.story.id === draggedId);
  const toIndex = list.findIndex((entry) => entry.story.id === targetId);
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return list;
  }

  const next = [...list];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function ProjectStoriesSection({
  projectId,
  entries: initialEntries,
  storyProgress,
  projectTitle,
}: ProjectStoriesSectionProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setEntries(initialEntries);
  }, [initialEntries]);

  const sceneCountByStory = new Map(
    storyProgress.map((story) => [story.id, story.sceneCount])
  );

  const persistOrder = useCallback(
    (ordered: ProjectStoryEntry[]) => {
      startTransition(async () => {
        setError(null);
        const result = await reorderProjectStories(
          projectId,
          ordered.map((entry) => entry.story.id)
        );
        if (result.error) {
          setError(result.error);
          setEntries(initialEntries);
        }
      });
    },
    [projectId, initialEntries]
  );

  function handleDropOnStory(targetId: string) {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDropTargetId(null);
      return;
    }

    const next = reorderEntries(entries, draggedId, targetId);
    setEntries(next);
    setDraggedId(null);
    setDropTargetId(null);
    persistOrder(next);
  }

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
    <div className={pending ? "opacity-80" : undefined}>
      {error && (
        <p className="mb-3 rounded-lg border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] px-3 py-2 text-sm text-[var(--status-danger-text)]">
          {error}
        </p>
      )}

      <p className="mb-3 text-xs text-[var(--brand-text-secondary)]">
        Drag stories to reorder your project.
      </p>

      <ul className="grid gap-4 sm:grid-cols-2">
        {entries.map(({ story, world }) => {
          const sceneCount = sceneCountByStory.get(story.id) ?? 0;
          const showSettingLink = !isAutoProvisionedSetting(world, projectTitle);
          const storyHref = `/dashboard/worlds/${world.id}/stories/${story.id}`;
          const isDragging = draggedId === story.id;
          const isDropTarget = dropTargetId === story.id;

          return (
            <li key={story.id}>
              <article
                draggable
                onDragStart={() => setDraggedId(story.id)}
                onDragEnd={() => {
                  setDraggedId(null);
                  setDropTargetId(null);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDropTargetId(story.id);
                }}
                onDrop={() => handleDropOnStory(story.id)}
                className={`flex h-full cursor-grab flex-col justify-between gap-4 rounded-xl border bg-[var(--brand-surface)] p-4 shadow-sm transition active:cursor-grabbing ${
                  isDragging
                    ? "border-[var(--brand-accent)] opacity-60"
                    : isDropTarget
                      ? "border-[var(--brand-accent)] bg-[var(--tag-primary-bg)]"
                      : "border-[var(--brand-border)] hover:border-[var(--brand-accent)]"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="text-[var(--brand-text-secondary)]"
                      aria-hidden
                      title="Drag to reorder"
                    >
                      ⠿
                    </span>
                    <h3 className="truncate text-base font-semibold text-[var(--brand-text-primary)]">
                      {story.title}
                    </h3>
                    <StoryStatusBadge status={story.status} />
                  </div>
                  {story.summary && (
                    <p className="mt-2 line-clamp-2 text-sm text-[var(--brand-text-secondary)]">
                      {story.summary}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-[var(--brand-text-secondary)]">
                    {sceneCount}{" "}
                    {sceneCount === 1 ? "scene" : "scenes"}
                    {showSettingLink ? ` · ${world.name}` : ""}
                  </p>
                </div>
                <div>
                  <Link href={storyHref} className={studioBtnPrimarySm}>
                    Open story
                  </Link>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
