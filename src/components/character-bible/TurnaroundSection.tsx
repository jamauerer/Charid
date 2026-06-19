"use client";

import { useMemo } from "react";
import { BibleSectionGuide } from "@/components/character-bible/BibleSectionGuide";
import { ReferenceSlotCard } from "@/components/character-bible/ReferenceSlotCard";
import { TURNAROUND_SLOT_HINTS } from "@/lib/asset-role-labels";
import {
  buildSlotAssignmentMap,
  imageForSlot,
} from "@/lib/character-slot-assignments";
import { TURNAROUND_ROLES } from "@/types/character-image";
import { CREATURE_ARCHETYPES } from "@/types/identity-archetype";
import type { CharacterImageWithUrl } from "@/types/character-image";
import type { CharacterImageSlotAssignment } from "@/types/character-image-slot";
import type { IdentityArchetype } from "@/types/identity-archetype";

type TurnaroundSectionProps = {
  characterId: string;
  images: CharacterImageWithUrl[];
  slotAssignments: CharacterImageSlotAssignment[];
  identityArchetype: IdentityArchetype;
  onUpdated: () => void;
};

export function TurnaroundSection({
  characterId,
  images,
  slotAssignments,
  identityArchetype,
  onUpdated,
}: TurnaroundSectionProps) {
  const slotMap = useMemo(
    () => buildSlotAssignmentMap(images, slotAssignments),
    [images, slotAssignments]
  );
  const isCreature = CREATURE_ARCHETYPES.includes(identityArchetype);

  if (isCreature) {
    return (
      <div className="space-y-6">
        <BibleSectionGuide
          title="Turnaround"
          why="Multi-view turnarounds help keep characters on-model from new angles. For creatures, full-body reference images in the Reference section often work better than human-style turnarounds."
          consistency="Use 2+ full-body reference images from different angles to establish your creature's proportions and silhouette."
          creativeImpact="For creatures, full-body gallery images count more than formal turnaround views — focus on strong refs first."
        />
        <p className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4 text-sm text-[var(--brand-text-secondary)]">
          Turnaround slots are optional for creature archetypes. Add full-body
          reference images in the{" "}
          <strong className="font-medium text-[var(--brand-text-secondary)]">Reference</strong>{" "}
          section instead.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BibleSectionGuide
        title="Turnaround"
        why="Fill turnaround slots in any order. Start with a side profile, 3/4 view, or whatever angle you already have — assign existing gallery images instead of re-uploading."
        consistency="One image can serve multiple purposes when appropriate. You define what each upload represents — CharID never assumes a front view."
        creativeImpact="Each filled turnaround view strengthens visual consistency across angles."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {TURNAROUND_ROLES.map((role) => (
          <div key={role} data-bible-target={`slot-${role}`}>
            <ReferenceSlotCard
              characterId={characterId}
              slotRole={role}
              hint={TURNAROUND_SLOT_HINTS[role]}
              image={imageForSlot(role, images, slotMap)}
              assignmentSource={slotMap[role]?.source ?? null}
              galleryImages={images}
              slotMap={slotMap}
              onUpdated={onUpdated}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
