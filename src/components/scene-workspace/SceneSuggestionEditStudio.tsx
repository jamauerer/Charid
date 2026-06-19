"use client";

import { useState, useTransition } from "react";
import { ModalPortal } from "@/components/ModalPortal";
import { updateSceneSuggestionItem } from "@/app/actions/scene-suggestions";
import type { StoryCharacterEntry } from "@/app/actions/stories";
import type { SceneSuggestionItemView } from "@/types/scene-suggestion";
import type { StoryLocationOption } from "@/components/scene-workspace/SceneCard";
import { CREATOR_STORY } from "@/lib/creator-vocabulary";
import { studioBtnPrimary } from "@/lib/visual-identity";

type SceneSuggestionEditStudioProps = {
  open: boolean;
  onClose: () => void;
  worldId: string;
  storyId: string;
  batchId: string;
  item: SceneSuggestionItemView;
  cast: StoryCharacterEntry[];
  locations: StoryLocationOption[];
  onSaved: () => void;
};

export function SceneSuggestionEditStudio({
  open,
  onClose,
  worldId,
  storyId,
  batchId,
  item,
  cast,
  locations,
  onSaved,
}: SceneSuggestionEditStudioProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    item.payload.character_ids
  );
  const [locationMode, setLocationMode] = useState<"linked" | "custom">(() =>
    item.payload.world_location_id ? "linked" : locations.length > 0 ? "linked" : "custom"
  );
  const [linkedLocationId, setLinkedLocationId] = useState(
    item.payload.world_location_id ?? ""
  );
  const [title, setTitle] = useState(item.payload.title);
  const [summary, setSummary] = useState(item.payload.summary);
  const [locationLabel, setLocationLabel] = useState(
    item.payload.location_label ?? ""
  );

  if (!open) return null;

  function toggleCharacter(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const hasLocations = locations.length > 0;
  const useLinkedLocation = hasLocations && locationMode === "linked";

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await updateSceneSuggestionItem({
        worldId,
        storyId,
        batchId,
        itemId: item.id,
        payload: {
          title: title.trim(),
          summary: summary.trim(),
          character_ids: selectedIds,
          world_location_id:
            useLinkedLocation && linkedLocationId ? linkedLocationId : null,
          location_label:
            useLinkedLocation && linkedLocationId ? null : locationLabel.trim() || null,
        },
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      onSaved();
    });
  }

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
            <div className="shrink-0 border-b border-[var(--brand-border)] bg-gradient-to-br  px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    Edit suggestion
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-[var(--brand-text-secondary)]">
                    Change before you approve
                  </h2>
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

            <form onSubmit={handleSave} className="overflow-y-auto p-5 space-y-5">
              {error && (
                <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-[var(--status-danger-text)]">
                  {error}
                </p>
              )}

              <div>
                <label
                  htmlFor="suggestion-title"
                  className="mb-2 block text-xs font-medium text-[var(--brand-text-secondary)]"
                >
                  Title
                </label>
                <input
                  id="suggestion-title"
                  type="text"
                  required
                  maxLength={200}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-3 text-lg font-medium text-[var(--brand-text-secondary)] focus:border-[var(--brand-accent)] focus:outline-none focus:ring-1 focus:ring-[color-mix(in_srgb,var(--brand-accent)_20%,transparent)]"
                />
              </div>

              <div>
                <label
                  htmlFor="suggestion-summary"
                  className="mb-2 block text-xs font-medium text-[var(--brand-text-secondary)]"
                >
                  {CREATOR_STORY.sceneWhatHappensLabel}
                </label>
                <textarea
                  id="suggestion-summary"
                  required
                  rows={3}
                  maxLength={2000}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full resize-y rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-3 text-sm leading-relaxed text-[var(--brand-text-secondary)] focus:border-[var(--brand-accent)] focus:outline-none focus:ring-1 focus:ring-[color-mix(in_srgb,var(--brand-accent)_20%,transparent)]"
                />
              </div>

              <fieldset>
                <legend className="mb-2 text-xs font-medium text-[var(--brand-text-secondary)]">
                  Characters
                </legend>
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
                    value={linkedLocationId}
                    onChange={(e) => setLinkedLocationId(e.target.value)}
                    className="w-full rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-2.5 text-sm text-[var(--brand-text-secondary)] focus:border-[var(--brand-accent)] focus:outline-none focus:ring-1 focus:ring-[color-mix(in_srgb,var(--brand-accent)_20%,transparent)]"
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
                    type="text"
                    maxLength={200}
                    value={locationLabel}
                    onChange={(e) => setLocationLabel(e.target.value)}
                    placeholder="Pleasure Point"
                    className="w-full rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-2.5 text-sm text-[var(--brand-text-secondary)] placeholder:text-[var(--brand-text-secondary)] focus:border-[var(--brand-accent)] focus:outline-none focus:ring-1 focus:ring-[color-mix(in_srgb,var(--brand-accent)_20%,transparent)]"
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={pending || selectedIds.length === 0}
                className={`${studioBtnPrimary} w-full py-3`}
              >
                {pending ? "Saving…" : "Save changes"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
