"use client";

import type { StoryCharacterEntry } from "@/app/actions/stories";
import type { SceneWithCast } from "@/types/scene";
import {
  SceneCard,
  type StoryLocationOption,
} from "@/components/scene-workspace/SceneCard";

type SceneListProps = {
  worldId: string;
  storyId: string;
  scenes: SceneWithCast[];
  cast: StoryCharacterEntry[];
  locations: StoryLocationOption[];
};

export function SceneList({
  worldId,
  storyId,
  scenes,
  cast,
  locations,
}: SceneListProps) {
  if (scenes.length === 0) {
    return null;
  }

  return (
    <ol className="space-y-3">
      {scenes.map((scene, index) => (
        <li key={scene.id}>
          <SceneCard
            scene={scene}
            index={index}
            worldId={worldId}
            storyId={storyId}
            cast={cast}
            locations={locations}
          />
        </li>
      ))}
    </ol>
  );
}
