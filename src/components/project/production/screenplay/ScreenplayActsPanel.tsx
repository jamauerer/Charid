"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createScreenplayAct,
  createScreenplayBeat,
  deleteScreenplayAct,
  deleteScreenplayBeat,
  renameScreenplayAct,
  renameScreenplayBeat,
  reorderScreenplayActs,
  reorderScreenplayBeats,
} from "@/app/actions/production/screenplay";
import { ProductionAccordion } from "@/components/project/production/ProductionAccordion";
import { ProductionEntityList } from "@/components/project/production/ProductionEntityList";
import { StudioEmptyState } from "@/components/studio/StudioEmptyState";
import { reorderById } from "@/lib/production-reorder";
import { studioBtnPrimarySm } from "@/lib/visual-identity";
import type { ScreenplayActWithBeats } from "@/types/production/screenplay";

type ScreenplayActsPanelProps = {
  projectId: string;
  acts: ScreenplayActWithBeats[];
};

export function ScreenplayActsPanel({
  projectId,
  acts: initialActs,
}: ScreenplayActsPanelProps) {
  const router = useRouter();
  const [acts, setActs] = useState(initialActs);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setActs(initialActs);
  }, [initialActs]);

  function refresh() {
    router.refresh();
  }

  function runAction(action: () => Promise<{ error?: string }>) {
    startTransition(async () => {
      setError(null);
      const result = await action();
      if (result.error) setError(result.error);
      else refresh();
    });
  }

  const persistActOrder = useCallback(
    (ordered: ScreenplayActWithBeats[]) => {
      startTransition(async () => {
        setError(null);
        const result = await reorderScreenplayActs(
          projectId,
          ordered.map((act) => act.id)
        );
        if (result.error) {
          setError(result.error);
          setActs(initialActs);
        }
      });
    },
    [projectId, initialActs]
  );

  if (acts.length === 0) {
    return (
      <div className="space-y-4">
        {error && <ErrorBanner message={error} />}
        <StudioEmptyState
          headline="No acts yet"
          description="Add your first act to begin organizing beat sheet entries."
        />
        <button
          type="button"
          onClick={() => runAction(() => createScreenplayAct(projectId))}
          disabled={pending}
          className={studioBtnPrimarySm}
        >
          Add Act
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${pending ? "opacity-80" : ""}`}>
      {error && <ErrorBanner message={error} />}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-[var(--brand-text-muted)]">
          Drag acts to reorder. Beats are managed inside each act.
        </p>
        <button
          type="button"
          onClick={() => runAction(() => createScreenplayAct(projectId))}
          disabled={pending}
          className={studioBtnPrimarySm}
        >
          Add Act
        </button>
      </div>

      <div className="space-y-3">
        {acts.map((act, index) => (
          <div
            key={act.id}
            draggable
            onDragStart={() => setDraggedId(act.id)}
            onDragEnd={() => {
              setDraggedId(null);
              setDropTargetId(null);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDropTargetId(act.id);
            }}
            onDrop={() => {
              if (!draggedId || draggedId === act.id) return;
              const next = reorderById(acts, draggedId, act.id);
              setActs(next);
              setDraggedId(null);
              setDropTargetId(null);
              persistActOrder(next);
            }}
            className={
              draggedId === act.id
                ? "opacity-60"
                : dropTargetId === act.id
                  ? "ring-2 ring-[var(--brand-accent)] ring-offset-2 ring-offset-[var(--brand-bg)]"
                  : undefined
            }
          >
            <ProductionAccordion
              title={act.name}
              count={act.beats.length}
              defaultExpanded={index === 0}
              action={
                <div className="flex flex-wrap items-center gap-2">
                  <span className="cursor-grab text-[var(--brand-text-muted)]">⠿</span>
                  <button
                    type="button"
                    onClick={() =>
                      runAction(() => createScreenplayBeat(projectId, act.id))
                    }
                    disabled={pending}
                    className="rounded-lg border border-[var(--brand-border)] px-2 py-1 text-xs font-medium"
                  >
                    Add Beat
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next = prompt("Rename act", act.name);
                      if (next?.trim()) {
                        runAction(() =>
                          renameScreenplayAct(projectId, act.id, next.trim())
                        );
                      }
                    }}
                    disabled={pending}
                    className="rounded-lg px-2 py-1 text-xs font-medium text-[var(--brand-text-secondary)]"
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete "${act.name}" and all beats?`)) {
                        runAction(() => deleteScreenplayAct(projectId, act.id));
                      }
                    }}
                    disabled={pending}
                    className="rounded-lg px-2 py-1 text-xs font-medium text-[var(--status-danger-text)]"
                  >
                    Delete
                  </button>
                </div>
              }
            >
              <ProductionEntityList
                items={act.beats}
                onReorder={(orderedIds) =>
                  reorderScreenplayBeats(projectId, act.id, orderedIds)
                }
                onRename={(id, name) => renameScreenplayBeat(projectId, id, name)}
                onDelete={(id) => deleteScreenplayBeat(projectId, id)}
                emptyMessage="No beats in this act yet."
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
