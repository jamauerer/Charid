"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { reorderComicPanels } from "@/app/actions/production/comic";
import { ConfirmDialog } from "@/components/studio/ConfirmDialog";
import { BubblePreview } from "@/components/project/production/studio/BubblePreview";
import { PanelLayoutPreview } from "@/components/project/production/studio/PanelLayoutPreview";
import type { ComicPanelContentApi } from "@/components/project/production/comic/use-comic-panel-content";
import {
  ComicStudioArtworkSlot,
  type ArtworkUploadResult,
} from "@/components/project/production/comic/ComicStudioArtworkSlot";
import {
  bubblesForTool,
  type BubbleLibraryCategory,
} from "@/lib/studio/bubble-library";
import type { TextObjectKind } from "@/lib/canvas/panel-content";
import { getTextKind } from "@/lib/canvas/panel-content";
import type { ImageFitMode } from "@/lib/canvas/panel-content";
import {
  panelLayoutLibraryGroups,
  type PageLayoutTemplateId,
} from "@/lib/canvas/page-layout-templates";
import type { StudioToolboxTool } from "@/lib/studio/studio-toolbox";
import type { CanvasDocumentV1, TextPayloadV1 } from "@/types/canvas/document-v1";
import type { ComicPanel } from "@/types/production/comic";
import { Eye, Lock } from "lucide-react";

type StudioLeftSidebarProps = {
  activeTool: StudioToolboxTool;
  activeTemplateId: PageLayoutTemplateId | null;
  pageHasContent: boolean;
  layoutPending: boolean;
  selectedPanelId: string | null;
  projectId: string;
  pageId: string;
  panels: ComicPanel[];
  panelContent: ComicPanelContentApi;
  artworkFitMode: ImageFitMode;
  hasArtwork: boolean;
  panelWidth?: number;
  panelHeight?: number;
  selectedObjectId?: string | null;
  onApplyTemplate: (templateId: PageLayoutTemplateId) => void;
  onAddText: (kind: TextObjectKind) => void;
  onAddPanel: () => void;
  onSelectPanel: (panelId: string) => void;
  onSelectObject: (objectId: string) => void;
  onArtworkUploaded: (result: ArtworkUploadResult) => void;
  onArtworkRemoved: (document: CanvasDocumentV1) => void;
  onArtworkFitChange: (mode: ImageFitMode) => void;
  onArtworkCenter?: () => void;
  onArtworkTransform?: (patch: { scale?: number; opacity?: number }) => void;
  onReorderText?: (
    objectId: string,
    direction: "front" | "back" | "forward" | "backward"
  ) => void;
};

export function StudioLeftSidebar(props: StudioLeftSidebarProps) {
  const {
    activeTool,
    activeTemplateId,
    pageHasContent,
    layoutPending,
    selectedPanelId,
    projectId,
    pageId,
    panels,
    panelContent,
    artworkFitMode,
    hasArtwork,
    panelWidth,
    panelHeight,
    selectedObjectId,
    onApplyTemplate,
    onAddText,
    onAddPanel,
    onSelectPanel,
    onSelectObject,
    onArtworkUploaded,
    onArtworkRemoved,
    onArtworkFitChange,
    onArtworkCenter,
    onArtworkTransform,
    onReorderText,
  } = props;

  const [pendingTemplate, setPendingTemplate] = useState<PageLayoutTemplateId | null>(null);

  function requestTemplate(templateId: PageLayoutTemplateId) {
    if (pageHasContent) setPendingTemplate(templateId);
    else onApplyTemplate(templateId);
  }

  function addBubble(cat: BubbleLibraryCategory) {
    if (!cat.available) return;
    onAddText(cat.textKind);
  }

  function layoutGridCells<T>(items: T[]): (T | null)[] {
    const cells: (T | null)[] = [...items];
    if (cells.length % 2 === 1) cells.push(null);
    return cells;
  }

  return (
    <>
      <SidebarToolPanel active={activeTool === "layouts"} panelId="panels" title="Panels">
          {panelLayoutLibraryGroups().map((group) => (
            <div key={group.panelCount} className="sb-section">
              <div className="sb-section-label">{group.label}</div>
              <div className="layout-grid">
                {layoutGridCells(group.templates).map((template, index) =>
                  template ? (
                  <button
                    key={template.id}
                    type="button"
                    disabled={layoutPending}
                    onClick={() => requestTemplate(template.id)}
                    className="layout-item"
                    title={template.label}
                  >
                    <div className={`layout-thumb${activeTemplateId === template.id ? " active" : ""}`}>
                      <PanelLayoutPreview
                        panels={template.panels}
                        active={activeTemplateId === template.id}
                        variant="editor"
                      />
                    </div>
                    <div className="layout-name">{template.label}</div>
                  </button>
                  ) : (
                    <div key={`empty-${group.panelCount}-${index}`} className="layout-item layout-item-empty" aria-hidden />
                  )
                )}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={onAddPanel}
            disabled={layoutPending}
            className="draw-bubble-btn mb-3 w-full"
          >
            Add panel
          </button>
          <div className="info-chip">
            <div className="info-chip-label">Page size</div>
            <div className="info-chip-text">
              North American comic standard
              <br />
              6.625 × 10.25 in · 600 DPI
              <br />
              Canvas: 3975 × 6150 px
            </div>
          </div>
      </SidebarToolPanel>

      <SidebarToolPanel active={activeTool === "speech"} panelId="speech" title="Speech bubbles">
          <AiSuggestBanner variant="speech" />
          <div className="sb-section">
            <div className="sb-section-label">Standard shapes</div>
            <div className="bubble-asset-grid">
            {bubblesForTool("speech").map((cat) => (
              <button
                key={cat.id}
                type="button"
                disabled={!cat.available || layoutPending}
                onClick={() => addBubble(cat)}
                className="bubble-asset"
                title={cat.label}
              >
                <BubblePreview categoryId={cat.id} />
                <div className="bubble-asset-label">{cat.label}</div>
              </button>
            ))}
            </div>
          </div>
      </SidebarToolPanel>

      <SidebarToolPanel active={activeTool === "thought"} panelId="thought" title="Thought bubbles">
          <AiSuggestBanner variant="thought" />
          <div className="sb-section">
            <div className="sb-section-label">Standard shapes</div>
            <div className="bubble-asset-grid">
            {bubblesForTool("thought").map((cat) => (
              <button
                key={cat.id}
                type="button"
                disabled={!cat.available || layoutPending}
                onClick={() => addBubble(cat)}
                className="bubble-asset"
                title={cat.label}
              >
                <BubblePreview categoryId={cat.id} />
                <div className="bubble-asset-label">{cat.label}</div>
              </button>
            ))}
            </div>
          </div>
      </SidebarToolPanel>

      <SidebarToolPanel active={activeTool === "sfx"} panelId="sfx" title="Sound effects">
          <div className="sb-section">
            <div className="sb-section-label">Presets</div>
            <div className="sfx-grid">
            {["BAM", "POW", "ZAP", "BOOM", "CRASH", "SPLASH", "WHOOSH", "CLICK"].map((word) => (
              <button
                key={word}
                type="button"
                disabled={layoutPending}
                onClick={() => onAddText("sfx")}
                className="sfx-item"
                title={`Add ${word}`}
              >
                <span className="sfx-preview">{word}</span>
              </button>
            ))}
            </div>
          </div>
      </SidebarToolPanel>

      <SidebarToolPanel active={activeTool === "caption"} panelId="caption" title="Captions & narration">
          <AiSuggestBanner variant="caption" />
          <div className="sb-section">
            <div className="sb-section-label">Standard shapes</div>
            <div className="bubble-asset-grid">
            {bubblesForTool("caption").map((cat) => (
              <button
                key={cat.id}
                type="button"
                disabled={!cat.available || layoutPending}
                onClick={() => addBubble(cat)}
                className="bubble-asset"
                title={cat.label}
              >
                <BubblePreview categoryId={cat.id} />
                <div className="bubble-asset-label">{cat.label}</div>
              </button>
            ))}
            </div>
          </div>
      </SidebarToolPanel>

      <SidebarToolPanel active={activeTool === "text"} panelId="text" title="Text">
          <div className="sb-section">
            <div className="sb-section-label">Add text</div>
            {[
              { id: "dialogue", label: "Dialogue", kind: "speech" as const },
              { id: "caption", label: "Caption", kind: "caption" as const },
              { id: "narration", label: "Narration", kind: "narration" as const },
              { id: "sfx", label: "SFX", kind: "sfx" as const },
            ].map((preset) => (
              <button
                key={preset.id}
                type="button"
                disabled={layoutPending}
                onClick={() => onAddText(preset.kind)}
                className="draw-bubble-btn mb-1 w-full"
              >
                {preset.label}
              </button>
            ))}
          </div>
          <p className="draw-bubble-hint">
            Font, size, weight, alignment, and color are in the top toolbar when text is selected.
          </p>
      </SidebarToolPanel>

      <SidebarToolPanel active={activeTool === "draw"} panelId="draw" title="Draw">
          <div className="draw-tools">
            <label className="sb-section-label">Brush</label>
            <select disabled className="draw-mode-btn w-full">
              <option>Brush</option>
            </select>
            <label className="sb-section-label mt-2">Stroke width</label>
            <input type="range" disabled min={1} max={24} defaultValue={4} className="w-full" />
          </div>
      </SidebarToolPanel>

      <SidebarToolPanel active={activeTool === "upload"} panelId="upload" title="Upload">
          {selectedPanelId ? (
            <>
              <ComicStudioArtworkSlot
                label="Upload Image"
                compact
                panelId={selectedPanelId}
                projectId={projectId}
                panelWidth={panelWidth}
                panelHeight={panelHeight}
                hasArtwork={hasArtwork}
                fitMode={artworkFitMode}
                disabled={layoutPending}
                onUploaded={onArtworkUploaded}
                onRemoved={onArtworkRemoved}
                onFitModeChange={onArtworkFitChange}
                onCenter={onArtworkCenter}
              />
              <div className="sb-section">
                <div className="sb-section-label">Project images</div>
                <p className="draw-bubble-hint">Connects to your project library — coming soon.</p>
              </div>
            </>
          ) : (
            <p className="draw-bubble-hint">Select a panel on the canvas to add an image.</p>
          )}
      </SidebarToolPanel>

      <SidebarToolPanel active={activeTool === "ai"} panelId="ai" title="AI Generate">
          <div className="ai-tools">
            {[
              "Generate scene background",
              "Generate character",
              "Fill panel with scene",
              "Suggest panel layout",
              "Generate cover",
            ].map((label) => (
              <button key={label} type="button" disabled className="ai-btn">
                {label}
                <span className="ai-chip">AI</span>
              </button>
            ))}
          </div>
      </SidebarToolPanel>

      <SidebarToolPanel active={activeTool === "shapes"} panelId="shapes" title="Shapes">
          <div className="shapes-grid">
            {["Rectangle", "Circle", "Ellipse", "Triangle", "Line", "Star", "Arrow", "Pill"].map((shape) => (
              <button key={shape} type="button" disabled className="shape-item" title={`${shape} — coming soon`}>
                <svg viewBox="0 0 20 20">
                  <rect x="2" y="2" width="16" height="16" fill="none" stroke="currentColor" />
                </svg>
              </button>
            ))}
          </div>
      </SidebarToolPanel>

      <SidebarToolPanel active={activeTool === "layers"} panelId="layers" title="Layers">
          <LayersSidebarContent
            projectId={projectId}
            pageId={pageId}
            panels={panels}
            panelId={selectedPanelId}
            panelContent={panelContent}
            selectedObjectId={selectedObjectId ?? null}
            onSelectPanel={onSelectPanel}
            onSelectObject={onSelectObject}
            onReorderText={onReorderText}
          />
      </SidebarToolPanel>

      <ConfirmDialog
        open={pendingTemplate !== null}
        title="Change panel layout?"
        description="Applying a new layout will remove existing panel content on this page."
        confirmLabel="Apply layout"
        cancelLabel="Cancel"
        variant="default"
        pending={layoutPending}
        onCancel={() => setPendingTemplate(null)}
        onConfirm={() => {
          if (pendingTemplate) {
            onApplyTemplate(pendingTemplate);
            setPendingTemplate(null);
          }
        }}
      />
    </>
  );
}

function SidebarToolPanel({
  active,
  panelId,
  title,
  children,
}: {
  active: boolean;
  panelId: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`sb-panel${active ? " active" : ""}`} id={`panel-${panelId}`}>
      <div className="sb-header">{title}</div>
      <div className="sb-body">{children}</div>
    </div>
  );
}

function AiSuggestBanner({ variant }: { variant: "speech" | "thought" | "caption" }) {
  const copy =
    variant === "speech"
      ? { text: 'Jane: "The city never sleeps."\nSuggested placement: top-left of Panel 1' }
      : variant === "thought"
        ? { text: "Internal monologue suggestion — coming from scene script." }
        : { text: "Narration line suggestion — scene-setting text from script." };

  return (
    <div className="ai-suggest-box">
      <div className="ai-suggest-label">✦ AI suggestion</div>
      <div className="ai-suggest-text" style={{ whiteSpace: "pre-line" }}>
        {copy.text}
      </div>
      <div className="ai-suggest-actions">
        <button type="button" disabled className="ai-suggest-btn primary">
          Place bubble
        </button>
        <button type="button" disabled className="ai-suggest-btn">
          Skip
        </button>
      </div>
    </div>
  );
}

function SidebarSectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="sb-section-label mt-3 first:mt-0">{children}</div>;
}

function LayersSidebarContent({
  projectId,
  pageId,
  panels,
  panelId,
  panelContent,
  selectedObjectId,
  onSelectPanel,
  onSelectObject,
  onReorderText,
}: {
  projectId: string;
  pageId: string;
  panels: ComicPanel[];
  panelId: string | null;
  panelContent: ComicPanelContentApi;
  selectedObjectId: string | null;
  onSelectPanel: (panelId: string) => void;
  onSelectObject: (objectId: string) => void;
  onReorderText?: (
    objectId: string,
    direction: "front" | "back" | "forward" | "backward"
  ) => void;
}) {
  const router = useRouter();
  const textObjects = panelId ? panelContent.getPanelTextObjects(panelId) : [];

  function reorderPanel(panelIdToMove: string, direction: "forward" | "backward") {
    const ids = panels.map((p) => p.id);
    const index = ids.indexOf(panelIdToMove);
    if (index < 0) return;
    const next = [...ids];
    if (direction === "forward" && index < next.length - 1) {
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
    } else if (direction === "backward" && index > 0) {
      [next[index], next[index - 1]] = [next[index - 1], next[index]];
    } else return;
    void reorderComicPanels(projectId, pageId, next).then((result) => {
      if (!result.error) router.refresh();
    });
  }

  return (
    <ul className="charid-studio-layers-list">
      <li className="charid-studio-layer-row charid-studio-layer-row-muted">
        <span>Background</span>
        <span className="charid-studio-layer-actions">
          <button type="button" disabled title="Visibility"><Eye size={14} /></button>
          <button type="button" disabled title="Lock"><Lock size={14} /></button>
        </span>
      </li>
      {panels.map((panel, index) => (
        <li key={panel.id}>
          <div
            className={`charid-studio-layer-row ${panelId === panel.id ? "charid-studio-layer-row-active" : ""}`}
          >
            <button type="button" className="charid-studio-layer-name" onClick={() => onSelectPanel(panel.id)}>
              Panel {index + 1}
            </button>
            <span className="charid-studio-layer-actions">
              <button type="button" title="Bring forward" onClick={() => reorderPanel(panel.id, "forward")}>↑</button>
              <button type="button" title="Send backward" onClick={() => reorderPanel(panel.id, "backward")}>↓</button>
              <button type="button" disabled title="Visibility"><Eye size={14} /></button>
              <button type="button" disabled title="Lock"><Lock size={14} /></button>
            </span>
          </div>
          {panelId === panel.id && (
            <ul className="charid-studio-layer-children">
              {panelContent.hasArtwork(panel.id) && (
                <li>
                  <button
                    type="button"
                    className={`charid-studio-layer-row ${selectedObjectId === "artwork" ? "charid-studio-layer-row-active" : ""}`}
                    onClick={() => onSelectObject("artwork")}
                  >
                    Image
                  </button>
                </li>
              )}
              {textObjects.map((obj) => {
                const kind = getTextKind(obj);
                const label = (obj.payload as TextPayloadV1).content.slice(0, 20) || kind;
                return (
                  <li key={obj.id}>
                    <div className={`charid-studio-layer-row ${selectedObjectId === obj.id ? "charid-studio-layer-row-active" : ""}`}>
                      <button type="button" className="charid-studio-layer-name" onClick={() => onSelectObject(obj.id)}>
                        {label}
                      </button>
                      <span className="charid-studio-layer-actions">
                        <button type="button" title="Forward" onClick={() => onReorderText?.(obj.id, "forward")}>↑</button>
                        <button type="button" title="Backward" onClick={() => onReorderText?.(obj.id, "backward")}>↓</button>
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}
