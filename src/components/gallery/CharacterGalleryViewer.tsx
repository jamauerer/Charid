"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { CharacterImageWithUrl } from "@/types/character-image";

type CharacterGalleryViewerProps = {
  images: CharacterImageWithUrl[];
  featuredImageId?: string | null;
  characterName: string;
  fallbackPhotoUrl?: string | null;
};

export function CharacterGalleryViewer({
  images,
  featuredImageId,
  characterName,
  fallbackPhotoUrl,
}: CharacterGalleryViewerProps) {
  const galleryImages = useMemo(() => {
    if (images.length > 0) return images;
    if (fallbackPhotoUrl) {
      return [
        {
          id: "fallback",
          character_id: "",
          image_path: "",
          caption: null,
          asset_role: "canonical",
          asset_role_label: null,
          sort_order: 0,
          created_at: "",
          url: fallbackPhotoUrl,
        } satisfies CharacterImageWithUrl,
      ];
    }
    return [];
  }, [images, fallbackPhotoUrl]);

  const defaultIndex = useMemo(() => {
    if (featuredImageId) {
      const idx = galleryImages.findIndex((img) => img.id === featuredImageId);
      if (idx >= 0) return idx;
    }
    return 0;
  }, [galleryImages, featuredImageId]);

  const [selectedIndex, setSelectedIndex] = useState(defaultIndex);

  useEffect(() => {
    setSelectedIndex(defaultIndex);
  }, [defaultIndex, galleryImages.length]);

  if (galleryImages.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)]">
        <div className="flex aspect-[4/3] items-center justify-center text-sm text-[var(--brand-text-secondary)]">
          No images uploaded
        </div>
      </div>
    );
  }

  const active = galleryImages[selectedIndex] ?? galleryImages[0];
  const hasMultiple = galleryImages.length > 1;

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)]">
        <div className="relative aspect-[4/3] bg-[var(--studio-empty-fill)]">
          {active.url ? (
            <Image
              src={active.url}
              alt={
                active.caption
                  ? `${characterName} — ${active.caption}`
                  : characterName
              }
              fill
              className="object-contain"
              priority
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[var(--brand-text-secondary)]">
              Image unavailable
            </div>
          )}
        </div>
      </div>

      {active.caption && (
        <p className="text-center text-sm text-[var(--brand-text-secondary)]">{active.caption}</p>
      )}

      {hasMultiple && (
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          role="tablist"
          aria-label={`${characterName} gallery thumbnails`}
        >
          {galleryImages.map((image, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={image.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-label={
                  image.caption
                    ? `View ${image.caption}`
                    : `View image ${index + 1}`
                }
                onClick={() => setSelectedIndex(index)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border transition ${
                  isSelected
                    ? "border-[var(--brand-accent)] ring-2 ring-[var(--brand-accent)]"
                    : "border-[var(--brand-border)] opacity-70 hover:border-white/20 hover:opacity-100"
                }`}
              >
                {image.url ? (
                  <Image
                    src={image.url}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-[10px] text-[var(--brand-text-secondary)]">
                    —
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
