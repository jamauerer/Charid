"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ComicPagePanelsSection } from "@/components/project/production/comic/ComicPagePanelsSection";
import { ProductionPlaceholderSection } from "@/components/project/production/ProductionPlaceholderSection";
import type { PanelBorderStyle } from "@/lib/canvas/page-layout-surface";
import type { PageLayoutTemplateId } from "@/lib/canvas/page-layout-templates";
import type { ComicPanel } from "@/types/production/comic";

const ComicPageLayoutEditor = dynamic(
  () =>
    import("@/components/project/production/canvas/ComicPageLayoutEditor").then(
      (module) => module.ComicPageLayoutEditor
    ),
  {
    ssr: false,
    loading: () => (
      <p className="text-sm text-[var(--brand-text-muted)]">Loading page editor…</p>
    ),
  }
);

type ComicPageLayoutWorkspaceProps = {
  projectId: string;
  pageId: string;
  panels: ComicPanel[];
  templateId: PageLayoutTemplateId | null;
  panelBorderStyle: PanelBorderStyle;
};

export function ComicPageLayoutWorkspace({
  projectId,
  pageId,
  panels,
  templateId,
  panelBorderStyle,
}: ComicPageLayoutWorkspaceProps) {
  const router = useRouter();
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);

  function refreshPanels() {
    router.refresh();
  }

  return (
    <>
      <ProductionPlaceholderSection
        title="Page layout"
        description="Design your page by choosing a template and arranging panels."
      >
        <ComicPageLayoutEditor
          projectId={projectId}
          pageId={pageId}
          panels={panels}
          templateId={templateId}
          panelBorderStyle={panelBorderStyle}
          selectedPanelId={selectedPanelId}
          onSelectPanel={setSelectedPanelId}
          onPanelsChange={refreshPanels}
        />
      </ProductionPlaceholderSection>

      <ComicPagePanelsSection
        projectId={projectId}
        pageId={pageId}
        panels={panels}
        selectedPanelId={selectedPanelId}
        onSelectPanel={setSelectedPanelId}
      />
    </>
  );
}
