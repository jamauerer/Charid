"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import {
  deleteCharacterImage,
  getCharacterImages,
  reorderCharacterImages,
  setFeaturedCharacterImage,
  updateCharacterImageCaption,
  uploadCharacterImage,
} from "@/app/actions/character-images";
import type { CharacterImageWithUrl } from "@/types/character-image";

type CharacterGalleryManagerProps = {
  characterId: string;
};

export function CharacterGalleryManager({
  characterId,
}: CharacterGalleryManagerProps) {
  const [images, setImages] = useState<CharacterImageWithUrl[]>([]);
  const [featuredImageId, setFeaturedImageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [uploadCaption, setUploadCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef(images);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  const loadImages = useCallback(async () => {
    const result = await getCharacterImages(characterId);
    if (result.error) {
      setError(result.error);
    } else {
      setImages(result.images);
      setFeaturedImageId(result.featuredImageId);
      setError(null);
    }
    setLoading(false);
  }, [characterId]);

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

    startTransition(async () => {
      setError(null);
      const result = await uploadCharacterImage(characterId, formData);
      if (result.error) {
        setError(result.error);
      } else {
        setUploadCaption("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        await loadImages();
      }
    });
  }

  function handleCaptionBlur(imageId: string, caption: string) {
    startTransition(async () => {
      const result = await updateCharacterImageCaption(imageId, caption);
      if (result.error) {
        setError(result.error);
      }
    });
  }

  function handleDelete(imageId: string) {
    if (!confirm("Delete this image from the gallery?")) return;

    startTransition(async () => {
      setError(null);
      const result = await deleteCharacterImage(imageId);
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
      const result = await setFeaturedCharacterImage(characterId, imageId);
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
      const result = await reorderCharacterImages(characterId, orderedIds);
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
        <legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-violet-400/80">
          Gallery
        </legend>
        <p className="text-sm text-zinc-500">Loading gallery…</p>
      </fieldset>
    );
  }

  return (
    <fieldset className="space-y-4">
      <legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-violet-400/80">
        Gallery
      </legend>

      {images.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No gallery images yet. Upload one below.
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-zinc-500">
            Drag to reorder. The first image is featured unless you choose
            another.
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
                  className={`rounded-lg border bg-white/[0.02] transition ${
                    isDragging
                      ? "border-violet-500/50 opacity-60"
                      : "border-white/[0.06]"
                  }`}
                >
                  <div className="flex gap-3 p-3">
                    <div
                      className="flex shrink-0 cursor-grab flex-col items-center justify-center gap-1 px-1 text-zinc-600 active:cursor-grabbing"
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

                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-white/10 bg-zinc-900">
                      {image.url ? (
                        <Image
                          src={image.url}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-xs text-zinc-600">
                          —
                        </span>
                      )}
                      {isFeatured && (
                        <span className="absolute left-1 top-1 rounded bg-violet-600 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-2">
                      <input
                        type="text"
                        defaultValue={image.caption ?? ""}
                        placeholder="Caption (e.g. Main Portrait, Full Body)"
                        onBlur={(e) =>
                          handleCaptionBlur(image.id, e.target.value)
                        }
                        disabled={pending}
                        className="w-full rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 disabled:opacity-60"
                      />
                      <div className="flex flex-wrap gap-2">
                        {!isFeatured && (
                          <button
                            type="button"
                            onClick={() => handleSetFeatured(image.id)}
                            disabled={pending}
                            className="rounded-md border border-violet-500/30 px-2 py-1 text-xs font-medium text-violet-300 transition hover:bg-violet-500/10 disabled:opacity-60"
                          >
                            Set as Featured
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(image.id)}
                          disabled={pending}
                          className="rounded-md border border-red-500/20 px-2 py-1 text-xs font-medium text-red-300 transition hover:bg-red-500/10 disabled:opacity-60"
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

      <div className="space-y-2 border-t border-white/[0.06] pt-4">
        <p className="text-xs font-medium text-zinc-400">Upload New Image</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleUpload}
          disabled={pending}
          className="w-full text-sm text-zinc-400 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-violet-600/20 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-violet-300 file:transition hover:file:bg-violet-600/30 disabled:opacity-60"
        />
        <input
          type="text"
          value={uploadCaption}
          onChange={(e) => setUploadCaption(e.target.value)}
          placeholder="Optional caption for new image"
          disabled={pending}
          className="w-full rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30 disabled:opacity-60"
        />
        <p className="text-xs text-zinc-600">
          JPEG, PNG, or WebP up to 5 MB.
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
    </fieldset>
  );
}
