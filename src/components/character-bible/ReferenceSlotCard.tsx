"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  assignImageToSlot,
  uploadCharacterImage,
} from "@/app/actions/character-images";
import { ImagePickerModal } from "@/components/image-picker/ImagePickerModal";
import { labelForAssetRole } from "@/lib/asset-role-labels";
import { characterImagesToPickerItems } from "@/lib/image-picker-character";
import type { SlotAssignmentMap } from "@/lib/character-slot-assignments";
import { ASSET_SOURCE_LABELS } from "@/types/character-image-slot";
import type { AssetSource } from "@/types/character-image-slot";
import type { CharacterImageWithUrl } from "@/types/character-image";

type ReferenceSlotCardProps = {
  characterId: string;
  slotRole: string;
  hint?: string;
  image: CharacterImageWithUrl | null;
  assignmentSource?: AssetSource | null;
  galleryImages: CharacterImageWithUrl[];
  slotMap: SlotAssignmentMap;
  onUpdated: () => void;
  compact?: boolean;
};

export function ReferenceSlotCard({
  characterId,
  slotRole,
  hint,
  image,
  assignmentSource,
  galleryImages,
  slotMap,
  onUpdated,
  compact = false,
}: ReferenceSlotCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const pickerItems = useMemo(
    () =>
      characterImagesToPickerItems(
        galleryImages,
        slotMap,
        slotRole,
        image?.id ?? null
      ),
    [galleryImages, slotMap, slotRole, image?.id]
  );

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.set("image", file);
    formData.set("asset_role", slotRole);

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
        slotRole,
        "assigned"
      );
      if (!result.error) {
        setPickerOpen(false);
        onUpdated();
        router.refresh();
      }
    });
  }

  const slotLabel = labelForAssetRole(slotRole);

  return (
    <>
      <div
        className={`rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] ${
          compact ? "p-3" : "p-4"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-[var(--brand-text-secondary)]">{slotLabel}</p>
            {hint && !compact && (
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

        <div className={`mt-3 ${compact ? "flex items-start gap-3" : ""}`}>
          <div
            className={`relative overflow-hidden rounded-md border border-[var(--brand-border)] bg-[var(--studio-empty-fill)] ${
              compact ? "h-16 w-16 shrink-0" : "mx-auto aspect-square max-w-[200px]"
            }`}
          >
            {image?.url ? (
              <Image
                src={image.url}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full min-h-[4rem] flex-col items-center justify-center gap-1 text-[var(--brand-text-secondary)]">
                <span className="text-2xl" aria-hidden>
                  ○
                </span>
                {!compact && (
                  <span className="text-[10px]">No image assigned</span>
                )}
              </div>
            )}
          </div>

          <div className={`space-y-2 ${compact ? "min-w-0 flex-1" : "mt-3"}`}>
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
                id={`upload-${characterId}-${slotRole}`}
              />
              <label
                htmlFor={`upload-${characterId}-${slotRole}`}
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
