"use client";

import { useState } from "react";
import type { StoryCharacterEntry } from "@/app/actions/stories";
import type { SceneWithCast } from "@/types/scene";
import { SceneCreateStudio } from "@/components/scene-workspace/SceneCreateStudio";
import { StoryTimelinePanel } from "@/components/scene-workspace/StoryTimelinePanel";
import type { StoryLocationOption } from "@/components/scene-workspace/SceneCard";
import type { SceneInsertPlacement } from "@/lib/scenes/scene-insert-order";
import { CREATOR_STORY } from "@/lib/creator-vocabulary";
import { StudioEmptyState } from "@/components/studio/StudioEmptyState";
import { STUDIO_EMPTY_COPY } from "@/lib/studio-empty-copy";
import { studioBtnPrimarySm, studioSectionLabel } from "@/lib/visual-identity";

type StoryScenesPanelProps = {
  worldId: string;
  storyId: string;
  scenes: SceneWithCast[];
  cast: StoryCharacterEntry[];
  locations: StoryLocationOption[];
  scenesError?: string;
};

export function StoryScenesPanel({
  worldId,
  storyId,
  scenes,
  cast,
  locations,
  scenesError,
}: StoryScenesPanelProps) {
  const [studioOpen, setStudioOpen] = useState(false);
  const [studioSession, setStudioSession] = useState(0);
  const [insertPlacement, setInsertPlacement] = useState<SceneInsertPlacement>({
    mode: "end",
  });

  function openStudio(placement: SceneInsertPlacement = { mode: "end" }) {
    setInsertPlacement(placement);
    setStudioSession((s) => s + 1);
    setStudioOpen(true);
  }

  return (
    <section
      id="story-timeline-section"
      aria-labelledby="story-timeline-heading"
      className="mb-10 scroll-mt-6"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="story-timeline-heading" className={studioSectionLabel}>
            Timeline
          </h2>
          <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
            {CREATOR_STORY.scenesHint}
          </p>
        </div>
        <button
          type="button"
          onClick={() => openStudio({ mode: "end" })}
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

      <StoryTimelinePanel
        worldId={worldId}
        storyId={storyId}
        scenes={scenes}
        onInsert={openStudio}
      />

      {scenes.length === 0 && (
        <StudioEmptyState
          headline={STUDIO_EMPTY_COPY.scene.headline}
          description={CREATOR_STORY.scenesEmptyHint}
        >
          <button
            type="button"
            onClick={() => openStudio({ mode: "end" })}
            className={studioBtnPrimarySm}
          >
            {CREATOR_STORY.createSceneLabel}
          </button>
        </StudioEmptyState>
      )}

      {studioOpen && (
        <SceneCreateStudio
          key={`create-scene-${studioSession}`}
          open={studioOpen}
          onClose={() => setStudioOpen(false)}
          worldId={worldId}
          storyId={storyId}
          cast={cast}
          locations={locations}
          insertPlacement={insertPlacement}
        />
      )}
    </section>
  );
}
