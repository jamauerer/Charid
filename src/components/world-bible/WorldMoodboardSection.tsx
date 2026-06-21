"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import {
  addMoodboardImageFromGallery,
  removeMoodboardItem,
  uploadMoodboardImage,
} from "@/app/actions/world-moodboards";
import { ConfirmDialog } from "@/components/studio/ConfirmDialog";
import { ImagePickerModal } from "@/components/image-picker/ImagePickerModal";
import { worldImagesToPickerItemsGeneral } from "@/lib/image-picker-world";
import type { WorldSlotAssignmentMap } from "@/lib/world-slot-assignments";
import type { WorldImageWithUrl } from "@/types/world-image";
import type { WorldMoodboardBundle } from "@/types/world-moodboard";
import { studioBtnSecondary } from "@/lib/visual-identity";

type WorldMoodboardSectionProps = {
  worldId: string;
  bundle: WorldMoodboardBundle;
  galleryImages: WorldImageWithUrl[];
  slotMap: WorldSlotAssignmentMap;
};

export function WorldMoodboardSection({
  worldId,
  bundle,
  galleryImages,
  slotMap,
}: WorldMoodboardSectionProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [removePendingId, setRemovePendingId] = useState<string | null>(null);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);

  const usedImageIds = useMemo(
    () => new Set(bundle.items.map((entry) => entry.item.world_image_id)),
    [bundle.items]
  );

  const pickerItems = useMemo(
    () =>
      worldImagesToPickerItemsGeneral(galleryImages, slotMap, usedImageIds),
    [galleryImages, slotMap, usedImageIds]
  );

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.set("image", file);

    setError(null);
    startTransition(async () => {
      const result = await uploadMoodboardImage(worldId, formData);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  }

  function handleAddFromGallery(imageId: string) {
    setError(null);
    startTransition(async () => {
      const result = await addMoodboardImageFromGallery(worldId, imageId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setPickerOpen(false);
      router.refresh();
    });
  }

  function confirmRemove() {
    if (!itemToRemove) return;
    setRemovePendingId(itemToRemove);
    startTransition(async () => {
      await removeMoodboardItem(itemToRemove, worldId);
      setRemovePendingId(null);
      setItemToRemove(null);
      router.refresh();
    });
  }

  return (
    <>
      <section id="world-moodboard" className="mb-10 scroll-mt-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
              Moodboard
            </h2>
            <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
              Capture tone and atmosphere — upload or pull from your world gallery.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleUpload}
              disabled={pending}
              className="hidden"
              id={`world-moodboard-upload-${worldId}`}
            />
            <label
              htmlFor={`world-moodboard-upload-${worldId}`}
              className={`inline-flex cursor-pointer ${studioBtnSecondary} ${
                pending ? "pointer-events-none opacity-60" : ""
              }`}
            >
              Upload image
            </label>
            {pickerItems.length > 0 && (
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className={studioBtnSecondary}
              >
                From gallery
              </button>
            )}
          </div>
        </div>

        {error && (
          <p className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-[var(--status-danger-text)]">
            {error}
          </p>
        )}

        {bundle.items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 py-10 text-center">
            <p className="text-sm text-[var(--brand-text-secondary)]">No moodboard images yet.</p>
            <p className="mt-2 text-xs text-[var(--brand-text-secondary)]">
              Add reference images that capture how this world should feel.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {bundle.items.map(({ item, imageUrl }) => (
              <div
                key={item.id}
                className="group relative aspect-square overflow-hidden rounded-xl border border-[var(--brand-border)] bg-[var(--studio-empty-fill)]"
              >
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={item.caption ?? ""}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-[var(--brand-text-secondary)]">
                    Missing image
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setItemToRemove(item.id)}
                  disabled={removePendingId === item.id}
                  className="absolute right-2 top-2 rounded-md bg-black/60 px-2 py-1 text-[10px] text-[var(--brand-text-secondary)] opacity-0 transition group-hover:opacity-100 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <ImagePickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Add to moodboard"
        subtitle="Choose an image from your world gallery."
        items={pickerItems}
        onConfirm={handleAddFromGallery}
        pending={pending}
        showPriorityHint={false}
        emptyMessage="Upload images to your world gallery first."
      />

      <ConfirmDialog
        open={itemToRemove !== null}
        title="Remove from moodboard"
        description="Remove this image from the moodboard? It stays in your world gallery."
        confirmLabel="Remove"
        pending={removePendingId === itemToRemove}
        onConfirm={confirmRemove}
        onCancel={() => {
          if (removePendingId === null) {
            setItemToRemove(null);
          }
        }}
      />
    </>
  );
}
