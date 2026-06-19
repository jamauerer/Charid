"use client";

import { useState } from "react";
import type { Chapter } from "@/types/chapter";
import type { StoryCharacterEntry } from "@/app/actions/stories";
import type { SceneWithCast } from "@/types/scene";
import { SceneList } from "@/components/scene-workspace/SceneList";
import { SceneCreateStudio } from "@/components/scene-workspace/SceneCreateStudio";
import { SceneSuggestionStagingPanel } from "@/components/scene-workspace/SceneSuggestionStagingPanel";
import type { StoryLocationOption } from "@/components/scene-workspace/SceneCard";
import type { SceneSuggestionBatchView } from "@/types/scene-suggestion";
import { CREATOR_STORY } from "@/lib/creator-vocabulary";
import { StudioEmptyState } from "@/components/studio/StudioEmptyState";
import { STUDIO_EMPTY_COPY } from "@/lib/studio-empty-copy";
import { studioBtnPrimarySm, studioSectionLabel } from "@/lib/visual-identity";

type StoryScenesPanelProps = {
  worldId: string;
  storyId: string;
  storyTitle: string;
  scenes: SceneWithCast[];
  cast: StoryCharacterEntry[];
  chapters: Chapter[];
  locations: StoryLocationOption[];
  suggestionBatch: SceneSuggestionBatchView | null;
  scenesError?: string;
  suggestionError?: string;
};

export function StoryScenesPanel({
  worldId,
  storyId,
  storyTitle,
  scenes,
  cast,
  chapters,
  locations,
  suggestionBatch,
  scenesError,
  suggestionError,
}: StoryScenesPanelProps) {
  const [studioOpen, setStudioOpen] = useState(false);
  const [studioSession, setStudioSession] = useState(0);

  function openStudio() {
    setStudioSession((s) => s + 1);
    setStudioOpen(true);
  }

  return (
    <section
      id="story-scenes"
      aria-labelledby="story-scenes-heading"
      className="mb-10 scroll-mt-6"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="story-scenes-heading" className={studioSectionLabel}>
            Scenes{scenes.length > 0 ? ` (${scenes.length})` : ""}
          </h2>
          <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
            {CREATOR_STORY.scenesHint}
          </p>
        </div>
        <button
          type="button"
          onClick={openStudio}
          className={studioBtnPrimarySm}
        >
          {CREATOR_STORY.createSceneLabel}
        </button>
      </div>

      {scenesError && (
        <p className="mb-4 rounded-lg border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-3 py-2 text-sm text-[var(--status-info-text)]">
          {scenesError}
        </p>
      )}

      {scenes.length === 0 ? (
        <StudioEmptyState
          headline={STUDIO_EMPTY_COPY.scene.headline}
          description={CREATOR_STORY.scenesEmptyHint}
        >
          <button
            type="button"
            onClick={openStudio}
            className={studioBtnPrimarySm}
          >
            {CREATOR_STORY.createSceneLabel}
          </button>
        </StudioEmptyState>
      ) : (
        <SceneList
          worldId={worldId}
          storyId={storyId}
          scenes={scenes}
          cast={cast}
          locations={locations}
        />
      )}

      <div
        id="story-scene-suggestions"
        className="mt-6 scroll-mt-6 border-t border-[var(--brand-border)] pt-5"
      >
        <SceneSuggestionStagingPanel
          key={
            suggestionBatch
              ? `${suggestionBatch.id}-${suggestionBatch.updated_at}`
              : "scene-suggestions-empty"
          }
          worldId={worldId}
          storyId={storyId}
          storyTitle={storyTitle}
          initialBatch={suggestionBatch}
          cast={cast}
          chapters={chapters}
          locations={locations}
          batchError={suggestionError}
        />
      </div>

      {studioOpen && (
        <SceneCreateStudio
          key={`create-scene-${studioSession}`}
          open={studioOpen}
          onClose={() => setStudioOpen(false)}
          worldId={worldId}
          storyId={storyId}
          cast={cast}
          locations={locations}
        />
      )}
    </section>
  );
}
