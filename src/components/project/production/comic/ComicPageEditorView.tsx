"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import type { ProjectCharacterEntry, ProjectSceneRollupEntry, ProjectStoryEntry } from "@/app/actions/projects";
import { ComicPageLayoutCanvas } from "@/components/project/production/canvas/ComicPageLayoutCanvas";
import { useLayoutCanvasZoom } from "@/components/project/production/canvas/useLayoutCanvasZoom";
import { ComicPageEditorToolbar } from "@/components/project/production/comic/ComicPageEditorToolbar";
import { useComicPageLayout } from "@/components/project/production/comic/use-comic-page-layout";
import type {
  ComicEditorSelection,
  StudioEditorMode,
} from "@/components/project/production/studio/production-studio-editor";
import { StudioAssetsDrawer } from "@/components/project/production/studio/StudioAssetsDrawer";
import { CharIDEditorShell } from "@/components/project/production/editor/CharIDEditorShell";
import { EditorIconRail } from "@/components/project/production/editor/EditorIconRail";
import { EditorPageStrip } from "@/components/project/production/editor/EditorPageStrip";
import { EditorZoomBar } from "@/components/project/production/editor/EditorZoomBar";
import { StudioInspector } from "@/components/project/production/studio/StudioInspector";
import { StudioLeftSidebar } from "@/components/project/production/studio/StudioLeftSidebar";
import type { ComicToolboxTool } from "@/components/project/production/comic/ComicFloatingToolbox";
import {
  toCanvasTool,
  type StudioToolboxTool,
} from "@/lib/studio/studio-toolbox";
import {
  DEFAULT_PAGE_VIEW_MODE,
  type PageViewMode,
} from "@/lib/canvas/page-view-mode";
import { getArtworkMetadata, getArtworkObject, getTextKind, getTextStyle } from "@/lib/canvas/panel-content";
import type { TextPayloadV1 } from "@/types/canvas/document-v1";
import type { PageLayoutTemplateId } from "@/lib/canvas/page-layout-templates";
import type { PanelBorderStyle } from "@/lib/canvas/page-layout-surface";
import type { PanelResizeMode } from "@/lib/canvas/panel-resize-mode";
import { DEFAULT_STUDIO_DOCUMENT_SETTINGS } from "@/lib/studio/document-settings";
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
  panelResizeMode: PanelResizeMode;
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
  panelResizeMode: initialResizeMode,
  editorMode = "embedded",
  reading,
  stories,
  sceneRollup,
  characters,
}: ComicPageEditorViewProps) {
  const router = useRouter();
  const [selectedPanelIds, setSelectedPanelIds] = useState<string[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [activeStudioTool, setActiveStudioTool] = useState<StudioToolboxTool>("layouts");
  const [pageViewMode, setPageViewMode] = useState<PageViewMode>(DEFAULT_PAGE_VIEW_MODE);
  const [assetsOpen, setAssetsOpen] = useState(false);

  const activeTool: ComicToolboxTool = toCanvasTool(activeStudioTool);

  const selection: ComicEditorSelection = useMemo(() => {
    if (selectedObjectId === "artwork" && selectedPanelIds[0]) {
      return { kind: "artwork", panelId: selectedPanelIds[0] };
    }
    if (selectedObjectId && selectedPanelIds[0]) {
      return { kind: "text", panelId: selectedPanelIds[0], objectId: selectedObjectId };
    }
    if (selectedPanelIds.length > 0) {
      return { kind: "panel", panelIds: selectedPanelIds };
    }
    return { kind: "none" };
  }, [selectedPanelIds, selectedObjectId]);

  function refreshPanels() {
    router.refresh();
  }

  const handleSelectPanels = useCallback((panelIds: string[]) => {
    setSelectedPanelIds(panelIds);
    if (panelIds.length === 0) setSelectedObjectId(null);
  }, []);

  function handleSelectPanel(panelId: string | null, additive?: boolean) {
    if (!panelId) {
      handleSelectPanels([]);
      setSelectedObjectId(null);
      return;
    }
    if (additive) {
      setSelectedPanelIds((current) =>
        current.includes(panelId)
          ? current.filter((id) => id !== panelId)
          : [...current, panelId]
      );
    } else {
      handleSelectPanels([panelId]);
    }
    setSelectedObjectId(null);
  }

  function handleSelectObject(panelId: string, objectId: string | null) {
    if (!objectId) {
      setSelectedObjectId(null);
      return;
    }
    handleSelectPanels([panelId]);
    setSelectedObjectId(objectId);
  }

  const layout = useComicPageLayout({
    projectId,
    pageId,
    panels,
    templateId,
    panelBorderStyle: initialBorderStyle,
    panelResizeMode: initialResizeMode,
    selectedPanelIds,
    selectedObjectId,
    onSelectPanels: handleSelectPanels,
    onSelectObject: setSelectedObjectId,
    onPanelsChange: refreshPanels,
  });

  const zoom = useLayoutCanvasZoom(`comic-editor-zoom:${pageId}`, 1, 1, {
    alwaysStartFitPage: true,
  });
  const [cropNotice, setCropNotice] = useState<string | null>(null);
  const [documentSettings, setDocumentSettings] = useState(
    () => DEFAULT_STUDIO_DOCUMENT_SETTINGS
  );
  const saveLabel = saveStateLabel(layout.saveState);

  const editorClassName = useMemo(() => {
    const classes = [
      "production-page-editor",
      "production-comic-studio",
      "charid-editor-root",
    ];
    if (editorMode === "full") {
      classes.push("production-comic-studio-full");
    } else {
      classes.push("production-comic-studio-embedded");
    }
    return classes.join(" ");
  }, [editorMode]);

  const selectedPanelId = selectedPanelIds[0] ?? null;
  const selectedPanelLayout = useMemo(
    () => (selectedPanelId ? layout.layoutPanels.find((p) => p.id === selectedPanelId) : null),
    [selectedPanelId, layout.layoutPanels]
  );

  const selectedPanelArtworkFit = useMemo(() => {
    if (!selectedPanelId) return "fill" as const;
    const content = layout.panelContents[selectedPanelId];
    const artwork = content ? getArtworkObject(content.document) : null;
    return artwork ? getArtworkMetadata(artwork).image_fit ?? "fill" : "fill";
  }, [selectedPanelId, layout.panelContents]);

  const timelineItems = useMemo(
    () =>
      reading.jumpOptions.map((option, index) => ({
        id: option.id,
        label: option.label,
        href: option.href,
        thumbnailLabel: String(index + 1),
      })),
    [reading.jumpOptions]
  );

  function handleStudioToolChange(tool: StudioToolboxTool) {
    setActiveStudioTool(tool);
  }

  function handleAddTextFromSidebar(kind: import("@/lib/canvas/panel-content").TextObjectKind) {
    const id = layout.addTextObject(kind);
    if (id) setSelectedObjectId(id);
  }

  const spreadNextLabel =
    pageViewMode === "spread" && reading.currentIndex < reading.total - 1
      ? reading.jumpOptions[reading.currentIndex + 1]?.label ?? `Page ${reading.currentIndex + 2}`
      : reading.currentIndex >= reading.total - 1
        ? "End of book"
        : null;

  const selectedTextObject = useMemo(() => {
    if (selection.kind !== "text" || !selectedPanelId) return null;
    const doc = layout.panelContent.getPanelDocument(selectedPanelId);
    return layout.panelContent.getPanelTextObjects(selectedPanelId).find((o) => o.id === selection.objectId) ?? null;
  }, [selection, selectedPanelId, layout.panelContent]);

  const selectedTextPayload = selectedTextObject?.payload as TextPayloadV1 | undefined;
  const selectedTextStyle = selectedTextObject ? getTextStyle(selectedTextObject) : null;

  return (
    <div ref={layout.editorRef} className={editorClassName}>
      <CharIDEditorShell
        layoutPending={layout.layoutPending}
        topbar={
          <ComicPageEditorToolbar
            projectId={projectId}
            projectTitle={projectTitle}
            pageId={pageId}
            pageName={pageName}
            issueName={issueName}
            statusLabel={statusLabel}
            saveLabel={saveLabel}
            editorMode={editorMode}
            zoom={zoom}
            canUndo={layout.history.canUndo}
            canRedo={layout.history.canRedo}
            onUndo={layout.handleUndo}
            onRedo={layout.handleRedo}
            pageViewMode={pageViewMode}
            onPageViewModeChange={setPageViewMode}
            documentSettings={documentSettings}
            onDocumentSettingsChange={setDocumentSettings}
            selection={selection}
            panelBorderStyle={layout.panelBorderStyle}
            onBorderStyleChange={layout.handleBorderStyleChange}
            artworkFitMode={selectedPanelArtworkFit}
            onArtworkFitChange={(mode) => {
              if (selectedPanelId) layout.panelContent.applyArtworkFit(selectedPanelId, mode);
            }}
            onArtworkCenter={() => {
              if (selectedPanelId) layout.panelContent.centerArtwork(selectedPanelId);
            }}
            onDuplicatePanel={layout.handleDuplicatePanel}
            onDeletePanel={layout.handleDeletePanel}
            onDeleteSelection={layout.handleDeleteSelection}
            layoutPending={layout.layoutPending}
            textFontPreset={
              (selectedTextPayload?.font_preset ?? selectedTextStyle?.font_preset ?? "dialogue") as import("@/lib/canvas/comic-font-presets").ComicFontPreset
            }
            textFontSize={selectedTextPayload?.font_size ?? 16}
            textBold={selectedTextPayload?.bold ?? selectedTextStyle?.bold}
            textItalic={selectedTextPayload?.italic ?? selectedTextStyle?.italic}
            textUnderline={selectedTextPayload?.underline ?? selectedTextStyle?.underline}
            textAlign={selectedTextPayload?.align ?? "center"}
            textColor={selectedTextPayload?.fill_color ?? selectedTextStyle?.fill_color}
            bubbleFill={selectedTextStyle?.background_fill}
            bubbleOutline={selectedTextStyle?.outline_color}
            onTextFontPresetChange={(preset) => {
              if (selectedPanelId && selection.kind === "text") {
                layout.panelContent.updateText(selectedPanelId, selection.objectId, {
                  font_preset: preset,
                });
              }
            }}
            onTextFontSizeChange={(size) => {
              if (selectedPanelId && selection.kind === "text") {
                layout.panelContent.updateText(selectedPanelId, selection.objectId, { font_size: size });
              }
            }}
            onTextStyleToggle={(key) => {
              if (selectedPanelId && selection.kind === "text" && selectedTextPayload) {
                layout.panelContent.updateText(selectedPanelId, selection.objectId, {
                  [key]: !(selectedTextPayload[key] ?? selectedTextStyle?.[key]),
                });
              }
            }}
            onTextAlignChange={(align) => {
              if (selectedPanelId && selection.kind === "text") {
                layout.panelContent.updateText(selectedPanelId, selection.objectId, { align });
              }
            }}
            onTextColorChange={(color) => {
              if (selectedPanelId && selection.kind === "text") {
                layout.panelContent.updateText(selectedPanelId, selection.objectId, { fill_color: color });
              }
            }}
            onBubbleFillChange={(color) => {
              if (selectedPanelId && selection.kind === "text") {
                layout.panelContent.updateTextObjectStyle(selectedPanelId, selection.objectId, {
                  background_fill: color,
                });
              }
            }}
            onBubbleOutlineChange={(color) => {
              if (selectedPanelId && selection.kind === "text") {
                layout.panelContent.updateTextObjectStyle(selectedPanelId, selection.objectId, {
                  outline_color: color,
                });
              }
            }}
            onArtworkTransform={(patch) => {
              if (selectedPanelId) layout.panelContent.applyArtworkTransform(selectedPanelId, patch);
            }}
            artworkOpacity={
              selectedPanelId && selection.kind === "artwork"
                ? (() => {
                    const doc = layout.panelContent.getPanelDocument(selectedPanelId);
                    const obj = getArtworkObject(doc);
                    return obj ? getArtworkMetadata(obj).opacity ?? 1 : 1;
                  })()
                : 1
            }
            artworkRotation={
              selectedPanelId && selection.kind === "artwork"
                ? (() => {
                    const doc = layout.panelContent.getPanelDocument(selectedPanelId);
                    const obj = getArtworkObject(doc);
                    return obj ? getArtworkMetadata(obj).rotation ?? 0 : 0;
                  })()
                : 0
            }
          />
        }
        notices={
          <>
            {cropNotice && (
              <p className="production-page-editor-error charid-studio-crop-notice" role="status">
                {cropNotice}
              </p>
            )}
            {layout.error && <p className="production-page-editor-error">{layout.error}</p>}
          </>
        }
        iconRail={
          <EditorIconRail
            activeTool={activeStudioTool}
            onToolChange={handleStudioToolChange}
            disabled={layout.layoutPending}
          />
        }
        sidebar={
          <StudioLeftSidebar
            activeTool={activeStudioTool}
              activeTemplateId={layout.activeTemplateId}
              pageHasContent={layout.pageHasContent}
              layoutPending={layout.layoutPending}
              selectedPanelId={selectedPanelId}
              projectId={projectId}
              pageId={pageId}
              panels={panels}
              panelContent={layout.panelContent}
              artworkFitMode={selectedPanelArtworkFit}
              hasArtwork={selectedPanelId ? layout.panelContent.hasArtwork(selectedPanelId) : false}
              panelWidth={selectedPanelLayout?.width}
              panelHeight={selectedPanelLayout?.height}
              selectedObjectId={selectedObjectId}
              onApplyTemplate={layout.applyTemplate}
              onAddText={handleAddTextFromSidebar}
              onAddPanel={layout.handleAddPanel}
              onSelectPanel={(id) => handleSelectPanel(id)}
              onSelectObject={(objectId) => {
                if (selectedPanelId) handleSelectObject(selectedPanelId, objectId);
                else if (panels[0]) handleSelectObject(panels[0].id, objectId);
              }}
              onArtworkUploaded={(result) => {
                if (selectedPanelId) {
                  layout.panelContent.syncArtworkEntry(selectedPanelId, result, { skipPersist: true });
                }
              }}
              onArtworkRemoved={(document) => {
                if (selectedPanelId) layout.panelContent.clearArtwork(selectedPanelId, document);
              }}
              onArtworkFitChange={(mode) => {
                if (selectedPanelId) layout.panelContent.applyArtworkFit(selectedPanelId, mode);
              }}
              onArtworkCenter={() => {
                if (selectedPanelId) layout.panelContent.centerArtwork(selectedPanelId);
              }}
              onArtworkTransform={(patch) => {
                if (selectedPanelId) layout.panelContent.applyArtworkTransform(selectedPanelId, patch);
              }}
            onReorderText={(objectId, direction) => {
              if (selectedPanelId) layout.panelContent.reorderText(selectedPanelId, objectId, direction);
            }}
          />
        }
        canvas={
          <main className="canvas-area">
            <div className="canvas-dots" aria-hidden />
            <div className="production-editor-canvas-column relative z-[2] flex min-h-0 flex-1 flex-col">
              <ComicPageLayoutCanvas
              pageViewMode={pageViewMode}
              activeTool={activeTool}
              pageId={pageId}
              studioMode
              fillViewport
              showZoomBar={false}
              zoom={zoom}
              spreadNextPageLabel={spreadNextLabel}
              canvasItems={layout.canvasItems}
              panelBorderStyle={layout.panelBorderStyle}
              panelResizeMode={layout.panelResizeMode}
              selectedPanelIds={selectedPanelIds}
              selectedObjectId={selectedObjectId}
              panelContents={layout.panelContents}
              onSelectPanel={handleSelectPanel}
              onSelectObject={handleSelectObject}
              onPanelFrameChange={layout.updatePanelFrame}
              onPanelFrameCommit={layout.clearSnapGuides}
              snapGuides={layout.snapGuides}
              onArtworkCropPlaceholder={() =>
                setCropNotice("Crop mode — coming in a future milestone.")
              }
              onArtworkTransform={(panelId, patch) =>
                layout.panelContent.applyArtworkTransform(panelId, patch)
              }
              onTextObjectChange={(panelId, objectId, patch) =>
                layout.panelContent.updateText(panelId, objectId, patch)
              }
              onTextStyleChange={(panelId, objectId, patch) =>
                layout.panelContent.updateTextObjectStyle(panelId, objectId, patch)
              }
              onAddPanel={layout.handleAddPanel}
              isEmpty={layout.layoutPanels.length === 0}
            />
            </div>
            <EditorPageStrip items={timelineItems} activeId={pageId} />
            <EditorZoomBar zoom={zoom} scale={zoom.effectiveScale} />
          </main>
        }
        inspector={
          <StudioInspector
            projectTitle={projectTitle}
            pageName={pageName}
            issueName={issueName}
            panels={panels}
            selection={selection}
            panelContent={layout.panelContent}
            panelBorderStyle={layout.panelBorderStyle}
            layoutPending={layout.layoutPending}
            panelFrame={
              selectedPanelLayout
                ? {
                    x: selectedPanelLayout.x,
                    y: selectedPanelLayout.y,
                    width: selectedPanelLayout.width,
                    height: selectedPanelLayout.height,
                  }
                : undefined
            }
            stories={stories}
            sceneRollup={sceneRollup}
            characters={characters}
            onBorderStyleChange={layout.handleBorderStyleChange}
            onDeleteSelection={layout.handleDeleteSelection}
            onDeletePanel={layout.handleDeletePanel}
            onReorderText={(objectId, direction) => {
              if (selectedPanelId) layout.panelContent.reorderText(selectedPanelId, objectId, direction);
            }}
            onArtworkTransform={(patch) => {
              if (selectedPanelId) layout.panelContent.applyArtworkTransform(selectedPanelId, patch);
            }}
          />
        }
      />

      <StudioAssetsDrawer
        open={assetsOpen}
        onToggle={() => setAssetsOpen((open) => !open)}
        stories={stories}
        sceneRollup={sceneRollup}
        characters={characters}
      />
    </div>
  );
}
