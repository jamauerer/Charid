"use client";

import { FlipHorizontal2, FlipVertical2 } from "lucide-react";
import type { LayoutCanvasZoomState } from "@/components/project/production/canvas/useLayoutCanvasZoom";
import type { ComicEditorSelection } from "@/components/project/production/studio/production-studio-editor";
import type { StudioDocumentSettings } from "@/lib/studio/document-settings";
import type { ImageFitMode } from "@/lib/canvas/panel-content";
import type { PageViewMode } from "@/lib/canvas/page-view-mode";
import { StudioColorPicker } from "@/components/studio/StudioColorPicker";
import type { PanelBorderStyle } from "@/lib/canvas/page-layout-surface";
import { COMIC_FONT_PRESET_DEFS, type ComicFontPreset } from "@/lib/canvas/comic-font-presets";

type StudioContextToolbarProps = {
  selection: ComicEditorSelection;
  zoom: LayoutCanvasZoomState;
  pageViewMode: PageViewMode;
  onPageViewModeChange?: (mode: PageViewMode) => void;
  documentSettings?: StudioDocumentSettings;
  onDocumentSettingsChange?: (settings: StudioDocumentSettings) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  panelBorderStyle?: PanelBorderStyle;
  onBorderStyleChange?: (style: PanelBorderStyle) => void;
  artworkFitMode?: ImageFitMode;
  onArtworkFitChange?: (mode: ImageFitMode) => void;
  onArtworkCenter?: () => void;
  onArtworkTransform?: (patch: { opacity?: number; rotation?: number }) => void;
  artworkOpacity?: number;
  artworkRotation?: number;
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
};

function TbBtn({
  children,
  title,
  disabled,
  onClick,
  active,
  className = "",
}: {
  children: React.ReactNode;
  title: string;
  disabled?: boolean;
  onClick?: () => void;
  active?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`tb-btn${active ? " active" : ""}${className ? ` ${className}` : ""}`}
    >
      {children}
    </button>
  );
}

function TbSep() {
  return <div className="tb-sep" aria-hidden />;
}

/** Topbar context controls — matches `.topbar-tools` / `.ctx-group` in the HTML reference */
export function StudioContextToolbar(props: StudioContextToolbarProps) {
  const { selection, canUndo, canRedo, onUndo, onRedo, layoutPending } = props;

  return (
    <div className="topbar-tools">
      <TbBtn title="Undo" disabled={!canUndo || layoutPending} onClick={onUndo}>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 6h8a4 4 0 1 1 0 8H6" strokeLinecap="round" />
          <polyline points="5,3 2,6 5,9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </TbBtn>
      <TbBtn title="Redo" disabled={!canRedo || layoutPending} onClick={onRedo}>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 6H6a4 4 0 1 0 0 8h4" strokeLinecap="round" />
          <polyline points="11,3 14,6 11,9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </TbBtn>

      <TbSep />

      <div className={`ctx-group${selection.kind === "panel" ? "" : " hidden"}`}>
        <select
          value={props.panelBorderStyle ?? "black"}
          onChange={(e) => props.onBorderStyleChange?.(e.target.value as PanelBorderStyle)}
          className="tb-btn"
          title="Border"
          disabled={layoutPending}
        >
          {(["black", "white", "none"] as const).map((v) => (
            <option key={v} value={v}>
              {v === "black" ? "Border" : v === "white" ? "White Border" : "No Border"}
            </option>
          ))}
        </select>
        <TbBtn title="Fill color">
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Fill</span>
          <span className="color-swatch" style={{ background: "#ffffff" }} />
        </TbBtn>
        <TbSep />
        <TbBtn title="Bring forward" disabled>
          ↑ Forward
        </TbBtn>
        <TbBtn title="Send backward" disabled>
          ↓ Backward
        </TbBtn>
        <TbSep />
        <TbBtn title="Duplicate" disabled>
          ⧉ Duplicate
        </TbBtn>
        <TbBtn title="Delete" className="" onClick={props.onDeletePanel} disabled={layoutPending}>
          <span style={{ color: "var(--red)" }}>✕ Delete</span>
        </TbBtn>
      </div>

      <div className={`ctx-group${selection.kind === "text" ? "" : " hidden"}`}>
        <TbBtn title="Font">
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Font</span>
          <select
            value={props.textFontPreset ?? "dialogue"}
            onChange={(e) => props.onTextFontPresetChange?.(e.target.value as ComicFontPreset)}
            className="bg-transparent border-none text-inherit"
          >
            {Object.values(COMIC_FONT_PRESET_DEFS).map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </TbBtn>
        <TbBtn title="Size">
          <input
            type="number"
            min={8}
            max={120}
            value={props.textFontSize ?? 16}
            onChange={(e) => props.onTextFontSizeChange?.(Number(e.target.value))}
            className="w-10 bg-transparent text-inherit"
          />
          px ▾
        </TbBtn>
        <TbSep />
        <TbBtn title="Bold" active={props.textBold} onClick={() => props.onTextStyleToggle?.("bold")}>
          <b>B</b>
        </TbBtn>
        <TbBtn title="Italic" active={props.textItalic} onClick={() => props.onTextStyleToggle?.("italic")}>
          <i>I</i>
        </TbBtn>
        <TbBtn title="Underline" active={props.textUnderline} onClick={() => props.onTextStyleToggle?.("underline")}>
          <u>U</u>
        </TbBtn>
        <TbSep />
        <TbBtn title="Align left" active={props.textAlign === "left"} onClick={() => props.onTextAlignChange?.("left")}>
          ≡ Left
        </TbBtn>
        <TbBtn title="Align center" active={props.textAlign === "center"} onClick={() => props.onTextAlignChange?.("center")}>
          ≡ Center
        </TbBtn>
        <TbBtn title="Align right" active={props.textAlign === "right"} onClick={() => props.onTextAlignChange?.("right")}>
          ≡ Right
        </TbBtn>
        <TbSep />
        <StudioColorPicker
          label="Color"
          value={props.textColor ?? "#111111"}
          onChange={(c) => props.onTextColorChange?.(c)}
          compact
        />
        <TbSep />
        <TbBtn title="Delete" onClick={props.onDeleteSelection}>
          <span style={{ color: "var(--red)" }}>✕ Delete</span>
        </TbBtn>
      </div>

      <div className={`ctx-group${selection.kind === "artwork" ? "" : " hidden"}`}>
        <TbBtn title="Flip horizontally" disabled>
          <FlipHorizontal2 size={14} strokeWidth={1.5} />
          Flip H
        </TbBtn>
        <TbBtn title="Flip vertically" disabled>
          <FlipVertical2 size={14} strokeWidth={1.5} />
          Flip V
        </TbBtn>
        <TbSep />
        <label className="tb-btn" style={{ gap: 6 }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Opacity</span>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={props.artworkOpacity ?? 1}
            onChange={(e) => props.onArtworkTransform?.({ opacity: Number(e.target.value) })}
          />
        </label>
        <TbSep />
        {(["fit", "fill", "contain"] as const).map((mode) => (
          <TbBtn
            key={mode}
            title={mode}
            active={props.artworkFitMode === mode}
            onClick={() => props.onArtworkFitChange?.(mode)}
          >
            <span className="capitalize">{mode}</span>
          </TbBtn>
        ))}
        <TbBtn title="Center artwork" onClick={props.onArtworkCenter}>
          Center
        </TbBtn>
      </div>
    </div>
  );
}
