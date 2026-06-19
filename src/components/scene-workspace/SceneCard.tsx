"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteScene } from "@/app/actions/scenes";
import { SceneCreateStudio } from "@/components/scene-workspace/SceneCreateStudio";
import type { StoryCharacterEntry } from "@/app/actions/stories";
import type { SceneWithCast } from "@/types/scene";
import { studioBtnSecondary, studioWarmChip } from "@/lib/visual-identity";

export type StoryLocationOption = {
  id: string;
  name: string;
};

type SceneCardProps = {
  scene: SceneWithCast;
  index: number;
  worldId: string;
  storyId: string;
  cast: StoryCharacterEntry[];
  locations: StoryLocationOption[];
};

export function SceneCard({
  scene,
  index,
  worldId,
  storyId,
  cast,
  locations,
}: SceneCardProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [editSession, setEditSession] = useState(0);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function openEdit() {
    setEditSession((s) => s + 1);
    setEditOpen(true);
  }

  function handleDelete() {
    if (!window.confirm(`Delete "${scene.title}"? This cannot be undone.`)) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteScene(storyId, scene.id, worldId);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <>
      <article className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4">
        <div className="flex flex-wrap items-start gap-2">
          <span className="mt-0.5 text-xs tabular-nums text-[var(--brand-text-secondary)]">
            {index + 1}.
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-[var(--brand-text-secondary)]">
              {scene.title}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-[var(--brand-text-secondary)]">
              {scene.summary}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {scene.characters.map((c) => (
                <span key={c.id} className={studioWarmChip}>
                  {c.name}
                </span>
              ))}
              {scene.location_display && (
                <span className="text-xs text-[var(--brand-text-secondary)]">
                  @ {scene.location_display}
                </span>
              )}
            </div>
            {error && (
              <p className="mt-2 text-xs text-[var(--status-danger-text)]">{error}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={openEdit}
                className={studioBtnSecondary}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending}
                className="inline-flex items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5 px-3.5 py-1.5 text-sm font-medium text-[var(--status-danger-text)] transition hover:border-red-500/40 hover:bg-red-500/10 disabled:opacity-60"
              >
                {pending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      </article>

      {editOpen && (
        <SceneCreateStudio
          key={`edit-${scene.id}-${editSession}`}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          worldId={worldId}
          storyId={storyId}
          cast={cast}
          locations={locations}
          scene={scene}
        />
      )}
    </>
  );
}
