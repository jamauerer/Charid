"use client";

import { StoryCharacterSection } from "@/components/StoryCharacterSection";
import type { StoryCharacterEntry } from "@/app/actions/stories";

type StoryPageCharactersSectionProps = {
  storyId: string;
  worldId: string;
  worldName: string;
  projectId?: string | null;
  entries: StoryCharacterEntry[];
  photoUrls: Record<string, string | null>;
};

export function StoryPageCharactersSection({
  storyId,
  worldId,
  worldName,
  projectId = null,
  entries,
  photoUrls,
}: StoryPageCharactersSectionProps) {
  return (
    <section
      id="story-characters"
      className="mb-10 scroll-mt-6 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5"
    >
      <div className="mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
          Characters
        </h2>
        <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
          Add an existing character or create a new one — you stay on this story.
        </p>
      </div>
      <StoryCharacterSection
        storyId={storyId}
        worldId={worldId}
        worldName={worldName}
        projectId={projectId}
        initialEntries={entries}
        photoUrls={photoUrls}
      />
    </section>
  );
}
