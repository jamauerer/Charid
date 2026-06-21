"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  approveSceneSuggestion,
  discardSceneSuggestion,
  dismissSceneSuggestionBatch,
  generateSceneSuggestions,
  getActiveSceneSuggestionBatch,
  regenerateSceneSuggestionItem,
} from "@/app/actions/scene-suggestions";
import type { StoryCharacterEntry } from "@/app/actions/stories";
import type { Chapter } from "@/types/chapter";
import type { SceneSuggestionBatchView } from "@/types/scene-suggestion";
import { ConfirmDialog } from "@/components/studio/ConfirmDialog";
import { SceneSuggestionEditStudio } from "@/components/scene-workspace/SceneSuggestionEditStudio";
import type { StoryLocationOption } from "@/components/scene-workspace/SceneCard";
import { CREATOR_STORY } from "@/lib/creator-vocabulary";
import {
  studioBtnPrimarySm,
  studioBtnSecondary,
  studioWarmChip,
} from "@/lib/visual-identity";

type SceneSuggestionStagingPanelProps = {
  worldId: string;
  storyId: string;
  storyTitle: string;
  initialBatch: SceneSuggestionBatchView | null;
  cast: StoryCharacterEntry[];
  chapters?: Chapter[];
  locations: StoryLocationOption[];
  chapterId?: string;
  sceneId?: string;
  batchError?: string;
};

type SuggestionConfirmAction =
  | { type: "discard"; itemId: string }
  | { type: "clear-all" }
  | null;

export function SceneSuggestionStagingPanel({
  worldId,
  storyId,
  storyTitle,
  initialBatch,
  cast,
  chapters = [],
  locations,
  chapterId: fixedChapterId,
  sceneId,
  batchError,
}: SceneSuggestionStagingPanelProps) {
  const router = useRouter();
  const [batch, setBatch] = useState(initialBatch);
  const [error, setError] = useState<string | null>(batchError ?? null);
  const [pending, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [editSession, setEditSession] = useState(0);
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [confirmAction, setConfirmAction] = useState<SuggestionConfirmAction>(
    null
  );

  const pendingItems = batch?.items.filter((i) => i.status === "pending") ?? [];
  const hasActiveBatch = pendingItems.length > 0;
  const chapterId = fixedChapterId ?? (selectedChapterId || undefined);

  function refreshFromServer() {
    router.refresh();
  }

  function handleGenerate() {
    if (hasActiveBatch) {
      return;
    }

    setError(null);
    setActionId("generate");
    startTransition(async () => {
      const result = await generateSceneSuggestions({
        worldId,
        storyId,
        chapterId,
        sceneId,
      });
      if (result.error) {
        setError(result.error);
        setActionId(null);
        return;
      }
      setBatch(result.batch);
      setActionId(null);
      refreshFromServer();
    });
  }

  function runItemAction(
    itemId: string,
    action: () => Promise<{ error?: string }>
  ) {
    setError(null);
    setActionId(itemId);
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        setError(result.error);
        setActionId(null);
        return;
      }
      setActionId(null);
      refreshFromServer();
      const { batch: next } = await getActiveSceneSuggestionBatch(storyId);
      setBatch(next);
    });
  }

  function openEdit(itemId: string) {
    setEditSession((s) => s + 1);
    setEditItemId(itemId);
  }

  const editItem = batch?.items.find((i) => i.id === editItemId) ?? null;

  function handleConfirmAction() {
    if (!confirmAction || !batch) return;

    if (confirmAction.type === "discard") {
      runItemAction(confirmAction.itemId, () =>
        discardSceneSuggestion({
          worldId,
          storyId,
          batchId: batch.id,
          itemId: confirmAction.itemId,
        })
      );
    } else {
      runItemAction("dismiss", () =>
        dismissSceneSuggestionBatch({
          worldId,
          storyId,
          batchId: batch.id,
        })
      );
    }
    setConfirmAction(null);
  }

  const confirmDialogProps =
    confirmAction?.type === "discard"
      ? {
          title: "Discard suggestion",
          description:
            "Discard this suggestion? It won't be saved as a scene.",
          confirmLabel: "Discard",
        }
      : confirmAction?.type === "clear-all"
        ? {
            title: "Clear suggestions",
            description:
              "Clear all pending suggestions? Nothing saves until you approve scenes.",
            confirmLabel: "Clear all",
          }
        : null;

  return (
    <div className="rounded-xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[var(--foreground)]">
            {hasActiveBatch
              ? CREATOR_STORY.reviewActiveSuggestionsLabel
              : CREATOR_STORY.needSceneIdeasLabel}
          </p>
          <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
            {hasActiveBatch
              ? CREATOR_STORY.reviewActiveSuggestionsHint
              : CREATOR_STORY.needSceneIdeasHint}
          </p>
          {!hasActiveBatch && (
            <p className="mt-2 text-xs text-[var(--brand-text-secondary)]">
              For{" "}
              <span className="text-[var(--brand-text-secondary)]">{storyTitle}</span>{" "}
              — nothing saves until you approve.
            </p>
          )}
        </div>
        {!hasActiveBatch && (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={pending || cast.length === 0}
            className={studioBtnPrimarySm}
            title={
              cast.length === 0
                ? "Add characters to your story first"
                : undefined
            }
          >
            {pending && actionId === "generate"
              ? "Generating…"
              : CREATOR_STORY.generateSceneSuggestionsLabel}
          </button>
        )}
      </div>

      {!hasActiveBatch && chapters.length > 0 && !fixedChapterId && (
        <label className="mt-3 block max-w-sm text-xs">
          <span className="text-[var(--brand-text-secondary)]">
            {CREATOR_STORY.chapterContextLabel}
          </span>
          <select
            value={selectedChapterId}
            onChange={(event) => setSelectedChapterId(event.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-2.5 py-1.5 text-sm text-[var(--brand-text-secondary)]"
          >
            <option value="">None — story-wide</option>
            {chapters.map((chapter) => (
              <option key={chapter.id} value={chapter.id}>
                {chapter.title}
              </option>
            ))}
          </select>
        </label>
      )}

      {!hasActiveBatch && cast.length === 0 && (
        <p className="mt-3 text-xs text-[var(--brand-text-secondary)]">
          Add at least one character to your story cast before generating ideas.
        </p>
      )}

      {(error || batchError) && (
        <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-[var(--status-danger-text)]">
          {error ?? batchError}
        </p>
      )}

      {hasActiveBatch && (
        <div className="mt-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--brand-text-muted)]">
            Suggested — review before saving
          </p>
          <ul className="space-y-2">
            {pendingItems.map((item) => {
              const busy = pending && actionId === item.id;
              return (
                <li
                  key={item.id}
                  className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] px-3 py-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-[var(--brand-border)] bg-[var(--tag-primary-bg)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--tag-primary-text)]">
                          Suggested
                        </span>
                        <h4 className="text-sm font-semibold text-[var(--brand-text-secondary)]">
                          {item.payload.title}
                        </h4>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-[var(--brand-text-secondary)]">
                        {item.payload.summary}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {item.character_names.map((name) => (
                          <span key={name} className={studioWarmChip}>
                            {name}
                          </span>
                        ))}
                        {item.location_display && (
                          <span className="text-xs text-[var(--brand-text-secondary)]">
                            @ {item.location_display}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          batch &&
                          runItemAction(item.id, () =>
                            approveSceneSuggestion({
                              worldId,
                              storyId,
                              batchId: batch.id,
                              itemId: item.id,
                            })
                          )
                        }
                        className={`${studioBtnPrimarySm} text-xs px-2.5 py-1`}
                      >
                        {busy ? "Saving…" : "Approve"}
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => openEdit(item.id)}
                        className={`${studioBtnSecondary} text-xs px-2.5 py-1`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          setConfirmAction({
                            type: "discard",
                            itemId: item.id,
                          })
                        }
                        className="rounded-lg border border-red-500/20 bg-red-500/5 px-2.5 py-1 text-xs font-medium text-[var(--status-danger-text)] transition hover:border-red-500/40 disabled:opacity-60"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() =>
                          batch &&
                          runItemAction(item.id, () =>
                            regenerateSceneSuggestionItem({
                              worldId,
                              storyId,
                              batchId: batch.id,
                              itemId: item.id,
                            })
                          )
                        }
                        className="rounded-lg px-2.5 py-1 text-xs text-[var(--brand-text-secondary)] transition hover:bg-[var(--brand-surface)] hover:text-[var(--brand-text-secondary)] disabled:opacity-60"
                      >
                        {busy ? "…" : "Regenerate"}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {batch && (
            <button
              type="button"
              disabled={pending}
              onClick={() => setConfirmAction({ type: "clear-all" })}
              className="mt-3 text-xs text-[var(--brand-text-secondary)] transition hover:text-[var(--brand-text-secondary)]"
            >
              Clear all suggestions
            </button>
          )}
        </div>
      )}

      {editItem && batch && (
        <SceneSuggestionEditStudio
          key={`edit-suggestion-${editSession}`}
          open
          onClose={() => setEditItemId(null)}
          worldId={worldId}
          storyId={storyId}
          batchId={batch.id}
          item={editItem}
          cast={cast}
          locations={locations}
          onSaved={() => {
            setEditItemId(null);
            refreshFromServer();
            void getActiveSceneSuggestionBatch(storyId).then(({ batch: next }) => {
              setBatch(next);
            });
          }}
        />
      )}

      {confirmDialogProps && (
        <ConfirmDialog
          open={confirmAction !== null}
          title={confirmDialogProps.title}
          description={confirmDialogProps.description}
          confirmLabel={confirmDialogProps.confirmLabel}
          pending={pending && confirmAction !== null}
          onConfirm={handleConfirmAction}
          onCancel={() => {
            if (!pending) {
              setConfirmAction(null);
            }
          }}
        />
      )}
    </div>
  );
}
