"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createNovelChapter,
  createNovelPart,
  deleteNovelChapter,
  deleteNovelPart,
  renameNovelChapter,
  renameNovelPart,
  reorderNovelChapters,
  reorderNovelParts,
} from "@/app/actions/production/novel";
import { ProductionAccordion } from "@/components/project/production/ProductionAccordion";
import { ProductionEntityList } from "@/components/project/production/ProductionEntityList";
import { StudioEmptyState } from "@/components/studio/StudioEmptyState";
import { reorderById } from "@/lib/production-reorder";
import { studioBtnPrimarySm } from "@/lib/visual-identity";
import type { NovelPartWithChapters } from "@/types/production/novel";

type NovelPartsPanelProps = {
  projectId: string;
  parts: NovelPartWithChapters[];
};

export function NovelPartsPanel({ projectId, parts: initialParts }: NovelPartsPanelProps) {
  const router = useRouter();
  const [parts, setParts] = useState(initialParts);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setParts(initialParts);
  }, [initialParts]);

  function refresh() {
    router.refresh();
  }

  const persistPartOrder = useCallback(
    (ordered: NovelPartWithChapters[]) => {
      startTransition(async () => {
        setError(null);
        const result = await reorderNovelParts(
          projectId,
          ordered.map((part) => part.id)
        );
        if (result.error) {
          setError(result.error);
          setParts(initialParts);
        }
      });
    },
    [projectId, initialParts]
  );

  function handlePartDrop(targetId: string) {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDropTargetId(null);
      return;
    }
    const next = reorderById(parts, draggedId, targetId);
    setParts(next);
    setDraggedId(null);
    setDropTargetId(null);
    persistPartOrder(next);
  }

  function runAction(action: () => Promise<{ error?: string }>) {
    startTransition(async () => {
      setError(null);
      const result = await action();
      if (result.error) setError(result.error);
      else refresh();
    });
  }

  if (parts.length === 0) {
    return (
      <div className="space-y-4">
        {error && <ErrorBanner message={error} />}
        <StudioEmptyState
          headline="No parts yet"
          description="Add your first part to begin organizing chapters."
        />
        <button
          type="button"
          onClick={() => runAction(() => createNovelPart(projectId))}
          disabled={pending}
          className={studioBtnPrimarySm}
        >
          Add Part
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${pending ? "opacity-80" : ""}`}>
      {error && <ErrorBanner message={error} />}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-[var(--brand-text-muted)]">
          Drag parts to reorder. Chapters live inside each part.
        </p>
        <button
          type="button"
          onClick={() => runAction(() => createNovelPart(projectId))}
          disabled={pending}
          className={studioBtnPrimarySm}
        >
          Add Part
        </button>
      </div>

      <div className="space-y-3">
        {parts.map((part, index) => (
          <div
            key={part.id}
            draggable
            onDragStart={() => setDraggedId(part.id)}
            onDragEnd={() => {
              setDraggedId(null);
              setDropTargetId(null);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDropTargetId(part.id);
            }}
            onDrop={() => handlePartDrop(part.id)}
            className={
              draggedId === part.id
                ? "opacity-60"
                : dropTargetId === part.id
                  ? "ring-2 ring-[var(--brand-accent)] ring-offset-2 ring-offset-[var(--brand-bg)]"
                  : undefined
            }
          >
            <ProductionAccordion
              title={part.name}
              count={part.chapters.length}
              defaultExpanded={index === 0}
              action={
                <div className="flex items-center gap-2">
                  <span className="cursor-grab text-[var(--brand-text-muted)]" title="Drag part">
                    ⠿
                  </span>
                  <button
                    type="button"
                    onClick={() => runAction(() => createNovelChapter(projectId, part.id))}
                    disabled={pending}
                    className="rounded-lg border border-[var(--brand-border)] px-2 py-1 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--brand-surface-elevated)] disabled:opacity-50"
                  >
                    Add Chapter
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next = prompt("Rename part", part.name);
                      if (next && next.trim()) {
                        runAction(() => renameNovelPart(projectId, part.id, next.trim()));
                      }
                    }}
                    disabled={pending}
                    className="rounded-lg px-2 py-1 text-xs font-medium text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-elevated)]"
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete "${part.name}" and all its chapters?`)) {
                        runAction(() => deleteNovelPart(projectId, part.id));
                      }
                    }}
                    disabled={pending}
                    className="rounded-lg px-2 py-1 text-xs font-medium text-[var(--status-danger-text)] hover:bg-[var(--status-danger-bg)]"
                  >
                    Delete
                  </button>
                </div>
              }
            >
              <ProductionEntityList
                items={part.chapters}
                onReorder={(orderedIds) =>
                  reorderNovelChapters(projectId, part.id, orderedIds)
                }
                onRename={(id, name) => renameNovelChapter(projectId, id, name)}
                onDelete={(id) => deleteNovelChapter(projectId, id)}
                emptyMessage="No chapters in this part yet."
              />
            </ProductionAccordion>
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] px-3 py-2 text-sm text-[var(--status-danger-text)]">
      {message}
    </p>
  );
}
