"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { reorderComicPanels } from "@/app/actions/production/comic";
import { ComicPagePanelsSidebar } from "@/components/project/production/comic/ComicPagePanelsSidebar";
import { ComicStudioArtworkSlot, type ArtworkUploadResult } from "@/components/project/production/comic/ComicStudioArtworkSlot";
import type { ComicPanelContentApi } from "@/components/project/production/comic/use-comic-panel-content";
import {
  COMIC_CONTEXT_TOOLS,
  contextToolForSelection,
  type ComicEditorContextTool,
  type ComicEditorSelection,
} from "@/components/project/production/studio/production-studio-editor";
import { StudioColorPicker } from "@/components/studio/StudioColorPicker";
import type { ImageFitMode, TextObjectKind } from "@/lib/canvas/panel-content";
import type { ComicTextStyle } from "@/lib/canvas/comic-text-style";
import { COMIC_FONT_PRESET_DEFS, type ComicFontPreset } from "@/lib/canvas/comic-font-presets";
import { getTextKind, getTextStyle } from "@/lib/canvas/panel-content";
import type { PanelBorderStyle } from "@/lib/canvas/page-layout-surface";
import { PANEL_BORDER_OPTIONS } from "@/lib/canvas/panel-border-style";
import type { CanvasDocumentV1, TextPayloadV1 } from "@/types/canvas/document-v1";
import type { ComicPanel } from "@/types/production/comic";

type ComicPageEditorRightSidebarProps = {
  projectId: string;
  pageId: string;
  panels: ComicPanel[];
  selection: ComicEditorSelection;
  panelBorderStyle: PanelBorderStyle;
  layoutPending: boolean;
  panelContent: ComicPanelContentApi;
  artworkFitMode: ImageFitMode;
  onSelectPanel: (panelId: string | null) => void;
  onAddPanel: () => void;
  onDeletePanel: () => void;
  onDeleteSelection: () => void;
  onBorderStyleChange: (style: PanelBorderStyle) => void;
  onDuplicatePanel: () => void;
  onAlign: (alignment: "left" | "center" | "right" | "top" | "middle" | "bottom") => void;
  onDistribute: (axis: "horizontal" | "vertical") => void;
  onAddTextObject: (kind: TextObjectKind) => string | null;
  onSelectObject: (objectId: string) => void;
  onArtworkUploaded: (result: ArtworkUploadResult) => void;
  onArtworkRemoved: (document: CanvasDocumentV1) => void;
  onArtworkFitChange: (mode: ImageFitMode) => void;
  onArtworkCenter?: () => void;
  panelWidth?: number;
  panelHeight?: number;
  onTextContentChange: (objectId: string, content: string) => void;
  onTextStyleChange: (objectId: string, patch: Partial<ComicTextStyle>) => void;
  onDuplicateText: (objectId: string) => void;
  onReorderText: (
    objectId: string,
    direction: "front" | "back" | "forward" | "backward"
  ) => void;
};

export function ComicPageEditorRightSidebar({
  projectId,
  pageId,
  panels,
  selection,
  panelBorderStyle,
  layoutPending,
  panelContent,
  artworkFitMode,
  onSelectPanel,
  onAddPanel,
  onDeletePanel,
  onDeleteSelection,
  onBorderStyleChange,
  onDuplicatePanel,
  onAlign,
  onDistribute,
  onAddTextObject,
  onSelectObject,
  onArtworkUploaded,
  onArtworkRemoved,
  onArtworkFitChange,
  onArtworkCenter,
  panelWidth,
  panelHeight,
  onTextContentChange,
  onTextStyleChange,
  onDuplicateText,
  onReorderText,
}: ComicPageEditorRightSidebarProps) {
  const autoTool = contextToolForSelection(selection);
  const [activeTool, setActiveTool] = useState<ComicEditorContextTool>(autoTool);

  useEffect(() => {
    setActiveTool(autoTool);
  }, [autoTool]);

  const selectedPanelId =
    selection.kind === "panel"
      ? selection.panelIds[0] ?? null
      : selection.kind === "text" || selection.kind === "artwork"
        ? selection.panelId
        : null;

  const selectedPanel =
    selectedPanelId ? panels.find((panel) => panel.id === selectedPanelId) ?? null : null;

  const visibleTabs = COMIC_CONTEXT_TOOLS.filter((tool) =>
    tool.id === "panel-properties"
      ? selection.kind === "panel" || selection.kind === "artwork"
      : tool.id === "text-tools"
        ? selection.kind === "text"
        : true
  );

  return (
    <aside className="production-editor-sidebar production-editor-sidebar-right">
      <nav className="production-editor-context-nav" aria-label="Context tools">
        {visibleTabs.map((tool) => (
          <button
            key={tool.id}
            type="button"
            onClick={() => setActiveTool(tool.id)}
            className={`production-editor-context-tab ${
              activeTool === tool.id ? "production-editor-context-tab-active" : ""
            }`}
          >
            {tool.label}
          </button>
        ))}
      </nav>

      <div className="production-editor-context-panel">
        {activeTool === "panels" && (
          <>
            <ComicPagePanelsSidebar
              projectId={projectId}
              pageId={pageId}
              panels={panels}
              selectedPanelId={selectedPanelId}
              onSelectPanel={(id) => onSelectPanel(id)}
              onAddPanel={onAddPanel}
            />
            {selection.kind === "panel" && selection.panelIds.length >= 2 && (
              <div className="mt-3 space-y-2 border-t border-[var(--brand-border)] pt-3">
                <p className="text-[10px] uppercase tracking-wide text-[var(--brand-text-muted)]">
                  Align & distribute
                </p>
                <div className="grid grid-cols-3 gap-1">
                  {(["left", "center", "right", "top", "middle", "bottom"] as const).map(
                    (align) => (
                      <button
                        key={align}
                        type="button"
                        onClick={() => onAlign(align)}
                        className="production-editor-chip capitalize"
                      >
                        {align}
                      </button>
                    )
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => onDistribute("horizontal")}
                    className="production-editor-chip flex-1"
                  >
                    Distribute H
                  </button>
                  <button
                    type="button"
                    onClick={() => onDistribute("vertical")}
                    className="production-editor-chip flex-1"
                  >
                    Distribute V
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {activeTool === "panel-properties" && selectedPanel && (
          <PanelPropertiesPanel
            panel={selectedPanel}
            projectId={projectId}
            panelBorderStyle={panelBorderStyle}
            layoutPending={layoutPending}
            hasArtwork={panelContent.hasArtwork(selectedPanel.id)}
            artworkFitMode={artworkFitMode}
            onBorderStyleChange={onBorderStyleChange}
            onDeletePanel={onDeletePanel}
            onDuplicatePanel={onDuplicatePanel}
            onArtworkUploaded={onArtworkUploaded}
            onArtworkRemoved={onArtworkRemoved}
            onArtworkFitChange={onArtworkFitChange}
            onArtworkCenter={onArtworkCenter}
            panelWidth={panelWidth}
            panelHeight={panelHeight}
          />
        )}

        {activeTool === "text-tools" && selection.kind === "text" && (
          <TextObjectPanel
            panelId={selection.panelId}
            objectId={selection.objectId}
            panelContent={panelContent}
            layoutPending={layoutPending}
            onContentChange={onTextContentChange}
            onStyleChange={onTextStyleChange}
            onDuplicate={() => onDuplicateText(selection.objectId)}
            onDelete={onDeleteSelection}
            onReorder={(direction) => onReorderText(selection.objectId, direction)}
          />
        )}

        {activeTool === "layers" && (
          <LayersPanel
            projectId={projectId}
            pageId={pageId}
            panels={panels}
            panelId={selectedPanelId}
            panelContent={panelContent}
            selectedObjectId={
              selection.kind === "text"
                ? selection.objectId
                : selection.kind === "artwork"
                  ? "artwork"
                  : null
            }
            onSelectPanel={(id) => onSelectPanel(id)}
            onSelectObject={onSelectObject}
            onReorderText={onReorderText}
          />
        )}
      </div>
    </aside>
  );
}

function PanelPropertiesPanel({
  panel,
  projectId,
  panelBorderStyle,
  layoutPending,
  hasArtwork,
  artworkFitMode,
  onBorderStyleChange,
  onDeletePanel,
  onDuplicatePanel,
  onArtworkUploaded,
  onArtworkRemoved,
  onArtworkFitChange,
  onArtworkCenter,
  panelWidth,
  panelHeight,
}: {
  panel: ComicPanel;
  projectId: string;
  panelBorderStyle: PanelBorderStyle;
  layoutPending: boolean;
  hasArtwork: boolean;
  artworkFitMode: ImageFitMode;
  onBorderStyleChange: (style: PanelBorderStyle) => void;
  onDeletePanel: () => void;
  onDuplicatePanel: () => void;
  onArtworkUploaded: (result: ArtworkUploadResult) => void;
  onArtworkRemoved: (document: CanvasDocumentV1) => void;
  onArtworkFitChange: (mode: ImageFitMode) => void;
  onArtworkCenter?: () => void;
  panelWidth?: number;
  panelHeight?: number;
}) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-[var(--foreground)]">{panel.name}</p>
        <p className="mt-1 text-xs text-[var(--brand-text-muted)]">
          Drag handles to move and resize. Scroll on artwork to zoom.
        </p>
      </div>

      <ComicStudioArtworkSlot
        label="Panel artwork"
        compact
        panelId={panel.id}
        projectId={projectId}
        panelWidth={panelWidth}
        panelHeight={panelHeight}
        hasArtwork={hasArtwork}
        fitMode={artworkFitMode}
        disabled={false}
        onUploaded={onArtworkUploaded}
        onRemoved={onArtworkRemoved}
        onFitModeChange={onArtworkFitChange}
        onCenter={onArtworkCenter}
      />

      <div>
        <label className="mb-1 block text-[10px] uppercase tracking-wide text-[var(--brand-text-muted)]">
          Border
        </label>
        <select
          value={panelBorderStyle}
          onChange={(event) => onBorderStyleChange(event.target.value as PanelBorderStyle)}
          disabled={layoutPending}
          className="production-editor-select w-full"
        >
          {PANEL_BORDER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={onDuplicatePanel}
        disabled={layoutPending}
        className="production-editor-sidebar-action w-full"
      >
        Duplicate panel
      </button>

      <button
        type="button"
        onClick={onDeletePanel}
        disabled={layoutPending}
        className="production-editor-btn production-editor-btn-danger w-full"
      >
        Delete panel
      </button>
    </div>
  );
}

function TextObjectPanel({
  panelId,
  objectId,
  panelContent,
  layoutPending,
  onContentChange,
  onStyleChange,
  onDuplicate,
  onDelete,
  onReorder,
}: {
  panelId: string;
  objectId: string;
  panelContent: ComicPanelContentApi;
  layoutPending: boolean;
  onContentChange: (objectId: string, content: string) => void;
  onStyleChange: (objectId: string, patch: Partial<ComicTextStyle>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onReorder: (direction: "front" | "back" | "forward" | "backward") => void;
}) {
  const objects = panelContent.getPanelTextObjects(panelId);
  const object = objects.find((obj) => obj.id === objectId);
  if (!object) return null;

  const payload = object.payload as TextPayloadV1;
  const kind = getTextKind(object);
  const style = getTextStyle(object);
  const isSfx = kind === "sfx";

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium capitalize text-[var(--foreground)]">
        {kind.replace("_", " ")}
      </p>
      <textarea
        value={payload.content}
        onChange={(event) => onContentChange(objectId, event.target.value)}
        rows={isSfx ? 2 : 4}
        className="production-editor-textarea w-full"
        placeholder="Edit text…"
      />

      <label className="block text-[10px] uppercase tracking-wide text-[var(--brand-text-muted)]">
        Font
      </label>
      <select
        value={payload.font_preset ?? style.font_preset ?? (isSfx ? "hero" : "dialogue")}
        onChange={(event) => {
          const preset = event.target.value as ComicFontPreset;
          const def = COMIC_FONT_PRESET_DEFS[preset];
          panelContent.updateText(panelId, objectId, {
            font_preset: preset,
            font_family: def.fontFamily,
          });
        }}
        className="production-editor-select w-full"
      >
        {Object.values(COMIC_FONT_PRESET_DEFS).map((preset) => (
          <option key={preset.id} value={preset.id}>
            {preset.label}
          </option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-2">
        <label className="text-[10px] text-[var(--brand-text-muted)]">
          Size
          <input
            type="number"
            min={8}
            max={120}
            value={payload.font_size ?? 14}
            onChange={(event) =>
              panelContent.updateText(panelId, objectId, { font_size: Number(event.target.value) })
            }
            className="production-editor-input mt-0.5 w-full"
          />
        </label>
        {!isSfx && (
          <label className="text-[10px] text-[var(--brand-text-muted)]">
            Align
            <select
              value={payload.align ?? "center"}
              onChange={(event) =>
                panelContent.updateText(panelId, objectId, {
                  align: event.target.value as TextPayloadV1["align"],
                })
              }
              className="production-editor-select mt-0.5 w-full"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </label>
        )}
        {isSfx && (
          <label className="text-[10px] text-[var(--brand-text-muted)]">
            Outline
            <input
              type="number"
              min={0}
              max={12}
              step={0.5}
              value={style.outline_width ?? 2}
              onChange={(event) =>
                onStyleChange(objectId, { outline_width: Number(event.target.value) })
              }
              className="production-editor-input mt-0.5 w-full"
            />
          </label>
        )}
      </div>

      {isSfx && (
        <div className="grid grid-cols-2 gap-2">
          <label className="text-[10px] text-[var(--brand-text-muted)]">
            Tracking
            <input
              type="number"
              min={-4}
              max={24}
              step={0.5}
              value={payload.letter_spacing ?? style.letter_spacing ?? 2}
              onChange={(event) =>
                panelContent.updateText(panelId, objectId, {
                  letter_spacing: Number(event.target.value),
                })
              }
              className="production-editor-input mt-0.5 w-full"
            />
          </label>
          <label className="text-[10px] text-[var(--brand-text-muted)]">
            Line height
            <input
              type="number"
              min={0.8}
              max={2}
              step={0.05}
              value={payload.line_height ?? style.line_height ?? 1}
              onChange={(event) =>
                panelContent.updateText(panelId, objectId, {
                  line_height: Number(event.target.value),
                })
              }
              className="production-editor-input mt-0.5 w-full"
            />
          </label>
        </div>
      )}

      <div className="flex flex-wrap gap-1">
        {(
          [
            ["bold", payload.bold ?? style.bold],
            ["italic", payload.italic ?? style.italic],
            ["underline", payload.underline ?? style.underline],
          ] as const
        ).map(([key, active]) => (
          <button
            key={key}
            type="button"
            onClick={() =>
              panelContent.updateText(panelId, objectId, { [key]: !active })
            }
            className={`production-editor-chip capitalize ${active ? "production-editor-chip-active" : ""}`}
          >
            {key}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <StudioColorPicker
          label="Text"
          value={payload.fill_color ?? style.fill_color}
          onChange={(color) => panelContent.updateText(panelId, objectId, { fill_color: color })}
          compact
        />
        {!isSfx && (
          <StudioColorPicker
            label="Bubble"
            value={style.background_fill === "transparent" ? "#ffffff" : style.background_fill}
            opacity={style.background_opacity || 1}
            showOpacity
            onChange={(color, opacity) =>
              onStyleChange(objectId, {
                background_fill: color,
                background_opacity: opacity ?? 1,
              })
            }
            compact
          />
        )}
        <StudioColorPicker
          label="Outline"
          value={style.outline_color === "transparent" ? "#1e293b" : style.outline_color}
          onChange={(color) =>
            onStyleChange(objectId, {
              outline_color: color,
              outline_width: style.outline_width > 0 ? style.outline_width : 1.5,
            })
          }
          compact
        />
      </div>

      <div className="flex flex-wrap gap-1">
        <button type="button" onClick={onDuplicate} className="production-editor-chip">
          Duplicate
        </button>
        <button type="button" onClick={() => onReorder("forward")} className="production-editor-chip">
          Forward
        </button>
        <button type="button" onClick={() => onReorder("backward")} className="production-editor-chip">
          Back
        </button>
      </div>
      <button
        type="button"
        onClick={onDelete}
        disabled={layoutPending}
        className="production-editor-btn production-editor-btn-danger w-full"
      >
        Delete text
      </button>
    </div>
  );
}

function LayersPanel({
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
  onReorderText: (objectId: string, direction: "front" | "back" | "forward" | "backward") => void;
}) {
  const router = useRouter();
  const textObjects = panelId ? panelContent.getPanelTextObjects(panelId) : [];

  function reorderPanel(panelIdToMove: string, direction: "forward" | "backward" | "front" | "back") {
    const ids = panels.map((panel) => panel.id);
    const index = ids.indexOf(panelIdToMove);
    if (index < 0) return;
    const next = [...ids];
    if (direction === "forward" && index < next.length - 1) {
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
    } else if (direction === "backward" && index > 0) {
      [next[index], next[index - 1]] = [next[index - 1], next[index]];
    } else if (direction === "front") {
      next.splice(index, 1);
      next.push(panelIdToMove);
    } else if (direction === "back") {
      next.splice(index, 1);
      next.unshift(panelIdToMove);
    } else {
      return;
    }
    void reorderComicPanels(projectId, pageId, next).then((result) => {
      if (!result.error) router.refresh();
    });
  }

  const contentByKind = {
    speech: textObjects.filter((obj) => getTextKind(obj) === "speech"),
    thought: textObjects.filter((obj) => getTextKind(obj) === "thought"),
    caption: textObjects.filter(
      (obj) =>
        getTextKind(obj) === "caption" ||
        getTextKind(obj) === "narration" ||
        getTextKind(obj) === "free"
    ),
    sfx: textObjects.filter((obj) => getTextKind(obj) === "sfx"),
  };

  return (
    <div className="space-y-4">
      <section>
        <p className="text-[10px] uppercase tracking-wide text-[var(--brand-text-muted)]">Panels</p>
        <ul className="mt-1 space-y-1">
          {panels.map((panel, index) => (
            <li key={panel.id} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onSelectPanel(panel.id)}
                className={`production-editor-layer-item flex-1 text-left ${
                  panelId === panel.id ? "production-editor-layer-item-active" : ""
                }`}
              >
                Panel {index + 1}
              </button>
              <button
                type="button"
                title="Bring forward"
                onClick={() => reorderPanel(panel.id, "forward")}
                className="production-editor-chip px-1.5"
              >
                ↑
              </button>
              <button
                type="button"
                title="Bring to front"
                onClick={() => reorderPanel(panel.id, "front")}
                className="production-editor-chip px-1"
              >
                ⤒
              </button>
              <button
                type="button"
                title="Send to back"
                onClick={() => reorderPanel(panel.id, "back")}
                className="production-editor-chip px-1"
              >
                ⤓
              </button>
            </li>
          ))}
        </ul>
      </section>

      {panelId && (
        <section>
          <p className="text-[10px] uppercase tracking-wide text-[var(--brand-text-muted)]">
            Content
          </p>
          <ul className="mt-1 space-y-2">
            {(
              [
                ["Speech", contentByKind.speech],
                ["Thought", contentByKind.thought],
                ["Caption", contentByKind.caption],
                ["SFX", contentByKind.sfx],
              ] as const
            ).map(([label, items]) =>
              items.length > 0 ? (
                <li key={label}>
                  <p className="text-[10px] font-medium text-[var(--brand-text-secondary)]">
                    {label}
                  </p>
                  <ul className="mt-0.5 space-y-0.5">
                    {items.map((obj) => (
                      <li key={obj.id} className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onSelectObject(obj.id)}
                          className={`production-editor-layer-item flex-1 truncate text-left ${
                            selectedObjectId === obj.id
                              ? "production-editor-layer-item-active"
                              : ""
                          }`}
                        >
                          {(obj.payload as TextPayloadV1).content.slice(0, 24) || label}
                        </button>
                        <button
                          type="button"
                          title="Bring forward"
                          onClick={() => onReorderText(obj.id, "forward")}
                          className="production-editor-chip px-1.5"
                        >
                          ↑
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : null
            )}
          </ul>
        </section>
      )}
    </div>
  );
}
