"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import {
  addMapLocationPin,
  deleteMapLocationPin,
  uploadWorldMapImage,
} from "@/app/actions/world-maps";
import type { MapLocationPin, WorldMapBundle } from "@/types/world-map";
import type { WorldLocationWithCover } from "@/types/world-location";

type WorldMapSectionProps = {
  worldId: string;
  bundle: WorldMapBundle;
  locations: WorldLocationWithCover[];
  galleryImageOptions: { id: string; url: string | null; caption: string | null }[];
};

export function WorldMapSection({
  worldId,
  bundle,
  locations,
  galleryImageOptions,
}: WorldMapSectionProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pinMode, setPinMode] = useState(false);
  const [pinLabel, setPinLabel] = useState("");
  const [pinLocationId, setPinLocationId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [pinPendingId, setPinPendingId] = useState<string | null>(null);

  const { map, imageUrl, pins } = bundle;

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.set("image", file);

    setError(null);
    startTransition(async () => {
      const result = await uploadWorldMapImage(worldId, formData);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  }

  function handleMapClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!pinMode || !imageUrl) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pinX = Math.round(((e.clientX - rect.left) / rect.width) * 10000) / 100;
    const pinY = Math.round(((e.clientY - rect.top) / rect.height) * 10000) / 100;
    const label =
      pinLabel.trim() ||
      locations.find((l) => l.location.id === pinLocationId)?.location.name ||
      "Pin";

    setError(null);
    startTransition(async () => {
      const result = await addMapLocationPin({
        worldId,
        mapId: map.id,
        label,
        pinX,
        pinY,
        locationId: pinLocationId || null,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      setPinMode(false);
      setPinLabel("");
      setPinLocationId("");
      router.refresh();
    });
  }

  function handleDeletePin(pinId: string) {
    setPinPendingId(pinId);
    startTransition(async () => {
      await deleteMapLocationPin(pinId, worldId);
      setPinPendingId(null);
      router.refresh();
    });
  }

  return (
    <section id="world-map" className="mb-10 scroll-mt-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
            World Map
          </h2>
          <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
            Optional — upload a map and pin named locations.
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
            id={`world-map-upload-${worldId}`}
          />
          <label
            htmlFor={`world-map-upload-${worldId}`}
            className={`inline-flex cursor-pointer rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3.5 py-1.5 text-sm font-medium text-[var(--brand-text-secondary)] transition hover:border-neutral-300 hover:bg-[var(--brand-surface-elevated)] ${
              pending ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {pending ? "Uploading…" : imageUrl ? "Replace map" : "Upload map"}
          </label>
          {imageUrl && (
            <button
              type="button"
              onClick={() => setPinMode((v) => !v)}
              className={`rounded-lg border px-3.5 py-1.5 text-sm font-medium transition ${
                pinMode
                  ? "border-[var(--brand-accent)] bg-[var(--tag-primary-bg)] text-[var(--tag-primary-text)]"
                  : "border-[var(--brand-border)] bg-[var(--brand-surface)] text-[var(--brand-text-secondary)] hover:border-neutral-300"
              }`}
            >
              {pinMode ? "Click map to place pin" : "Add pin"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-[var(--status-danger-text)]">
          {error}
        </p>
      )}

      {pinMode && imageUrl && (
        <div className="mb-3 flex flex-wrap items-end gap-3 rounded-lg border border-[var(--brand-border)] bg-[var(--tag-primary-bg)] p-3">
          <div className="min-w-[140px] flex-1">
            <label className="mb-1 block text-xs text-[var(--brand-text-secondary)]">Pin label</label>
            <input
              type="text"
              value={pinLabel}
              onChange={(e) => setPinLabel(e.target.value)}
              placeholder="Forest gate"
              className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-1.5 text-sm text-[var(--brand-text-secondary)] outline-none focus:border-[var(--brand-accent)]"
            />
          </div>
          {locations.length > 0 && (
            <div className="min-w-[140px] flex-1">
              <label className="mb-1 block text-xs text-[var(--brand-text-secondary)]">
                Link location (optional)
              </label>
              <select
                value={pinLocationId}
                onChange={(e) => setPinLocationId(e.target.value)}
                className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-1.5 text-sm text-[var(--brand-text-secondary)] outline-none focus:border-[var(--brand-accent)]"
              >
                <option value="">None</option>
                {locations.map(({ location }) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            type="button"
            onClick={() => setPinMode(false)}
            className="text-xs text-[var(--brand-text-secondary)] hover:text-[var(--brand-text-secondary)]"
          >
            Cancel
          </button>
        </div>
      )}

      {!imageUrl ? (
        <div className="rounded-xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 py-10 text-center">
          <p className="text-sm text-[var(--brand-text-secondary)]">No map yet.</p>
          <p className="mt-2 text-xs text-[var(--brand-text-secondary)]">
            Upload a map image, or assign one from the gallery above.
          </p>
          {galleryImageOptions.length > 0 && (
            <p className="mt-2 text-xs text-[var(--brand-text-secondary)]">
              {galleryImageOptions.length} gallery image
              {galleryImageOptions.length === 1 ? "" : "s"} available to assign
              via the Map slot in World Gallery.
            </p>
          )}
        </div>
      ) : (
        <>
          <div
            className={`relative overflow-hidden rounded-xl border border-[var(--brand-border)] bg-[var(--studio-empty-fill)] ${
              pinMode ? "cursor-crosshair ring-2 ring-[var(--brand-accent)]" : ""
            }`}
            onClick={handleMapClick}
            role={pinMode ? "button" : undefined}
            tabIndex={pinMode ? 0 : undefined}
            onKeyDown={(e) => {
              if (pinMode && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
              }
            }}
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
          </div>

          {pins.length > 0 && (
            <ul className="mt-3 space-y-1">
              {pins.map((pin) => (
                <li
                  key={pin.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-sm"
                >
                  <span className="text-[var(--brand-text-secondary)]">
                    {pin.label}
                    <span className="ml-2 text-xs text-[var(--brand-text-secondary)]">
                      ({pin.pin_x}%, {pin.pin_y}%)
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeletePin(pin.id)}
                    disabled={pinPendingId === pin.id}
                    className="text-xs text-[var(--brand-text-secondary)] hover:text-[var(--status-danger-text)] disabled:opacity-50"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

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
