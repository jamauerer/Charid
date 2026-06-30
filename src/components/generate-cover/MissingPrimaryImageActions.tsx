"use client";

import type { ChangeEvent, ReactNode } from "react";
import {
  studioBtnPrimarySm,
  studioBtnSecondary,
  studioEmptyArt,
} from "@/lib/visual-identity";

type MissingPrimaryImageActionsProps = {
  /** Empty-state headline inside art placeholder */
  placeholderCopy: string;
  /** Entity-specific hint under actions */
  hint?: string;
  /** When true, primary image already set — compact action row only */
  hasImage?: boolean;
  uploadInputId: string;
  onUploadChange: (event: ChangeEvent<HTMLInputElement>) => void;
  uploadPending?: boolean;
  uploadAccept?: string;
  uploadLabel?: string;
  replaceLabel?: string;
  onUseExisting?: () => void;
  onGenerate?: () => void;
  onSkip?: () => void;
  useExistingEnabled?: boolean;
  generateEnabled?: boolean;
  showSkip?: boolean;
  /** Shown when Use Existing / Generate not yet wired */
  comingSoonHint?: string;
  /** Optional slot above actions (e.g. existing image preview) */
  children?: ReactNode;
};

export function MissingPrimaryImageActions({
  placeholderCopy,
  hint = "Upload new art, pick something you already approved in CharID, or generate.",
  hasImage = false,
  uploadInputId,
  onUploadChange,
  uploadPending = false,
  uploadAccept = "image/jpeg,image/png,image/webp",
  uploadLabel = "Upload",
  replaceLabel = "Upload",
  onUseExisting,
  onGenerate,
  onSkip,
  useExistingEnabled = false,
  generateEnabled = false,
  showSkip = true,
  comingSoonHint = "Use Existing and Generate ship with the Generate Cover rollout.",
  children,
}: MissingPrimaryImageActionsProps) {
  const uploadText = pendingLabel(uploadPending, hasImage ? replaceLabel : uploadLabel);

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)]">
      {!hasImage && (
        <div className={`relative aspect-[21/9] bg-[var(--studio-empty-fill)] sm:aspect-[3/1] ${studioEmptyArt}`}>
          <p className="max-w-md px-6 text-center text-sm">{placeholderCopy}</p>
        </div>
      )}

      {children}

      <div className="flex flex-col gap-3 border-t border-[var(--brand-border)] px-5 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <p className="text-xs text-[var(--brand-text-secondary)]">{hint}</p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            id={uploadInputId}
            type="file"
            accept={uploadAccept}
            onChange={onUploadChange}
            disabled={uploadPending}
            className="hidden"
          />
          <label
            htmlFor={uploadInputId}
            className={`inline-flex cursor-pointer ${studioBtnSecondary} ${
              uploadPending ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {uploadText}
          </label>

          <ActionButton
            label="Use Existing"
            enabled={useExistingEnabled}
            onClick={onUseExisting}
            title={
              useExistingEnabled
                ? "Choose approved artwork already in CharID"
                : comingSoonHint
            }
          />

          <ActionButton
            label="Generate"
            enabled={generateEnabled}
            onClick={onGenerate}
            primary
            title={
              generateEnabled
                ? "Generate from your story references"
                : comingSoonHint
            }
          />

          {showSkip && onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="rounded-lg px-2 py-1.5 text-xs text-[var(--brand-text-secondary)] transition hover:text-[var(--brand-text-secondary)]"
            >
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function pendingLabel(pending: boolean, label: string): string {
  return pending ? "Uploading…" : label;
}

function ActionButton({
  label,
  enabled,
  onClick,
  primary = false,
  title,
}: {
  label: string;
  enabled: boolean;
  onClick?: () => void;
  primary?: boolean;
  title?: string;
}) {
  const className = primary ? studioBtnPrimarySm : studioBtnSecondary;
  return (
    <button
      type="button"
      disabled={!enabled}
      onClick={enabled ? onClick : undefined}
      title={title}
      className={`${className} ${
        enabled ? "" : "cursor-not-allowed opacity-45"
      }`}
    >
      {label}
    </button>
  );
}
