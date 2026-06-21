"use client";

import Link from "next/link";
import { NewStoryModal } from "@/app/dashboard/NewStoryModal";
import type { CharacterStoryEntry } from "@/app/actions/stories";
import { StoryStatusBadge } from "@/components/StoryStatusBadge";

type CharacterStoriesPanelProps = {
  worldId: string | null;
  projectId?: string | null;
  entries: CharacterStoryEntry[];
};

export function CharacterStoriesPanel({
  worldId,
  projectId = null,
  entries,
}: CharacterStoriesPanelProps) {
  const canCreateStory = Boolean(projectId || worldId);

  return (
    <section className="mb-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
            Stories
          </h2>
          <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
            Where this character appears in your work.
          </p>
        </div>
        {projectId ? (
          <NewStoryModal projectId={projectId} />
        ) : worldId ? (
          <NewStoryModal worldId={worldId} />
        ) : null}
      </div>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 py-8 text-center">
          <p className="text-sm text-[var(--brand-text-secondary)]">Not in any stories yet.</p>
          {canCreateStory ? (
            <p className="mt-2 text-xs text-[var(--brand-text-secondary)]">
              Create a story, then add this character from the story&apos;s Cast
              section.
            </p>
          ) : (
            <p className="mt-2 text-xs text-[var(--brand-text-secondary)]">
              Open a story and add this character from Cast &amp; Connections.
            </p>
          )}
        </div>
      ) : (
        <ul className="space-y-2">
          {entries.map(({ story, worldId: storyWorldId }) => (
            <li key={story.id}>
              <Link
                href={`/dashboard/worlds/${storyWorldId}/stories/${story.id}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-3 transition hover:border-[var(--brand-border)] hover:bg-[var(--brand-surface)]"
              >
                <span className="text-sm font-medium text-[var(--brand-text-secondary)]">
                  {story.title}
                </span>
                <StoryStatusBadge status={story.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
