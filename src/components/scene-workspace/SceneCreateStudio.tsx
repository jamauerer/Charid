"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ModalPortal } from "@/components/ModalPortal";
import {
  createScene,
  updateScene,
  type SceneActionState,
} from "@/app/actions/scenes";
import type { StoryCharacterEntry } from "@/app/actions/stories";
import type { SceneWithCast } from "@/types/scene";
import type { StoryLocationOption } from "@/components/scene-workspace/SceneCard";
import type { SceneInsertPlacement } from "@/lib/scenes/scene-insert-order";
import { CREATOR_STORY } from "@/lib/creator-vocabulary";
import { studioBtnPrimary } from "@/lib/visual-identity";

type SceneCreateStudioProps = {
  open: boolean;
  onClose: () => void;
  worldId: string;
  storyId: string;
  cast: StoryCharacterEntry[];
  locations?: StoryLocationOption[];
  scene?: SceneWithCast | null;
  insertPlacement?: SceneInsertPlacement | null;
};

function insertPlacementLabel(placement: SceneInsertPlacement | null | undefined): string | null {
  if (!placement || placement.mode === "end") return null;
  if (placement.mode === "start") return "Inserting at the start of the timeline";
  if (placement.mode === "after") return "Inserting after the selected scene";
  return "Inserting before the selected scene";
}

export function SceneCreateStudio({
  open,
  onClose,
  worldId,
  storyId,
  cast,
  locations = [],
  scene,
  insertPlacement = null,
}: SceneCreateStudioProps) {
  const router = useRouter();
  const isEdit = Boolean(scene);
  const action = isEdit ? updateScene : createScene;
  const [state, formAction, pending] = useActionState<SceneActionState, FormData>(
    action,
    {}
  );
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (scene) {
      return scene.characters.map((c) => c.id);
    }
    return cast.length === 1 ? [cast[0].character.id] : [];
  });
  const [locationMode, setLocationMode] = useState<"linked" | "custom">(() => {
    if (scene?.world_location_id) return "linked";
    return locations.length > 0 ? "linked" : "custom";
  });
  const [linkedLocationId, setLinkedLocationId] = useState(
    scene?.world_location_id ?? ""
  );

  useEffect(() => {
    if (state.success) {
      onClose();
      router.refresh();
    }
  }, [state.success, onClose, router]);

  if (!open) return null;

  function toggleCharacter(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const hasLocations = locations.length > 0;
  const useLinkedLocation = hasLocations && locationMode === "linked";
  const placementHint = !isEdit ? insertPlacementLabel(insertPlacement) : null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] overflow-y-auto">
        <button
          type="button"
          aria-label="Close"
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
          onClick={onClose}
        />
        <div className="flex min-h-full items-start justify-center p-4 sm:items-center sm:p-6">
          <div className="relative z-10 flex w-full max-w-lg max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-[var(--status-info-border)] bg-[var(--brand-surface)] shadow-lg">
            <div className="shrink-0 border-b border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    {isEdit ? "Edit scene" : "New scene"}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-[var(--brand-text-secondary)]">
                    {isEdit ? scene!.title : "What happens next?"}
                  </h2>
                  {placementHint && (
                    <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
                      {placementHint}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md p-1.5 text-[var(--brand-text-secondary)] transition hover:bg-[var(--brand-surface-elevated)] hover:text-[var(--brand-text-secondary)]"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            <form action={formAction} className="overflow-y-auto p-5 space-y-5">
              <input type="hidden" name="story_id" value={storyId} />
              <input type="hidden" name="world_id" value={worldId} />
              {scene && (
                <input type="hidden" name="scene_id" value={scene.id} />
              )}
              {!isEdit && insertPlacement && (
                <>
                  <input
                    type="hidden"
                    name="insert_placement"
                    value={insertPlacement.mode}
                  />
                  {(insertPlacement.mode === "after" ||
                    insertPlacement.mode === "before") && (
                    <input
                      type="hidden"
                      name="insert_anchor_scene_id"
                      value={insertPlacement.sceneId}
                    />
                  )}
                </>
              )}
              {selectedIds.map((id) => (
                <input key={id} type="hidden" name="character_ids" value={id} />
              ))}
              {useLinkedLocation && linkedLocationId && (
                <input
                  type="hidden"
                  name="world_location_id"
                  value={linkedLocationId}
                />
              )}

              {state.error && (
                <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-[var(--status-danger-text)]">
                  {state.error}
                </p>
              )}

              <div>
                <label
                  htmlFor="scene-title"
                  className="mb-2 block text-xs font-medium text-[var(--brand-text-secondary)]"
                >
                  Title
                </label>
                <input
                  id="scene-title"
                  name="title"
                  type="text"
                  required
                  maxLength={200}
                  defaultValue={scene?.title ?? ""}
                  placeholder="The Giant Wave"
                  autoFocus
                  className="w-full rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-3 text-lg font-medium text-[var(--brand-text-secondary)] placeholder:text-[var(--brand-text-secondary)] focus:border-[var(--brand-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)]"
                />
              </div>

              <div>
                <label
                  htmlFor="scene-summary"
                  className="mb-2 block text-xs font-medium text-[var(--brand-text-secondary)]"
                >
                  {CREATOR_STORY.sceneWhatHappensLabel}
                </label>
                <textarea
                  id="scene-summary"
                  name="summary"
                  required
                  rows={3}
                  maxLength={2000}
                  defaultValue={scene?.summary ?? ""}
                  placeholder="Jake sees the biggest wave of his life."
                  className="w-full resize-y rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-3 text-sm leading-relaxed text-[var(--brand-text-secondary)] placeholder:text-[var(--brand-text-secondary)] focus:border-[var(--brand-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)]"
                />
              </div>

              <fieldset>
                <legend className="mb-2 text-xs font-medium text-[var(--brand-text-secondary)]">
                  Characters{" "}
                  <span className="font-normal text-[var(--brand-text-secondary)]">
                    ({CREATOR_STORY.sceneCharactersOptional})
                  </span>
                </legend>
                {cast.length === 0 ? (
                  <p className="text-sm text-[var(--brand-text-secondary)]">
                    {CREATOR_STORY.sceneCharactersEmptyHint}
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {cast.map(({ character }) => {
                      const selected = selectedIds.includes(character.id);
                      return (
                        <button
                          key={character.id}
                          type="button"
                          onClick={() => toggleCharacter(character.id)}
                          className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                            selected
                              ? "border-[var(--status-info-border)] bg-[var(--status-info-bg)] text-neutral-900"
                              : "border-[var(--brand-border)] bg-[var(--brand-surface)] text-[var(--brand-text-secondary)] hover:border-white/20 hover:text-[var(--brand-text-secondary)]"
                          }`}
                        >
                          {character.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </fieldset>

              <div>
                <label className="mb-2 block text-xs font-medium text-[var(--brand-text-secondary)]">
                  {CREATOR_STORY.sceneLocationLabel}{" "}
                  <span className="font-normal text-[var(--brand-text-secondary)]">
                    ({CREATOR_STORY.sceneLocationOptional})
                  </span>
                </label>

                {hasLocations && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setLocationMode("linked")}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                        locationMode === "linked"
                          ? "border-[var(--status-info-border)] bg-[var(--status-info-bg)] text-neutral-900"
                          : "border-[var(--brand-border)] text-[var(--brand-text-secondary)]"
                      }`}
                    >
                      Pick a place
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocationMode("custom")}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                        locationMode === "custom"
                          ? "border-[var(--status-info-border)] bg-[var(--status-info-bg)] text-neutral-900"
                          : "border-[var(--brand-border)] text-[var(--brand-text-secondary)]"
                      }`}
                    >
                      Type a place
                    </button>
                  </div>
                )}

                {useLinkedLocation ? (
                  <select
                    id="scene-location-select"
                    value={linkedLocationId}
                    onChange={(e) => setLinkedLocationId(e.target.value)}
                    className="w-full rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-2.5 text-sm text-[var(--brand-text-secondary)] focus:border-[var(--brand-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)]"
                  >
                    <option value="">Choose a location…</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="scene-location"
                    name="location_label"
                    type="text"
                    maxLength={200}
                    defaultValue={scene?.location_label ?? ""}
                    placeholder="Pleasure Point"
                    className="w-full rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-2.5 text-sm text-[var(--brand-text-secondary)] placeholder:text-[var(--brand-text-secondary)] focus:border-[var(--brand-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)]"
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={pending}
                className={`${studioBtnPrimary} w-full py-3`}
              >
                {pending ? "Saving…" : "Save scene"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
