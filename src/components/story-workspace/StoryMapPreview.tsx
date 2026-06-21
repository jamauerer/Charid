import Image from "next/image";
import Link from "next/link";
import type { MapLocationPin, WorldMapBundle } from "@/types/world-map";

type StoryMapPreviewProps = {
  worldId: string;
  mapBundle: WorldMapBundle | null;
};

function MapPinMarker({ pin }: { pin: MapLocationPin }) {
  return (
    <div
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full"
      style={{ left: `${pin.pin_x}%`, top: `${pin.pin_y}%` }}
    >
      <div className="flex flex-col items-center">
        <span className="rounded-md bg-[var(--brand-accent)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--brand-accent-foreground)] shadow">
          {pin.label}
        </span>
        <span className="mt-0.5 h-2 w-2 rounded-full bg-[var(--brand-secondary-accent)] ring-2 ring-[var(--brand-accent)]" />
      </div>
    </div>
  );
}

export function StoryMapPreview({ worldId, mapBundle }: StoryMapPreviewProps) {
  const worldEditHref = `/dashboard/worlds/${worldId}#world-map`;

  if (!mapBundle?.imageUrl) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 py-8 text-center">
        <p className="text-sm text-[var(--brand-text-secondary)]">No map yet.</p>
        <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
          Upload a map in story setting to see geography while you write.
        </p>
        <Link
          href={worldEditHref}
          className="mt-3 inline-block text-xs font-medium text-neutral-500 transition hover:text-neutral-600"
        >
          Add map in setting →
        </Link>
      </div>
    );
  }

  const { map, imageUrl, pins } = mapBundle;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
          Map
        </h3>
        <Link
          href={worldEditHref}
          className="text-xs text-[var(--brand-text-secondary)] transition hover:text-[var(--brand-text-secondary)]"
        >
          Edit in setting →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <Link
          href={worldEditHref}
          className="group relative block overflow-hidden rounded-xl border border-[var(--brand-border)] bg-[var(--studio-empty-fill)] transition hover:border-neutral-300"
        >
          <div className="relative aspect-[16/10] w-full">
            <Image
              src={imageUrl}
              alt={map.title}
              fill
              className="object-contain"
              unoptimized
            />
            {pins.map((pin) => (
              <MapPinMarker key={pin.id} pin={pin} />
            ))}
          </div>
          <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-1 text-[10px] text-[var(--brand-text-secondary)] opacity-0 transition group-hover:opacity-100">
            Open in setting
          </span>
        </Link>

        {pins.length > 0 ? (
          <ul className="space-y-1.5 self-start">
            {pins.map((pin) => (
              <li
                key={pin.id}
                className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-sm text-[var(--brand-text-secondary)]"
              >
                {pin.label}
                <span className="ml-2 text-xs text-[var(--brand-text-secondary)]">
                  ({pin.pin_x}%, {pin.pin_y}%)
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="self-center text-xs text-[var(--brand-text-secondary)] lg:px-2">
            No pins yet — add pins on the world map.
          </p>
        )}
      </div>
    </div>
  );
}
