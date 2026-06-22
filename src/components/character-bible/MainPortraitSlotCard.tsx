"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  assignImageToSlot,
  uploadCharacterImage,
} from "@/app/actions/character-images";
import { CharacterPortraitPositionEditor } from "@/components/character-bible/CharacterPortraitPositionEditor";
import { ImagePickerModal } from "@/components/image-picker/ImagePickerModal";
import { labelForAssetRole } from "@/lib/asset-role-labels";
import { characterImagesToPickerItems } from "@/lib/image-picker-character";
import type { SlotAssignmentMap } from "@/lib/character-slot-assignments";
import { ASSET_SOURCE_LABELS } from "@/types/character-image-slot";
import type { AssetSource } from "@/types/character-image-slot";
import type { CharacterImageWithUrl } from "@/types/character-image";

type MainPortraitSlotCardProps = {
  characterId: string;
  hint?: string;
  image: CharacterImageWithUrl | null;
  assignmentSource?: AssetSource | null;
  galleryImages: CharacterImageWithUrl[];
  slotMap: SlotAssignmentMap;
  portraitFocalY: number;
  onUpdated: () => void;
};

export function MainPortraitSlotCard({
  characterId,
  hint,
  image,
  assignmentSource,
  galleryImages,
  slotMap,
  portraitFocalY,
  onUpdated,
}: MainPortraitSlotCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const pickerItems = useMemo(
    () =>
      characterImagesToPickerItems(
        galleryImages,
        slotMap,
        "canonical",
        image?.id ?? null
      ),
    [galleryImages, slotMap, image?.id]
  );

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.set("image", file);
    formData.set("asset_role", "canonical");

    startTransition(async () => {
      const result = await uploadCharacterImage(characterId, formData);
      if (!result.error) {
        setPickerOpen(false);
        onUpdated();
        router.refresh();
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  }

  function handleAssign(imageId: string) {
    startTransition(async () => {
      const result = await assignImageToSlot(
        characterId,
        imageId,
        "canonical",
        "assigned"
      );
      if (!result.error) {
        setPickerOpen(false);
        onUpdated();
        router.refresh();
      }
    });
  }

  const slotLabel = labelForAssetRole("canonical");

  return (
    <>
      <div className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-[var(--brand-text-secondary)]">
              {slotLabel}
            </p>
            {hint && (
              <p className="mt-1 text-xs leading-relaxed text-[var(--brand-text-secondary)]">
                {hint}
              </p>
            )}
          </div>
          {image ? (
            <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-emerald-400">
              Set
            </span>
          ) : (
            <span className="rounded bg-zinc-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[var(--brand-text-secondary)]">
              Missing
            </span>
          )}
        </div>

        <div className="mt-3 space-y-4">
          {image?.url ? (
            <CharacterPortraitPositionEditor
              characterId={characterId}
              photoUrl={image.url}
              focalY={portraitFocalY}
            />
          ) : (
            <div className="relative mx-auto aspect-[4/5] max-w-[240px] overflow-hidden rounded-md border border-[var(--brand-border)] bg-[var(--studio-empty-fill)]">
              <div className="flex h-full flex-col items-center justify-center gap-1 text-[var(--brand-text-secondary)]">
                <span className="text-2xl" aria-hidden>
                  ○
                </span>
                <span className="text-[10px]">No image assigned</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {image && assignmentSource && (
              <p className="text-[10px] text-[var(--brand-text-secondary)]">
                Source: {ASSET_SOURCE_LABELS[assignmentSource]}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleUpload}
                disabled={pending}
                className="hidden"
                id={`upload-${characterId}-canonical`}
              />
              <label
                htmlFor={`upload-${characterId}-canonical`}
                className={`cursor-pointer rounded-md border border-[var(--brand-border)] bg-[var(--brand-surface)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--brand-text-secondary)] transition hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)] ${
                  pending ? "pointer-events-none opacity-60" : ""
                }`}
              >
                Upload
              </label>
              <button
                type="button"
                disabled={pending}
                onClick={() => setPickerOpen(true)}
                className="rounded-md border border-[var(--brand-border)] bg-[var(--brand-surface)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--brand-text-secondary)] transition hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)] disabled:opacity-60"
              >
                Assign Existing
              </button>
              <button
                type="button"
                disabled
                title="Coming soon"
                className="cursor-not-allowed rounded-md border border-[var(--brand-border)] bg-[var(--brand-surface)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--brand-text-secondary)]"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      </div>

      <ImagePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title={`Assign image to ${slotLabel}`}
        subtitle="Pick from your gallery — best matches appear first."
        items={pickerItems}
        currentImageId={image?.id ?? null}
        onConfirm={handleAssign}
        pending={pending}
      />
    </>
  );
}
