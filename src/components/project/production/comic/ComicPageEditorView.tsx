"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type {
  ProjectCharacterEntry,
  ProjectSceneRollupEntry,
  ProjectStoryEntry,
} from "@/app/actions/projects";
import { ComicPageLayoutCanvas } from "@/components/project/production/canvas/ComicPageLayoutCanvas";
import { useLayoutCanvasZoom } from "@/components/project/production/canvas/useLayoutCanvasZoom";
import { ComicPageEditorLeftSidebar } from "@/components/project/production/comic/ComicPageEditorLeftSidebar";
import { ComicPageEditorRightSidebar } from "@/components/project/production/comic/ComicPageEditorRightSidebar";
import { ComicPageEditorToolbar } from "@/components/project/production/comic/ComicPageEditorToolbar";
import { useComicPageLayout } from "@/components/project/production/comic/use-comic-page-layout";
import { ProductionStoryReferencePanel } from "@/components/project/production/ProductionStoryReferencePanel";
import type {
  ComicEditorSelection,
  StudioEditorMode,
} from "@/components/project/production/studio/production-studio-editor";
import type { PageLayoutTemplateId } from "@/lib/canvas/page-layout-templates";
import type { PanelBorderStyle } from "@/lib/canvas/page-layout-surface";
import type { ComicPanel } from "@/types/production/comic";

type ComicPageEditorViewProps = {
  projectId: string;
  projectTitle: string;
  pageId: string;
  pageName: string;
  issueName: string;
  statusLabel: string;
  panels: ComicPanel[];
  templateId: PageLayoutTemplateId | null;
  panelBorderStyle: PanelBorderStyle;
  editorMode?: StudioEditorMode;
  reading: {
    currentIndex: number;
    total: number;
    prevHref: string | null;
    nextHref: string | null;
    jumpOptions: { id: string; label: string; href: string }[];
  };
  stories: ProjectStoryEntry[];
  sceneRollup: ProjectSceneRollupEntry[];
  characters: ProjectCharacterEntry[];
};

function saveStateLabel(state: string): string {
  switch (state) {
    case "saving":
      return "Saving…";
    case "saved":
      return "Saved";
    case "error":
      return "Save failed";
    default:
      return "";
  }
}

export function ComicPageEditorView({
  projectId,
  projectTitle,
  pageId,
  pageName,
  issueName,
  statusLabel,
  panels,
  templateId,
  panelBorderStyle: initialBorderStyle,
  editorMode = "embedded",
  reading,
  stories,
  sceneRollup,
  characters,
}: ComicPageEditorViewProps) {
  const router = useRouter();
  const [selection, setSelection] = useState<ComicEditorSelection>({ kind: "none" });

  const selectedPanelId = selection.kind === "panel" ? selection.panelId : null;

  function refreshPanels() {
    router.refresh();
  }

  function handleSelectPanel(panelId: string | null) {
    setSelection(panelId ? { kind: "panel", panelId } : { kind: "none" });
  }

  const layout = useComicPageLayout({
    projectId,
    pageId,
    panels,
    templateId,
    panelBorderStyle: initialBorderStyle,
    selectedPanelId,
    onSelectPanel: handleSelectPanel,
    onPanelsChange: refreshPanels,
  });

  const zoom = useLayoutCanvasZoom(`comic-editor-zoom:${pageId}`, 1, 1);

  const saveLabel = saveStateLabel(layout.saveState);

  const editorClassName = useMemo(() => {
    const classes = ["production-page-editor", "production-comic-studio"];
    if (editorMode === "full") {
      classes.push("production-comic-studio-full");
    } else {
      classes.push("production-comic-studio-embedded");
    }
    return classes.join(" ");
  }, [editorMode]);

  return (
    <div ref={layout.editorRef} className={editorClassName}>
      <ComicPageEditorToolbar
        projectId={projectId}
        projectTitle={projectTitle}
        pageId={pageId}
        pageName={pageName}
        issueName={issueName}
        saveLabel={saveLabel}
        editorMode={editorMode}
        zoom={zoom}
        reading={reading}
      />

      {layout.error && (
        <p className="production-page-editor-error">{layout.error}</p>
      )}

      <div className={`production-page-editor-body ${layout.pending ? "opacity-90" : ""}`}>
        <ComicPageEditorLeftSidebar
          activeTemplateId={layout.activeTemplateId}
          panelBorderStyle={layout.panelBorderStyle}
          pending={layout.pending}
          onApplyTemplate={layout.applyTemplate}
          onBorderStyleChange={layout.handleBorderStyleChange}
          onAddPanel={layout.handleAddPanel}
        />

        <main className="production-editor-canvas-column">
          <ComicPageLayoutCanvas
            pageId={pageId}
            studioMode
            fillViewport
            showZoomBar={false}
            zoom={zoom}
            canvasItems={layout.canvasItems}
            panelBorderStyle={layout.panelBorderStyle}
            selectedPanelId={selectedPanelId}
            onSelectPanel={handleSelectPanel}
            onPanelFrameChange={layout.updatePanelFrame}
            onAddPanel={layout.handleAddPanel}
            isEmpty={layout.layoutPanels.length === 0}
          />
        </main>

        <ComicPageEditorRightSidebar
          projectId={projectId}
          pageId={pageId}
          panels={panels}
          selection={selection}
          panelBorderStyle={layout.panelBorderStyle}
          pending={layout.pending}
          onSelectPanel={handleSelectPanel}
          onAddPanel={layout.handleAddPanel}
          onDeletePanel={layout.handleDeletePanel}
          onBorderStyleChange={layout.handleBorderStyleChange}
        />
      </div>

      <ProductionStoryReferencePanel
        stories={stories}
        sceneRollup={sceneRollup}
        characters={characters}
      />
    </div>
  );
}
