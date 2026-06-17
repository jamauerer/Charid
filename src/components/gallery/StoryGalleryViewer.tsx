"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  STORY_ASSET_TYPE_LABELS,
  type StoryImageWithUrl,
} from "@/types/story-image";

type StoryGalleryViewerProps = {
  images: StoryImageWithUrl[];
  featuredImageId?: string | null;
  storyTitle: string;
};

export function StoryGalleryViewer({
  images,
  featuredImageId,
  storyTitle,
}: StoryGalleryViewerProps) {
  const galleryImages = useMemo(() => images, [images]);

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
    return null;
  }

  const active = galleryImages[selectedIndex] ?? galleryImages[0];
  const hasMultiple = galleryImages.length > 1;
  const isFeatured = active.id === featuredImageId;

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0f0f11]">
        <div className="relative aspect-[16/9] bg-zinc-900">
          {active.url ? (
            <Image
              src={active.url}
              alt={
                active.caption
                  ? `${storyTitle} — ${active.caption}`
                  : storyTitle
              }
              fill
              className="object-cover"
              priority
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-600">
              Image unavailable
            </div>
          )}
          {isFeatured && (
            <span className="absolute left-3 top-3 rounded bg-violet-600/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
              Cover
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 text-center">
        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[11px] font-medium text-zinc-400">
          {STORY_ASSET_TYPE_LABELS[active.asset_type]}
        </span>
        {active.caption && (
          <p className="text-sm text-zinc-400">{active.caption}</p>
        )}
      </div>

      {hasMultiple && (
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          role="tablist"
          aria-label={`${storyTitle} reference thumbnails`}
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
                    : `View ${STORY_ASSET_TYPE_LABELS[image.asset_type]}`
                }
                onClick={() => setSelectedIndex(index)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border transition ${
                  isSelected
                    ? "border-violet-500 ring-2 ring-violet-500/40"
                    : "border-white/10 opacity-70 hover:border-white/20 hover:opacity-100"
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
                  <span className="flex h-full items-center justify-center text-[10px] text-zinc-600">
                    —
                  </span>
                )}
                {image.id === featuredImageId && (
                  <span className="absolute bottom-0 left-0 right-0 bg-violet-600/90 py-0.5 text-[8px] font-semibold uppercase text-white">
                    Cover
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
