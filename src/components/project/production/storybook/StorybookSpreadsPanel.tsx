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
import { StudioEmptyState } from "@/components/studio/StudioEmptyState";
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

  function runAction(action: () => Promise<{ error?: string }>) {
    startTransition(async () => {
      setError(null);
      const result = await action();
      if (result.error) setError(result.error);
      else router.refresh();
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
          Spreads are your picture-book production units.
        </p>
        <button
          type="button"
          onClick={() => runAction(() => createStorybookSpread(projectId))}
          disabled={pending}
          className={studioBtnPrimarySm}
        >
          Add Spread
        </button>
      </div>

      {spreads.length === 0 ? (
        <StudioEmptyState
          headline="No spreads yet"
          description="Add spreads to map your story across pages."
        />
      ) : (
        <ProductionEntityList
          items={spreads}
          onReorder={(orderedIds) =>
            reorderStorybookSpreads(projectId, orderedIds)
          }
          onRename={(id, name) => renameStorybookSpread(projectId, id, name)}
          onDelete={(id) => deleteStorybookSpread(projectId, id)}
        />
      )}
    </div>
  );
}
