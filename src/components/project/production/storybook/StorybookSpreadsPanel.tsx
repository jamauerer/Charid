"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createStorybookSpread,
  deleteStorybookSpread,
  renameStorybookSpread,
  reorderStorybookSpreads,
} from "@/app/actions/production/storybook";
import { ProductionEntityList } from "@/components/project/production/ProductionEntityList";
import { ProductionUnitCard } from "@/components/project/production/ProductionUnitCard";
import { StudioEmptyState } from "@/components/studio/StudioEmptyState";
import { flattenStorybookSpreads } from "@/lib/production-reading-order";
import { storybookSpreadWorkspacePath } from "@/lib/production-routes";
import { studioBtnPrimarySm } from "@/lib/visual-identity";
import type { StorybookSpread } from "@/types/production/storybook";

type StorybookSpreadsPanelProps = {
  projectId: string;
  spreads: StorybookSpread[];
};

export function StorybookSpreadsPanel({
  projectId,
  spreads,
}: StorybookSpreadsPanelProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const spreadItems = flattenStorybookSpreads(spreads);

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

  return (
    <div className={`space-y-4 ${pending ? "opacity-80" : ""}`}>
      {error && (
        <p className="rounded-lg border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] px-3 py-2 text-sm text-[var(--status-danger-text)]">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-[var(--brand-text-muted)]">
          Open a spread to preview your picture book workspace. Layout editing
          arrives in a future milestone.
        </p>
        <button
          type="button"
          onClick={() => runAction(() => createStorybookSpread(projectId))}
          disabled={pending}
          className={studioBtnPrimarySm}
        >
          Add spread
        </button>
      </div>

      {spreadItems.length === 0 ? (
        <StudioEmptyState
          headline="No spreads yet"
          description="Add your first spread to start laying out your picture book."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {spreadItems.map((spread) => (
            <ProductionUnitCard
              key={spread.id}
              href={storybookSpreadWorkspacePath(projectId, spread.id)}
              indexLabel={`Spread ${spread.spreadNumber}`}
              title={spread.name}
              subtitle="Picture book spread"
              meta="Two-page layout"
              status={spread.status}
            />
          ))}
        </div>
      )}

      {spreads.length > 0 && (
        <details className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-3">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
            Reorder & manage spreads
          </summary>
          <div className="mt-3">
            <ProductionEntityList
              items={spreads.map((spread) => ({ id: spread.id, name: spread.name }))}
              onReorder={(orderedIds) => reorderStorybookSpreads(projectId, orderedIds)}
              onRename={(id, name) => renameStorybookSpread(projectId, id, name)}
              onDelete={(id) => deleteStorybookSpread(projectId, id)}
            />
          </div>
        </details>
      )}
    </div>
  );
}
