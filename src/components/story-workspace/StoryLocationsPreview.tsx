import Image from "next/image";
import Link from "next/link";
import { LOCATION_TYPE_LABELS } from "@/lib/location-types";
import type { WorldLocationWithCover } from "@/types/world-location";

type StoryLocationsPreviewProps = {
  worldId: string;
  locations: WorldLocationWithCover[];
};

export function StoryLocationsPreview({
  worldId,
  locations,
}: StoryLocationsPreviewProps) {
  const worldEditHref = `/dashboard/worlds/${worldId}#world-locations`;

  if (locations.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 py-8 text-center">
        <p className="text-sm text-[var(--brand-text-secondary)]">No places yet.</p>
        <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
          Add locations on the world page to see where this story happens.
        </p>
        <Link
          href={worldEditHref}
          className="mt-3 inline-block text-xs font-medium text-neutral-500 transition hover:text-neutral-600"
        >
          Add locations on world →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
          Locations
        </h3>
        <Link
          href={worldEditHref}
          className="text-xs text-[var(--brand-text-secondary)] transition hover:text-[var(--brand-text-secondary)]"
        >
          Edit on world →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map(({ location, coverUrl }) => (
          <div
            key={location.id}
            className="overflow-hidden rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)]"
          >
            <div className="relative aspect-[16/10] bg-[var(--studio-empty-fill)]">
              {coverUrl ? (
                <Image
                  src={coverUrl}
                  alt={location.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-[var(--brand-text-secondary)]">
                  No cover
                </div>
              )}
            </div>
            <div className="px-3 py-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-[var(--brand-text-secondary)]">
                  {location.name}
                </span>
                <span className="rounded-full border border-[var(--brand-border)] bg-[var(--brand-surface)] px-2 py-0.5 text-[10px] text-[var(--brand-text-secondary)]">
                  {LOCATION_TYPE_LABELS[location.location_type]}
                </span>
              </div>
              {location.description ? (
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--brand-text-secondary)]">
                  {location.description}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
