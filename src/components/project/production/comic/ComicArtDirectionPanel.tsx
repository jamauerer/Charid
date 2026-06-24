"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { upsertComicArtDirection } from "@/app/actions/production/comic";
import { PROJECT_SECTION_IDS } from "@/lib/project-tabs";
import { studioBtnPrimarySm } from "@/lib/visual-identity";
import {
  COMIC_ART_STYLE_PRESETS,
  type ComicArtDirection,
} from "@/types/production/comic";
import type { WorldMoodboardBundle } from "@/types/world-moodboard";

type ComicArtDirectionPanelProps = {
  projectId: string;
  artDirection: ComicArtDirection | null;
  moodboardBundle: WorldMoodboardBundle | null;
  primaryWorldId: string | null;
  styleReferenceCount: number;
};

export function ComicArtDirectionPanel({
  projectId,
  artDirection,
  moodboardBundle,
  primaryWorldId,
  styleReferenceCount,
}: ComicArtDirectionPanelProps) {
  const router = useRouter();
  const [artStyle, setArtStyle] = useState(artDirection?.art_style ?? "");
  const [notes, setNotes] = useState(artDirection?.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const moodItems = moodboardBundle?.items ?? [];

  function handleSave() {
    startTransition(async () => {
      setError(null);
      setSaved(false);
      const result = await upsertComicArtDirection(projectId, {
        art_style: artStyle,
        notes,
      });
      if (result.error) {
        setError(result.error);
      } else {
        setSaved(true);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
          Art direction
        </h3>
        <p className="mt-1 text-xs text-[var(--brand-text-muted)]">
          Informational only for MVP — this becomes the foundation for future
          panel generation and character consistency.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-muted)]">
              Art style
            </label>
            <div className="flex flex-wrap gap-2">
              {COMIC_ART_STYLE_PRESETS.map((preset) => {
                const isActive =
                  preset === "Custom"
                    ? artStyle === "Custom" ||
                      (artStyle.length > 0 &&
                        !COMIC_ART_STYLE_PRESETS.slice(0, -1).includes(
                          artStyle as (typeof COMIC_ART_STYLE_PRESETS)[number]
                        ))
                    : artStyle === preset;

                return (
                <button
                  key={preset}
                  type="button"
                  onClick={() =>
                    setArtStyle(preset === "Custom" ? "Custom" : preset)
                  }
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    isActive
                      ? "border-[var(--brand-accent)] bg-[var(--tag-primary-bg)] text-[var(--foreground)]"
                      : "border-[var(--brand-border)] text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-elevated)]"
                  }`}
                >
                  {preset}
                </button>
              );
              })}
            </div>
            <input
              type="text"
              value={artStyle}
              onChange={(event) => setArtStyle(event.target.value)}
              placeholder="e.g. Manga, Western Comic, or your custom style"
              className="mt-3 w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] px-3 py-2 text-sm text-[var(--foreground)]"
            />
          </div>

          <div>
            <label
              htmlFor="comic-art-notes"
              className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-muted)]"
            >
              Notes
            </label>
            <textarea
              id="comic-art-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              placeholder="Visual direction, tone, influences…"
              className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] px-3 py-2 text-sm text-[var(--foreground)]"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] px-3 py-2 text-sm text-[var(--status-danger-text)]">
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={pending}
              className={studioBtnPrimarySm}
            >
              Save art direction
            </button>
            {saved && (
              <span className="text-xs text-[var(--brand-text-muted)]">Saved</span>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
          Reference images
        </h3>
        <p className="mt-1 text-xs text-[var(--brand-text-muted)]">
          Reuses your project Style References — no separate upload system.
          Manage images in Assets.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          {moodItems.slice(0, 6).map(({ item, imageUrl }) => (
            <div
              key={item.id}
              className="relative h-24 w-24 overflow-hidden rounded-lg border border-[var(--brand-border)] bg-[var(--studio-empty-fill)]"
            >
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={item.caption ?? "Style reference"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : null}
            </div>
          ))}
          {moodItems.length === 0 && (
            <div className="flex h-24 w-full items-center justify-center rounded-lg border border-dashed border-[var(--brand-border)] text-xs text-[var(--brand-text-muted)]">
              No reference images yet
            </div>
          )}
        </div>

        <p className="mt-3 text-xs text-[var(--brand-text-muted)]">
          {styleReferenceCount} style reference{styleReferenceCount === 1 ? "" : "s"}{" "}
          in this project
        </p>

        <Link
          href={`#${PROJECT_SECTION_IDS.assets}`}
          className="mt-2 inline-block text-xs font-medium text-[var(--brand-text-secondary)] hover:text-[var(--foreground)]"
        >
          Manage reference images in Assets →
        </Link>

        {primaryWorldId && moodItems.length > 0 && (
          <Link
            href={`/dashboard/worlds/${primaryWorldId}#world-moodboard`}
            className="ml-3 inline-block text-xs font-medium text-[var(--brand-text-secondary)] hover:text-[var(--foreground)]"
          >
            Open setting moodboard →
          </Link>
        )}
      </div>
    </div>
  );
}
