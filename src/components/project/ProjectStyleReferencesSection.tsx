"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import {
  addMoodboardImageFromGallery,
  uploadMoodboardImage,
} from "@/app/actions/world-moodboards";
import { updateProjectCover } from "@/app/actions/projects";
import { ImagePickerModal } from "@/components/image-picker/ImagePickerModal";
import { worldImagesToPickerItemsGeneral } from "@/lib/image-picker-world";
import { CREATOR_PROJECT } from "@/lib/creator-vocabulary";
import { PROJECT_SECTION_IDS } from "@/lib/project-tabs";
import type { WorldImageWithUrl } from "@/types/world-image";
import type { WorldMoodboardBundle } from "@/types/world-moodboard";
import { studioBtnSecondary, studioEmptyArt } from "@/lib/visual-identity";

type ProjectStyleReferencesSectionProps = {
  projectId: string;
  coverUrl: string | null;
  worldId: string | null;
  moodboardBundle: WorldMoodboardBundle | null;
  galleryImages: WorldImageWithUrl[];
};

function AssetActionButton({
  children,
  disabled,
  onClick,
  title,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={title}
      className={`rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-1.5 text-xs font-medium text-[var(--foreground)] transition hover:bg-[var(--brand-surface-elevated)] disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {children}
    </button>
  );
}

export function ProjectStyleReferencesSection({
  projectId,
  coverUrl,
  worldId,
  moodboardBundle,
  galleryImages,
}: ProjectStyleReferencesSectionProps) {
  const router = useRouter();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const refInputRef = useRef<HTMLInputElement>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const moodItems = moodboardBundle?.items ?? [];
  const usedImageIds = useMemo(
    () => new Set(moodItems.map((entry) => entry.item.world_image_id)),
    [moodItems]
  );

  const pickerItems = useMemo(
    () =>
      worldImagesToPickerItemsGeneral(galleryImages, {}, usedImageIds),
    [galleryImages, usedImageIds]
  );

  function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.set("cover", file);

    setError(null);
    startTransition(async () => {
      const result = await updateProjectCover(projectId, formData);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
      if (coverInputRef.current) coverInputRef.current.value = "";
    });
  }

  function handleReferenceUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !worldId) return;

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
      if (refInputRef.current) refInputRef.current.value = "";
    });
  }

  function handleChooseExisting(imageId: string) {
    if (!worldId) return;

    setError(null);
    startTransition(async () => {
      const result = await addMoodboardImageFromGallery(worldId, imageId);
      if (result.error) {
        setError(result.error);
      } else {
        setPickerOpen(false);
        router.refresh();
      }
    });
  }

  const refCount = moodItems.length;

  return (
    <section id={PROJECT_SECTION_IDS.styleReferences} className="scroll-mt-6">
      <div className="mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
          {CREATOR_PROJECT.styleReferencesTitle}
        </h2>
        <p className="mt-1 text-xs text-[var(--brand-text-muted)]">
          {CREATOR_PROJECT.styleReferencesHint}
        </p>
      </div>

      {error && (
        <p className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-[var(--status-danger-text)]">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="relative h-28 w-40 shrink-0 overflow-hidden rounded-lg border border-[var(--brand-border)] bg-[var(--studio-empty-fill)]">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt="Project cover"
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className={`${studioEmptyArt} h-full w-full`}>
              <span className="text-[10px] uppercase tracking-wide text-[var(--brand-text-muted)]">
                Cover
              </span>
            </div>
          )}
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1 text-[10px] text-white">
            Cover
          </span>
        </div>

        {moodItems.slice(0, 3).map(({ item, imageUrl }) => (
          <div
            key={item.id}
            className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg border border-[var(--brand-border)] bg-[var(--studio-empty-fill)]"
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={item.caption ?? "Style reference"}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className={`${studioEmptyArt} h-full w-full`} />
            )}
          </div>
        ))}

        {refCount === 0 && (
          <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-lg border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] text-[10px] text-[var(--brand-text-muted)]">
            Reference
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          ref={coverInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleCoverUpload}
          disabled={pending}
          className="hidden"
          id={`project-cover-upload-${projectId}`}
        />
        <label
          htmlFor={`project-cover-upload-${projectId}`}
          className={`inline-flex cursor-pointer ${studioBtnSecondary} ${
            pending ? "pointer-events-none opacity-60" : ""
          }`}
        >
          Upload
        </label>

        {worldId && (
          <>
            <input
              ref={refInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleReferenceUpload}
              disabled={pending}
              className="hidden"
              id={`project-ref-upload-${projectId}`}
            />
            <label
              htmlFor={`project-ref-upload-${projectId}`}
              className={`inline-flex cursor-pointer ${studioBtnSecondary} ${
                pending ? "pointer-events-none opacity-60" : ""
              }`}
            >
              Add reference
            </label>
            {pickerItems.length > 0 && (
              <AssetActionButton disabled={pending} onClick={() => setPickerOpen(true)}>
                Choose existing
              </AssetActionButton>
            )}
          </>
        )}

        <AssetActionButton
          disabled
          title="AI generation is not available on the project page yet"
        >
          Generate
        </AssetActionButton>
      </div>

      <p className="mt-2 text-xs text-[var(--brand-text-muted)]">
        {coverUrl ? "Cover set" : "No cover yet"}
        {refCount > 0 ? ` · ${refCount} style reference${refCount === 1 ? "" : "s"}` : " · No style references yet"}
      </p>

      {worldId && (
        <Link
          href={`/dashboard/worlds/${worldId}#world-moodboard`}
          className="mt-2 inline-block text-xs text-[var(--brand-text-muted)] transition hover:text-[var(--foreground)]"
        >
          Manage all references in setting →
        </Link>
      )}

      {worldId && (
        <ImagePickerModal
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          title="Choose a reference image"
          subtitle="From your setting gallery"
          items={pickerItems}
          onConfirm={handleChooseExisting}
          pending={pending}
          showPriorityHint={false}
        />
      )}
    </section>
  );
}
