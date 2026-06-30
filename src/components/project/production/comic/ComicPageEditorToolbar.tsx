"use client";

import Link from "next/link";
import { CharIDLogo } from "@/components/brand/CharIDLogo";
import { StudioContextToolbar } from "@/components/project/production/studio/StudioContextToolbar";
import type { LayoutCanvasZoomState } from "@/components/project/production/canvas/useLayoutCanvasZoom";
import type {
  ComicEditorSelection,
  StudioEditorMode,
} from "@/components/project/production/studio/production-studio-editor";
import type { StudioDocumentSettings } from "@/lib/studio/document-settings";
import type { ImageFitMode } from "@/lib/canvas/panel-content";
import type { PageViewMode } from "@/lib/canvas/page-view-mode";
import type { PanelBorderStyle } from "@/lib/canvas/page-layout-surface";
import type { ComicFontPreset } from "@/lib/canvas/comic-font-presets";
import {
  comicPageStudioPath,
  comicPageWorkspacePath,
  projectProductionPath,
} from "@/lib/production-routes";

type ComicPageEditorToolbarProps = {
  projectId: string;
  projectTitle: string;
  pageId: string;
  pageName: string;
  issueName: string;
  statusLabel: string;
  saveLabel: string;
  editorMode: StudioEditorMode;
  zoom: LayoutCanvasZoomState;
  pageViewMode?: PageViewMode;
  onPageViewModeChange?: (mode: PageViewMode) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  documentSettings?: StudioDocumentSettings;
  onDocumentSettingsChange?: (settings: StudioDocumentSettings) => void;
  selection: ComicEditorSelection;
  panelBorderStyle?: PanelBorderStyle;
  onBorderStyleChange?: (style: PanelBorderStyle) => void;
  artworkFitMode?: ImageFitMode;
  onArtworkFitChange?: (mode: ImageFitMode) => void;
  onArtworkCenter?: () => void;
  onDuplicatePanel?: () => void;
  onDeletePanel?: () => void;
  onDeleteSelection?: () => void;
  onDuplicateText?: () => void;
  textFontPreset?: ComicFontPreset;
  textFontSize?: number;
  textBold?: boolean;
  textItalic?: boolean;
  textUnderline?: boolean;
  textAlign?: "left" | "center" | "right";
  onTextFontPresetChange?: (preset: ComicFontPreset) => void;
  onTextFontSizeChange?: (size: number) => void;
  onTextStyleToggle?: (key: "bold" | "italic" | "underline") => void;
  onTextAlignChange?: (align: "left" | "center" | "right") => void;
  onTextColorChange?: (color: string) => void;
  onBubbleFillChange?: (color: string) => void;
  onBubbleOutlineChange?: (color: string) => void;
  textColor?: string;
  bubbleFill?: string;
  bubbleOutline?: string;
  layoutPending?: boolean;
  onArtworkTransform?: (patch: { opacity?: number; rotation?: number }) => void;
  artworkOpacity?: number;
  artworkRotation?: number;
};

export function ComicPageEditorToolbar({
  projectId,
  projectTitle,
  pageId,
  pageName,
  saveLabel,
  editorMode,
  zoom,
  pageViewMode = "single",
  onPageViewModeChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  documentSettings,
  onDocumentSettingsChange,
  selection,
  panelBorderStyle,
  onBorderStyleChange,
  artworkFitMode,
  onArtworkFitChange,
  onArtworkCenter,
  onDeletePanel,
  onDeleteSelection,
  onDuplicateText,
  textFontPreset,
  textFontSize,
  textBold,
  textItalic,
  textUnderline,
  textAlign,
  onTextFontPresetChange,
  onTextFontSizeChange,
  onTextStyleToggle,
  onTextAlignChange,
  onTextColorChange,
  onBubbleFillChange,
  onBubbleOutlineChange,
  textColor,
  bubbleFill,
  bubbleOutline,
  layoutPending,
  onArtworkTransform,
  artworkOpacity,
  artworkRotation,
}: ComicPageEditorToolbarProps) {
  const isStudioMode = editorMode === "full";
  const toggleHref = isStudioMode
    ? comicPageWorkspacePath(projectId, pageId)
    : comicPageStudioPath(projectId, pageId);
  const toggleLabel = isStudioMode ? "Close Studio" : "Studio";
  const autosaveLabel =
    saveLabel && saveLabel !== "Saved" && saveLabel !== "Autosave" ? saveLabel : "Auto-saved";

  return (
    <>
      <div className="topbar-brand">
        <CharIDLogo size="sm" className="brand-logo" />
        <span className="brand-name">CharID</span>
        <span className="brand-sep">/</span>
        <span className="brand-meta">
          {!isStudioMode ? (
            <Link href={projectProductionPath(projectId)} className="hover:text-[var(--teal)]">
              {projectTitle}
            </Link>
          ) : (
            projectTitle
          )}
          {" · "}
          {pageName}
        </span>
      </div>

      <StudioContextToolbar
          selection={selection}
          zoom={zoom}
          pageViewMode={pageViewMode}
          onPageViewModeChange={onPageViewModeChange}
          documentSettings={documentSettings}
          onDocumentSettingsChange={onDocumentSettingsChange}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={onUndo}
          onRedo={onRedo}
          panelBorderStyle={panelBorderStyle}
          onBorderStyleChange={onBorderStyleChange}
          artworkFitMode={artworkFitMode}
          onArtworkFitChange={onArtworkFitChange}
          onArtworkCenter={onArtworkCenter}
          onDeleteSelection={onDeleteSelection}
          onDeletePanel={onDeletePanel}
          onDuplicateText={onDuplicateText}
          textFontPreset={textFontPreset}
          textFontSize={textFontSize}
          textBold={textBold}
          textItalic={textItalic}
          textUnderline={textUnderline}
          textAlign={textAlign}
          onTextFontPresetChange={onTextFontPresetChange}
          onTextFontSizeChange={onTextFontSizeChange}
          onTextStyleToggle={onTextStyleToggle}
          onTextAlignChange={onTextAlignChange}
          onTextColorChange={onTextColorChange}
          onBubbleFillChange={onBubbleFillChange}
          onBubbleOutlineChange={onBubbleOutlineChange}
          textColor={textColor}
          bubbleFill={bubbleFill}
          bubbleOutline={bubbleOutline}
          layoutPending={layoutPending}
          onArtworkTransform={onArtworkTransform}
          artworkOpacity={artworkOpacity}
          artworkRotation={artworkRotation}
        />
      <div className="topbar-right">
        <span
          className="tb-status"
          style={saveLabel === "Save failed" ? { color: "var(--red)" } : undefined}
          aria-live="polite"
        >
          {autosaveLabel}
        </span>
        <div className="tb-sep" aria-hidden />
        <button type="button" className="btn-draft">
          Draft ▾
        </button>
        <button
          type="button"
          disabled
          className="btn-publish"
          title="Publish — coming in a future milestone"
        >
          Publish
        </button>
        <Link
          href={toggleHref}
          className="ml-2 text-[11px] text-[var(--text-muted)] hover:text-[var(--teal)]"
          title={toggleLabel}
        >
          {toggleLabel}
        </Link>
      </div>
    </>
  );
}
