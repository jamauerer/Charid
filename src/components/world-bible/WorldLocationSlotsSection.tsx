"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { WorldSectionGuide } from "@/components/world-bible/WorldSectionGuide";
import { WorldReferenceSlotCard } from "@/components/world-bible/WorldReferenceSlotCard";
import { WORLD_CORE_SLOT_HINTS } from "@/lib/world-asset-role-labels";
import { WORLD_CORE_SLOT_ROLES } from "@/types/world-image";
import {
  buildWorldSlotAssignmentMap,
  worldImageForSlot,
} from "@/lib/world-slot-assignments";
import type { WorldImageWithUrl } from "@/types/world-image";
import type { WorldImageSlotAssignment } from "@/types/world-image-slot";

type WorldLocationSlotsSectionProps = {
  worldId: string;
  images: WorldImageWithUrl[];
  slotAssignments: WorldImageSlotAssignment[];
};

export function WorldLocationSlotsSection({
  worldId,
  images,
  slotAssignments,
}: WorldLocationSlotsSectionProps) {
  const router = useRouter();

  const slotMap = useMemo(
    () => buildWorldSlotAssignmentMap(images, slotAssignments),
    [images, slotAssignments]
  );

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <div className="space-y-6">
      <WorldSectionGuide
        title="Locations & visuals"
        why="Location slots anchor geography, architecture, and atmosphere — the visual backbone of your world."
        consistency="Each slot holds one assigned image. Reuse gallery assets instead of uploading duplicates."
        creativeImpact="Filled location slots give every story and character a grounded sense of place."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {WORLD_CORE_SLOT_ROLES.map((slotRole) => {
          const image = worldImageForSlot(slotRole, images, slotMap);
          const assignment = slotMap[slotRole];
          return (
            <WorldReferenceSlotCard
              key={slotRole}
              worldId={worldId}
              slotRole={slotRole}
              hint={WORLD_CORE_SLOT_HINTS[slotRole]}
              image={image}
              assignmentSource={assignment?.source ?? null}
              galleryImages={images}
              slotMap={slotMap}
              onUpdated={refresh}
            />
          );
        })}
      </div>
    </div>
  );
}
