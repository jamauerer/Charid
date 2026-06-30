"use client";

import { useRef, useState, useTransition } from "react";
import {
  removePanelArtwork,
  uploadPanelArtwork,
} from "@/app/actions/production/panel-content";
import type { ImageFitMode } from "@/lib/canvas/panel-content";
import type { CanvasDocumentV1 } from "@/types/canvas/document-v1";

export type ArtworkUploadResult = {
  document: CanvasDocumentV1;
  surfaceId: string;
  artworkUrl: string | null;
};

type ComicStudioArtworkSlotProps = {
  label?: string;
  compact?: boolean;
  panelId: string | null;
  projectId: string;
  panelWidth?: number;
  panelHeight?: number;
  hasArtwork: boolean;
  fitMode?: ImageFitMode;
  disabled?: boolean;
  onUploaded: (result: ArtworkUploadResult) => void;
  onRemoved: (document: CanvasDocumentV1) => void;
  onFitModeChange?: (mode: ImageFitMode) => void;
  onCenter?: () => void;
};

const FIT_OPTIONS: { value: ImageFitMode; label: string }[] = [
  { value: "fill", label: "Fill" },
  { value: "fit", label: "Fit" },
  { value: "contain", label: "Contain" },
];

export function ComicStudioArtworkSlot({
  label = "Artwork",
  compact = false,
  panelId,
  projectId,
  panelWidth,
  panelHeight,
  hasArtwork,
  fitMode = "fill",
  disabled = false,
  onUploaded,
  onRemoved,
  onFitModeChange,
  onCenter,
}: ComicStudioArtworkSlotProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !panelId) return;
    event.target.value = "";

    const formData = new FormData();
    formData.set("file", file);
    if (panelWidth != null) formData.set("panelWidth", String(Math.round(panelWidth)));
    if (panelHeight != null) formData.set("panelHeight", String(Math.round(panelHeight)));

    startTransition(async () => {
      setError(null);
      const result = await uploadPanelArtwork(projectId, panelId, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.document && result.surfaceId) {
        onUploaded({
          document: result.document,
          surfaceId: result.surfaceId,
          artworkUrl: result.artworkUrl ?? null,
        });
        if (!result.artworkUrl) {
          setError("Image saved — preview loading. If it doesn't appear, reload once.");
        }
      }
    });
  }

  function handleRemove() {
    if (!panelId) return;
    startTransition(async () => {
      setError(null);
      const result = await removePanelArtwork(projectId, panelId);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.document) onRemoved(result.document);
    });
  }

  const busy = disabled || pending || !panelId;

  return (
    <div
      className={`production-artwork-slot ${compact ? "production-artwork-slot-compact" : ""}`}
    >
      {!compact && <p className="production-artwork-slot-label">{label}</p>}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleFileChange}
      />
      <div className="production-artwork-slot-actions">
        <ArtworkAction
          label={hasArtwork ? "Replace" : "Upload"}
          onClick={handleUploadClick}
          disabled={busy}
        />
        {hasArtwork && (
          <ArtworkAction label="Remove" muted onClick={handleRemove} disabled={busy} />
        )}
      </div>
      {hasArtwork && onFitModeChange && (
        <div className="mt-2 flex flex-wrap gap-1">
          {FIT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={busy}
              onClick={() => onFitModeChange(option.value)}
              className={`production-editor-chip ${fitMode === option.value ? "production-editor-chip-active" : ""}`}
            >
              {option.label}
            </button>
          ))}
          {onCenter && (
            <button
              type="button"
              disabled={busy}
              onClick={onCenter}
              className="production-editor-chip"
            >
              Center
            </button>
          )}
        </div>
      )}
      {error && <p className="mt-1 text-[10px] text-[var(--status-danger-text)]">{error}</p>}
      {pending && (
        <p className="mt-1 flex items-center gap-1.5 text-[10px] text-[var(--brand-text-muted)]">
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[var(--brand-border)] border-t-[var(--brand-accent)]" />
          Uploading…
        </p>
      )}
    </div>
  );
}

function ArtworkAction({
  label,
  onClick,
  disabled,
  muted,
  soon,
  title,
}: {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  muted?: boolean;
  soon?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`production-artwork-slot-btn ${muted ? "production-artwork-slot-btn-muted" : ""}`}
      title={title}
    >
      {label}
    </button>
  );
}
