"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createWorldLocation,
  deleteWorldLocation,
} from "@/app/actions/world-locations";
import { FormModalShell } from "@/components/dashboard/FormModalShell";
import {
  LOCATION_TYPE_LABELS,
  LOCATION_TYPES,
  type LocationType,
} from "@/lib/location-types";
import type { WorldLocationWithCover } from "@/types/world-location";

type WorldLocationsSectionProps = {
  worldId: string;
  locations: WorldLocationWithCover[];
};

function AddLocationModal({ worldId }: { worldId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [locationType, setLocationType] = useState<LocationType>("forest");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reset() {
    setName("");
    setLocationType("forest");
    setDescription("");
    setError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createWorldLocation({
        worldId,
        name,
        locationType,
        description,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      reset();
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          reset();
          setOpen(true);
        }}
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3.5 py-1.5 text-sm font-medium text-[var(--brand-text-secondary)] transition hover:border-neutral-300 hover:bg-[var(--brand-surface-elevated)]"
      >
        Add location
      </button>

      {open && (
        <FormModalShell
          title="Add location"
          subtitle="Name a place in this world"
          onClose={() => setOpen(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-[var(--status-danger-text)]">
                {error}
              </p>
            )}

            <div>
              <label
                htmlFor="loc-name"
                className="mb-1.5 block text-xs font-medium text-[var(--brand-text-secondary)]"
              >
                Name
              </label>
              <input
                id="loc-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={120}
                placeholder="The Whispering Forest"
                className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-sm text-[var(--brand-text-secondary)] outline-none placeholder:text-[var(--brand-text-secondary)] focus:border-violet-500/50"
              />
            </div>

            <div>
              <label
                htmlFor="loc-type"
                className="mb-1.5 block text-xs font-medium text-[var(--brand-text-secondary)]"
              >
                Type
              </label>
              <select
                id="loc-type"
                value={locationType}
                onChange={(e) =>
                  setLocationType(e.target.value as LocationType)
                }
                className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-sm text-[var(--brand-text-secondary)] outline-none focus:border-violet-500/50"
              >
                {LOCATION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {LOCATION_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="loc-desc"
                className="mb-1.5 block text-xs font-medium text-[var(--brand-text-secondary)]"
              >
                Description (optional)
              </label>
              <textarea
                id="loc-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={1000}
                className="w-full resize-y rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-sm text-[var(--brand-text-secondary)] outline-none placeholder:text-[var(--brand-text-secondary)] focus:border-violet-500/50"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-gradient-to-r bg-[var(--brand-accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-500/15 transition hover:bg-[var(--brand-accent-hover)] disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save location"}
            </button>
          </form>
        </FormModalShell>
      )}
    </>
  );
}

export function WorldLocationsSection({
  worldId,
  locations,
}: WorldLocationsSectionProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleDelete(locationId: string) {
    setPendingId(locationId);
    startTransition(async () => {
      await deleteWorldLocation(locationId, worldId);
      setPendingId(null);
      router.refresh();
    });
  }

  return (
    <section id="world-locations" className="mb-10 scroll-mt-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
            Locations
          </h2>
          <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
            Named places in this world — forest, village, castle, and more.
          </p>
        </div>
        <AddLocationModal worldId={worldId} />
      </div>

      {locations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 py-8 text-center">
          <p className="text-sm text-[var(--brand-text-secondary)]">No locations yet.</p>
          <p className="mt-2 text-xs text-[var(--brand-text-secondary)]">
            Forest · Village · Castle · Mountain · City · Ruins
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {locations.map(({ location, coverUrl }) => (
            <article
              key={location.id}
              className="overflow-hidden rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)]"
            >
              <div className="relative aspect-[4/3] bg-[var(--studio-empty-fill)]">
                {coverUrl ? (
                  <Image
                    src={coverUrl}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-[var(--brand-text-secondary)]">
                    No image
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--brand-text-secondary)]">
                      {location.name}
                    </p>
                    <p className="text-xs text-neutral-600/70">
                      {LOCATION_TYPE_LABELS[location.location_type]}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(location.id)}
                    disabled={pendingId === location.id}
                    className="shrink-0 text-xs text-[var(--brand-text-secondary)] hover:text-[var(--status-danger-text)] disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
                {location.description && (
                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-[var(--brand-text-secondary)]">
                    {location.description}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
