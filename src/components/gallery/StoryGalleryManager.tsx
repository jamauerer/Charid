"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import {
  deleteStoryImage,
  getStoryImages,
  reorderStoryImages,
  setFeaturedStoryImage,
  updateStoryImageAssetType,
  updateStoryImageCaption,
  uploadStoryImage,
} from "@/app/actions/story-images";
import { selectClassNameCompact } from "@/components/CharacterFormFields";
import {
  STORY_ASSET_TYPES,
  STORY_ASSET_TYPE_LABELS,
  type StoryAssetType,
  type StoryImageWithUrl,
} from "@/types/story-image";

type StoryGalleryManagerProps = {
  storyId: string;
};

export function StoryGalleryManager({ storyId }: StoryGalleryManagerProps) {
  const [images, setImages] = useState<StoryImageWithUrl[]>([]);
  const [featuredImageId, setFeaturedImageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [uploadCaption, setUploadCaption] = useState("");
  const [uploadAssetType, setUploadAssetType] =
    useState<StoryAssetType>("reference");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef(images);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  const loadImages = useCallback(async () => {
    const result = await getStoryImages(storyId);
    if (result.error) {
      setError(result.error);
    } else {
      setImages(result.images);
      setFeaturedImageId(result.featuredImageId);
      setError(null);
    }
    setLoading(false);
  }, [storyId]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.set("image", file);
    if (uploadCaption.trim()) {
      formData.set("caption", uploadCaption.trim());
    }
    formData.set("asset_type", uploadAssetType);

    startTransition(async () => {
      setError(null);
      const result = await uploadStoryImage(storyId, formData);
      if (result.error) {
        setError(result.error);
      } else {
        setUploadCaption("");
        setUploadAssetType("reference");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        await loadImages();
      }
    });
  }

  function handleCaptionBlur(imageId: string, caption: string) {
    startTransition(async () => {
      const result = await updateStoryImageCaption(imageId, caption);
      if (result.error) {
        setError(result.error);
      }
    });
  }

  function handleAssetTypeChange(imageId: string, assetType: StoryAssetType) {
    startTransition(async () => {
      setError(null);
      const result = await updateStoryImageAssetType(imageId, assetType);
      if (result.error) {
        setError(result.error);
      } else {
        setImages((prev) =>
          prev.map((img) =>
            img.id === imageId ? { ...img, asset_type: assetType } : img
          )
        );
      }
    });
  }

  function handleDelete(imageId: string) {
    if (!confirm("Delete this image from the story gallery?")) return;

    startTransition(async () => {
      setError(null);
      const result = await deleteStoryImage(imageId);
      if (result.error) {
        setError(result.error);
      } else {
        await loadImages();
      }
    });
  }

  function handleSetFeatured(imageId: string) {
    startTransition(async () => {
      setError(null);
      const result = await setFeaturedStoryImage(storyId, imageId);
      if (result.error) {
        setError(result.error);
      } else {
        setFeaturedImageId(imageId);
        await loadImages();
      }
    });
  }

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    setImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      imagesRef.current = next;
      return next;
    });
    setDragIndex(index);
  }

  function handleDragEnd() {
    if (dragIndex === null) return;

    const orderedIds = imagesRef.current.map((img) => img.id);
    setDragIndex(null);

    startTransition(async () => {
      setError(null);
      const result = await reorderStoryImages(storyId, orderedIds);
      if (result.error) {
        setError(result.error);
        await loadImages();
      } else {
        await loadImages();
      }
    });
  }

  if (loading) {
    return (
      <fieldset className="space-y-3">
        <legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Reference Assets
        </legend>
        <p className="text-sm text-[var(--brand-text-secondary)]">Loading reference assets…</p>
      </fieldset>
    );
  }

  return (
    <fieldset className="space-y-4">
      <legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
        Reference Assets
      </legend>

      {images.length === 0 ? (
        <p className="text-sm text-[var(--brand-text-secondary)]">
          No reference images yet. Upload cover art, mood boards, or key scene
          references below.
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-[var(--brand-text-secondary)]">
            Drag to reorder. Set a featured image for the story cover. Asset
            types help organize story memory for future consistency tools.
          </p>
          <ul className="space-y-3">
            {images.map((image, index) => {
              const isFeatured = image.id === featuredImageId;
              const isDragging = dragIndex === index;

              return (
                <li
                  key={image.id}
                  draggable={!pending}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`rounded-lg border bg-[var(--brand-surface)] transition ${
                    isDragging
                      ? "border-[var(--brand-accent)] opacity-60"
                      : "border-[var(--brand-border)]"
                  }`}
                >
                  <div className="flex gap-3 p-3">
                    <div
                      className="flex shrink-0 cursor-grab flex-col items-center justify-center gap-1 px-1 text-[var(--brand-text-secondary)] active:cursor-grabbing"
                      aria-hidden
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4"
                      >
                        <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2Zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8Zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14Zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6Zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8Zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14Z" />
                      </svg>
                    </div>

                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-[var(--brand-border)] bg-[var(--studio-empty-fill)]">
                      {image.url ? (
                        <Image
                          src={image.url}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-xs text-[var(--brand-text-secondary)]">
                          —
                        </span>
                      )}
                      {isFeatured && (
                        <span className="absolute left-1 top-1 rounded bg-[var(--brand-accent)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-accent-foreground)]">
                          Cover
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <select
                          value={image.asset_type}
                          onChange={(e) =>
                            handleAssetTypeChange(
                              image.id,
                              e.target.value as StoryAssetType
                            )
                          }
                          disabled={pending}
                          className={selectClassNameCompact}
                        >
                          {STORY_ASSET_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {STORY_ASSET_TYPE_LABELS[type]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <input
                        type="text"
                        defaultValue={image.caption ?? ""}
                        placeholder="Caption (e.g. Opening scene, color palette)"
                        onBlur={(e) =>
                          handleCaptionBlur(image.id, e.target.value)
                        }
                        disabled={pending}
                        className="w-full rounded-md border border-[var(--brand-border)] bg-[var(--brand-surface)] px-2.5 py-1.5 text-sm text-[var(--brand-text-secondary)] placeholder:text-[var(--brand-text-secondary)] focus:border-[var(--brand-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)] disabled:opacity-60"
                      />
                      <div className="flex flex-wrap gap-2">
                        {!isFeatured && (
                          <button
                            type="button"
                            onClick={() => handleSetFeatured(image.id)}
                            disabled={pending}
                            className="rounded-md border border-[var(--brand-border)] px-2 py-1 text-xs font-medium text-neutral-600 transition hover:bg-[var(--tag-primary-bg)] disabled:opacity-60"
                          >
                            Set as Cover
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(image.id)}
                          disabled={pending}
                          className="rounded-md border border-red-500/20 px-2 py-1 text-xs font-medium text-[var(--status-danger-text)] transition hover:bg-red-500/10 disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="space-y-2 border-t border-[var(--brand-border)] pt-4">
        <p className="text-xs font-medium text-[var(--brand-text-secondary)]">Upload New Image</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleUpload}
          disabled={pending}
          className="w-full text-sm text-[var(--brand-text-secondary)] file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-[var(--tag-primary-bg)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-neutral-600 file:transition hover:file:bg-[var(--tag-primary-bg)] disabled:opacity-60"
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <select
            value={uploadAssetType}
            onChange={(e) =>
              setUploadAssetType(e.target.value as StoryAssetType)
            }
            disabled={pending}
            className={selectClassNameCompact}
          >
            {STORY_ASSET_TYPES.map((type) => (
              <option key={type} value={type}>
                {STORY_ASSET_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={uploadCaption}
            onChange={(e) => setUploadCaption(e.target.value)}
            placeholder="Optional caption"
            disabled={pending}
            className="rounded-md border border-[var(--brand-border)] bg-[var(--brand-surface)] px-2.5 py-1.5 text-sm text-[var(--brand-text-secondary)] placeholder:text-[var(--brand-text-secondary)] focus:border-[var(--brand-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)] disabled:opacity-60"
          />
        </div>
        <p className="text-xs text-[var(--brand-text-secondary)]">
          JPEG, PNG, or WebP up to 5 MB.
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-[var(--status-danger-text)]">
          {error}
        </p>
      )}
    </fieldset>
  );
}
