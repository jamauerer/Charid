"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  createComicPanel,
  deleteComicPanel,
  renameComicPanel,
  reorderComicPanels,
} from "@/app/actions/production/comic";
import { ProductionEntityList } from "@/components/project/production/ProductionEntityList";
import type { ComicPanel } from "@/types/production/comic";

type ComicPagePanelsSidebarProps = {
  projectId: string;
  pageId: string;
  panels: ComicPanel[];
  selectedPanelId?: string | null;
  onSelectPanel?: (panelId: string) => void;
  onAddPanel?: () => void;
  compact?: boolean;
};

export function ComicPagePanelsSidebar({
  projectId,
  pageId,
  panels,
  selectedPanelId,
  onSelectPanel,
  onAddPanel,
  compact = true,
}: ComicPagePanelsSidebarProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function refresh() {
    router.refresh();
  }

  function runAction(action: () => Promise<{ error?: string }>) {
    startTransition(async () => {
      const result = await action();
      if (!result.error) refresh();
    });
  }

  return (
    <div className={pending ? "opacity-80" : undefined}>
      <ProductionEntityList
        items={panels.map((panel) => ({ id: panel.id, name: panel.name }))}
        selectedId={selectedPanelId}
        onSelect={onSelectPanel}
        emptyMessage="No panels yet."
        emptyAction={
          onAddPanel ? (
            <button type="button" onClick={onAddPanel} disabled={pending} className="production-editor-btn w-full">
              Add first panel
            </button>
          ) : (
            <button
              type="button"
              onClick={() => runAction(() => createComicPanel(projectId, pageId))}
              disabled={pending}
              className="production-editor-btn w-full"
            >
              Add first panel
            </button>
          )
        }
        onReorder={(orderedIds) => reorderComicPanels(projectId, pageId, orderedIds)}
        onRename={(id, name) => renameComicPanel(projectId, id, name)}
        onDelete={(id) => deleteComicPanel(projectId, id)}
      />
      {panels.length > 0 && !compact && (
        <button
          type="button"
          onClick={() =>
            onAddPanel
              ? onAddPanel()
              : runAction(() => createComicPanel(projectId, pageId))
          }
          disabled={pending}
          className="production-editor-btn mt-2 w-full"
        >
          Add panel
        </button>
      )}
    </div>
  );
}
