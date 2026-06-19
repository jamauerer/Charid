"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { WorldReferenceSlotCard } from "@/components/world-bible/WorldReferenceSlotCard";
import { WORLD_CORE_SLOT_HINTS } from "@/lib/world-asset-role-labels";
import {
  buildWorldSlotAssignmentMap,
  worldImageForSlot,
} from "@/lib/world-slot-assignments";
import type { WorldImageWithUrl } from "@/types/world-image";
import type { WorldImageSlotAssignment } from "@/types/world-image-slot";

const GALLERY_GROUPS = [
  {
    title: "Map & mood",
    roles: ["canonical_map", "mood_board"] as const,
  },
  {
    title: "Places & atmosphere",
    roles: ["location", "environment", "architecture"] as const,
  },
] as const;

type WorldGalleryProps = {
  worldId: string;
  images: WorldImageWithUrl[];
  slotAssignments: WorldImageSlotAssignment[];
};

export function WorldGallery({
  worldId,
  images,
  slotAssignments,
}: WorldGalleryProps) {
  const router = useRouter();
  const slotMap = useMemo(
    () => buildWorldSlotAssignmentMap(images, slotAssignments),
    [images, slotAssignments]
  );

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <section id="world-gallery" className="mb-10 scroll-mt-6">
      <div className="mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
          World Gallery
        </h2>
        <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
          Maps, locations, and mood — upload or assign directly from each card.
        </p>
      </div>

      {GALLERY_GROUPS.map((group) => (
        <div key={group.title} className="mb-6 last:mb-0">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            {group.title}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {group.roles.map((slotRole) => (
              <WorldReferenceSlotCard
                key={slotRole}
                worldId={worldId}
                slotRole={slotRole}
                hint={WORLD_CORE_SLOT_HINTS[slotRole]}
                image={worldImageForSlot(slotRole, images, slotMap)}
                assignmentSource={slotMap[slotRole]?.source ?? null}
                galleryImages={images}
                slotMap={slotMap}
                onUpdated={refresh}
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
