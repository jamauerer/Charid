"use client";

import { useState } from "react";
import type { StoryCharacterEntry } from "@/app/actions/stories";
import type { SceneWithCast } from "@/types/scene";
import { SceneCreateStudio } from "@/components/scene-workspace/SceneCreateStudio";
import { StoryTimelinePanel } from "@/components/scene-workspace/StoryTimelinePanel";
import type { StoryLocationOption } from "@/components/scene-workspace/SceneCard";
import type { SceneInsertPlacement } from "@/lib/scenes/scene-insert-order";

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
    <section id="story-timeline-section" className="mb-10 scroll-mt-6">
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
