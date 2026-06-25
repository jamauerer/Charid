"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
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
import { ProductionEntityList } from "@/components/project/production/ProductionEntityList";
import { ProductionUnitCard } from "@/components/project/production/ProductionUnitCard";
import { StudioEmptyState } from "@/components/studio/StudioEmptyState";
import { groupScreenplayBeatsByAct } from "@/lib/production-reading-order";
import { screenplayBeatWorkspacePath } from "@/lib/production-routes";
import { studioBtnPrimarySm } from "@/lib/visual-identity";
import type { ScreenplayActWithBeats } from "@/types/production/screenplay";

type ScreenplayBeatsPanelProps = {
  projectId: string;
  acts: ScreenplayActWithBeats[];
};

export function ScreenplayBeatsPanel({ projectId, acts }: ScreenplayBeatsPanelProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const groups = groupScreenplayBeatsByAct(acts);
  const hasBeats = groups.some((group) => group.beats.length > 0);

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

  if (!hasBeats && acts.length === 0) {
    return (
      <div className="space-y-4">
        {error && <ErrorBanner message={error} />}
        <StudioEmptyState
          headline="No beats yet"
          description="Start your beat sheet by adding your first story beat."
        />
        <button
          type="button"
          onClick={() =>
            runAction(async () => {
              const actResult = await createScreenplayAct(projectId);
              if (actResult.error || !actResult.act) {
                return { error: actResult.error ?? "Failed to create act." };
              }
              return createScreenplayBeat(projectId, actResult.act.id);
            })
          }
          disabled={pending}
          className={studioBtnPrimarySm}
        >
          Add first beat
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${pending ? "opacity-80" : ""}`}>
      {error && <ErrorBanner message={error} />}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-[var(--brand-text-muted)]">
          Open a beat to work on your screenplay structure. Acts group beats for
          pacing.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => runAction(() => createScreenplayAct(projectId))}
            disabled={pending}
            className="rounded-lg border border-[var(--brand-border)] px-2 py-1 text-xs font-medium"
          >
            Add act
          </button>
          {acts.length === 1 && (
            <button
              type="button"
              onClick={() => runAction(() => createScreenplayBeat(projectId, acts[0].id))}
              disabled={pending}
              className={studioBtnPrimarySm}
            >
              Add beat
            </button>
          )}
        </div>
      </div>

      {groups.map((group) => (
        <section key={group.actId} className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
            {group.actName}
          </h3>
          {group.beats.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--brand-border)] px-4 py-6 text-center">
              <p className="text-sm text-[var(--brand-text-muted)]">No beats in this act yet.</p>
              <button
                type="button"
                onClick={() => runAction(() => createScreenplayBeat(projectId, group.actId))}
                disabled={pending}
                className={`mt-3 ${studioBtnPrimarySm}`}
              >
                Add beat to {group.actName}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.beats.map((beat) => (
                  <ProductionUnitCard
                    key={beat.id}
                    href={screenplayBeatWorkspacePath(projectId, beat.id)}
                    indexLabel={`Beat ${beat.beatNumber}`}
                    title={beat.name}
                    subtitle={beat.actName}
                    meta="Beat sheet entry"
                    status={beat.status}
                  />
                ))}
              </div>
              <details className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-3">
                <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
                  Reorder & manage beats
                </summary>
                <div className="mt-3">
                  <ProductionEntityList
                    items={group.beats.map((beat) => ({ id: beat.id, name: beat.name }))}
                    onReorder={(orderedIds) =>
                      reorderScreenplayBeats(projectId, group.actId, orderedIds)
                    }
                    onRename={(id, name) => renameScreenplayBeat(projectId, id, name)}
                    onDelete={(id) => deleteScreenplayBeat(projectId, id)}
                  />
                  <button
                    type="button"
                    onClick={() => runAction(() => createScreenplayBeat(projectId, group.actId))}
                    disabled={pending}
                    className={`mt-3 ${studioBtnPrimarySm}`}
                  >
                    Add beat to {group.actName}
                  </button>
                </div>
              </details>
            </>
          )}
        </section>
      ))}

      {acts.length > 0 && (
        <details className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-3">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
            Book structure
          </summary>
          <p className="mt-2 text-xs text-[var(--brand-text-muted)]">
            Acts organize your beat sheet in reading order.
          </p>
          <div className="mt-3">
            <ProductionEntityList
              items={acts.map((act) => ({ id: act.id, name: act.name }))}
              onReorder={(orderedIds) => reorderScreenplayActs(projectId, orderedIds)}
              onRename={(id, name) => renameScreenplayAct(projectId, id, name)}
              onDelete={(id) => deleteScreenplayAct(projectId, id)}
            />
          </div>
        </details>
      )}
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
