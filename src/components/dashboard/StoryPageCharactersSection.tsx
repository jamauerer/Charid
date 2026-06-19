"use client";

import { StoryCharacterSection } from "@/components/StoryCharacterSection";
import type { StoryCharacterEntry } from "@/app/actions/stories";

type StoryPageCharactersSectionProps = {
  storyId: string;
  worldId: string;
  worldName: string;
  entries: StoryCharacterEntry[];
  photoUrls: Record<string, string | null>;
};

export function StoryPageCharactersSection({
  storyId,
  worldId,
  worldName,
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
          Link characters from this world or create new ones — you stay on this
          story.
        </p>
      </div>
      <StoryCharacterSection
        storyId={storyId}
        worldId={worldId}
        worldName={worldName}
        initialEntries={entries}
        photoUrls={photoUrls}
      />
    </section>
  );
}
