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
import { ProductionPlaceholderSection } from "@/components/project/production/ProductionPlaceholderSection";
import { studioBtnPrimarySm } from "@/lib/visual-identity";
import type { ComicPanel } from "@/types/production/comic";

type ComicPagePanelsSectionProps = {
  projectId: string;
  pageId: string;
  panels: ComicPanel[];
  selectedPanelId?: string | null;
  onSelectPanel?: (panelId: string) => void;
};

export function ComicPagePanelsSection({
  projectId,
  pageId,
  panels,
  selectedPanelId,
  onSelectPanel,
}: ComicPagePanelsSectionProps) {
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
    <ProductionPlaceholderSection
      title="Panel Layouts"
      description="Select a panel to highlight it on the page. Reorder, rename, or remove panels here."
    >
      <div className={pending ? "opacity-80" : undefined}>
        <ProductionEntityList
          items={panels.map((panel) => ({ id: panel.id, name: panel.name }))}
          selectedId={selectedPanelId}
          onSelect={onSelectPanel}
          emptyMessage="No panels on this page yet."
          emptyAction={
            <button
              type="button"
              onClick={() => runAction(() => createComicPanel(projectId, pageId))}
              disabled={pending}
              className={studioBtnPrimarySm}
            >
              Add first panel
            </button>
          }
          onReorder={(orderedIds) =>
            reorderComicPanels(projectId, pageId, orderedIds)
          }
          onRename={(id, name) => renameComicPanel(projectId, id, name)}
          onDelete={(id) => deleteComicPanel(projectId, id)}
        />
        {panels.length > 0 && (
          <button
            type="button"
            onClick={() => runAction(() => createComicPanel(projectId, pageId))}
            disabled={pending}
            className={`mt-3 ${studioBtnPrimarySm}`}
          >
            Add panel
          </button>
        )}
      </div>
    </ProductionPlaceholderSection>
  );
}
