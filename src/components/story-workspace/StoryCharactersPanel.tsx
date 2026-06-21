"use client";

import type { StoryCharacterEntry } from "@/app/actions/stories";
import { StoryCharacterSection } from "@/components/StoryCharacterSection";
import { studioSection, studioSectionLabel } from "@/lib/visual-identity";

type StoryCharactersPanelProps = {
  storyId: string;
  worldId: string;
  worldName: string;
  projectId?: string | null;
  cast: StoryCharacterEntry[];
  castPhotoUrls: Record<string, string | null>;
};

export function StoryCharactersPanel({
  storyId,
  worldId,
  worldName,
  projectId = null,
  cast,
  castPhotoUrls,
}: StoryCharactersPanelProps) {
  return (
    <section id="story-characters" className={studioSection}>
      <div className="mb-4">
        <h2 className={studioSectionLabel}>Characters</h2>
        <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
          Your story cast — add existing characters or create new ones.
        </p>
      </div>
      <StoryCharacterSection
        storyId={storyId}
        worldId={worldId}
        worldName={worldName}
        projectId={projectId}
        initialEntries={cast}
        photoUrls={castPhotoUrls}
      />
    </section>
  );
}
