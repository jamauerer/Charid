"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import type { SceneWithCast } from "@/types/scene";
import type { SceneInsertPlacement } from "@/lib/scenes/scene-insert-order";
import { reorderStoryScenes } from "@/app/actions/scenes";
import { TimelineInsertButton } from "@/components/scene-workspace/TimelineInsertButton";
import { TimelineNode } from "@/components/scene-workspace/TimelineNode";
import { CREATOR_STORY } from "@/lib/creator-vocabulary";

type StoryTimelinePanelProps = {
  worldId: string;
  storyId: string;
  scenes: SceneWithCast[];
  onInsert: (placement: SceneInsertPlacement) => void;
};

function reorderList(
  list: SceneWithCast[],
  draggedId: string,
  targetId: string
): SceneWithCast[] {
  const fromIndex = list.findIndex((scene) => scene.id === draggedId);
  const toIndex = list.findIndex((scene) => scene.id === targetId);
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return list;
  }

  const next = [...list];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function StoryTimelinePanel({
  worldId,
  storyId,
  scenes: initialScenes,
  onInsert,
}: StoryTimelinePanelProps) {
  const [scenes, setScenes] = useState(initialScenes);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setScenes(initialScenes);
  }, [initialScenes]);

  const persistOrder = useCallback(
    (ordered: SceneWithCast[]) => {
      startTransition(async () => {
        setError(null);
        const result = await reorderStoryScenes(
          storyId,
          worldId,
          ordered.map((scene) => scene.id)
        );
        if (result.error) {
          setError(result.error);
          setScenes(initialScenes);
        }
      });
    },
    [storyId, worldId, initialScenes]
  );

  function handleDropOnScene(targetId: string) {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDropTargetId(null);
      return;
    }

    const next = reorderList(scenes, draggedId, targetId);
    setScenes(next);
    setDraggedId(null);
    setDropTargetId(null);
    persistOrder(next);
  }

  return (
    <div
      id="story-scene-timeline"
      className="mb-6 scroll-mt-6 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4"
    >
      <div className="mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
          {CREATOR_STORY.timelineLabel}
        </h3>
        <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
          {CREATOR_STORY.timelineHint}
        </p>
      </div>

      {error && (
        <p className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-[var(--status-danger-text)]">
          {error}
        </p>
      )}

      <div
        className={`overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:thin] ${
          pending ? "opacity-80" : ""
        }`}
      >
        <div className="flex min-w-min snap-x snap-mandatory items-center gap-2">
          <TimelineInsertButton
            label="Insert scene at start"
            onClick={() => onInsert({ mode: "start" })}
          />

          {scenes.length === 0 ? (
            <p className="px-2 text-sm text-[var(--brand-text-secondary)]">
              {CREATOR_STORY.timelineEmptyHint}
            </p>
          ) : (
            scenes.map((scene, index) => (
              <div key={scene.id} className="flex shrink-0 items-center gap-2">
                <TimelineNode
                  scene={scene}
                  sceneNumber={index + 1}
                  worldId={worldId}
                  storyId={storyId}
                  isDragging={draggedId === scene.id}
                  isDropTarget={dropTargetId === scene.id}
                  onDragStart={() => setDraggedId(scene.id)}
                  onDragEnd={() => {
                    setDraggedId(null);
                    setDropTargetId(null);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDropTargetId(scene.id);
                  }}
                  onDrop={() => handleDropOnScene(scene.id)}
                />
                <TimelineInsertButton
                  label={`Insert scene after ${scene.title}`}
                  onClick={() => onInsert({ mode: "after", sceneId: scene.id })}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
