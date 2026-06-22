"use client";

import { useEffect, useState } from "react";
import type { Chapter } from "@/types/chapter";
import type { StoryCharacterEntry } from "@/app/actions/stories";
import { SceneSuggestionStagingPanel } from "@/components/scene-workspace/SceneSuggestionStagingPanel";
import type { StoryLocationOption } from "@/components/scene-workspace/SceneCard";
import type { SceneSuggestionBatchView } from "@/types/scene-suggestion";

const SUGGESTIONS_HASH = "story-scene-suggestions";

type StorySceneSuggestionsSectionProps = {
  worldId: string;
  storyId: string;
  storyTitle: string;
  initialBatch: SceneSuggestionBatchView | null;
  cast: StoryCharacterEntry[];
  chapters: Chapter[];
  locations: StoryLocationOption[];
  batchError?: string;
};

function hasPendingSuggestions(batch: SceneSuggestionBatchView | null): boolean {
  return (
    batch?.items.some((item) => item.status === "pending") ?? false
  );
}

export function StorySceneSuggestionsSection({
  worldId,
  storyId,
  storyTitle,
  initialBatch,
  cast,
  chapters,
  locations,
  batchError,
}: StorySceneSuggestionsSectionProps) {
  const [revealed, setRevealed] = useState(false);

  const showByDefault = hasPendingSuggestions(initialBatch);

  useEffect(() => {
    function syncFromHash() {
      setRevealed(
        showByDefault || window.location.hash === `#${SUGGESTIONS_HASH}`
      );
    }

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [showByDefault]);

  if (!revealed) {
    return (
      <div
        id={SUGGESTIONS_HASH}
        className="scroll-mt-6"
        aria-hidden
      />
    );
  }

  return (
    <div id={SUGGESTIONS_HASH} className="mb-10 scroll-mt-6">
      <SceneSuggestionStagingPanel
        key={
          initialBatch
            ? `${initialBatch.id}-${initialBatch.updated_at}`
            : "scene-suggestions-empty"
        }
        worldId={worldId}
        storyId={storyId}
        storyTitle={storyTitle}
        initialBatch={initialBatch}
        cast={cast}
        chapters={chapters}
        locations={locations}
        batchError={batchError}
      />
    </div>
  );
}
