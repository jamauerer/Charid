"use client";

import { StoryCard } from "@/components/StoryCard";
import { NewStoryModal } from "@/app/dashboard/NewStoryModal";
import type { StoryWithCounts } from "@/types/story";

type WorldStoriesSectionProps = {
  worldId: string;
  stories: StoryWithCounts[];
  coverUrls?: Record<string, string | null>;
};

export function WorldStoriesSection({
  worldId,
  stories,
  coverUrls = {},
}: WorldStoriesSectionProps) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
          Stories
        </h2>
        <NewStoryModal worldId={worldId} />
      </div>

      {stories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 py-10 text-center">
          <p className="text-sm text-[var(--brand-text-secondary)]">No stories in this setting yet.</p>
          <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
            Create a story to organize characters into narrative plans.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <StoryCard
              key={story.id}
              worldId={worldId}
              story={story}
              coverUrl={coverUrls[story.id] ?? null}
            />
          ))}
        </div>
      )}
    </section>
  );
}
