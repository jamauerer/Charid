import Image from "next/image";
import Link from "next/link";
import type { WorldMoodboardBundle } from "@/types/world-moodboard";

type StoryMoodboardStripProps = {
  worldId: string;
  moodboardBundle: WorldMoodboardBundle | null;
};

export function StoryMoodboardStrip({
  worldId,
  moodboardBundle,
}: StoryMoodboardStripProps) {
  const worldEditHref = `/dashboard/worlds/${worldId}#world-moodboard`;
  const items = moodboardBundle?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 py-8 text-center">
        <p className="text-sm text-[var(--brand-text-secondary)]">No moodboard images yet.</p>
        <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
          Add reference images on the world page to capture tone at a glance.
        </p>
        <Link
          href={worldEditHref}
          className="mt-3 inline-block text-xs font-medium text-neutral-500 transition hover:text-neutral-600"
        >
          Add mood images on world →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
          Moodboard
        </h3>
        <Link
          href={worldEditHref}
          className="text-xs text-[var(--brand-text-secondary)] transition hover:text-[var(--brand-text-secondary)]"
        >
          Edit on world →
        </Link>
      </div>
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
        {items.map(({ item, imageUrl }) => (
          <Link
            key={item.id}
            href={worldEditHref}
            className="relative h-28 w-40 shrink-0 overflow-hidden rounded-lg border border-[var(--brand-border)] bg-[var(--studio-empty-fill)] transition hover:border-neutral-300 sm:h-32 sm:w-48"
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={item.caption ?? "Mood reference"}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-[var(--brand-text-secondary)]">
                Missing image
              </div>
            )}
            {item.caption && (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 py-1.5 text-[10px] text-[var(--brand-text-secondary)]">
                {item.caption}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
