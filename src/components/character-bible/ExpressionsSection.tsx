"use client";

import { useMemo } from "react";
import { BibleSectionGuide } from "@/components/character-bible/BibleSectionGuide";
import { ReferenceSlotCard } from "@/components/character-bible/ReferenceSlotCard";
import { EXPRESSION_SLOT_HINTS } from "@/lib/asset-role-labels";
import {
  buildSlotAssignmentMap,
  imageForSlot,
} from "@/lib/character-slot-assignments";
import { EXPRESSION_ROLES } from "@/types/character-image";
import { CREATURE_ARCHETYPES } from "@/types/identity-archetype";
import type { CharacterImageWithUrl } from "@/types/character-image";
import type { CharacterImageSlotAssignment } from "@/types/character-image-slot";
import type { IdentityArchetype } from "@/types/identity-archetype";

type ExpressionsSectionProps = {
  characterId: string;
  images: CharacterImageWithUrl[];
  slotAssignments: CharacterImageSlotAssignment[];
  identityArchetype: IdentityArchetype;
  onUpdated: () => void;
};

export function ExpressionsSection({
  characterId,
  images,
  slotAssignments,
  identityArchetype,
  onUpdated,
}: ExpressionsSectionProps) {
  const slotMap = useMemo(
    () => buildSlotAssignmentMap(images, slotAssignments),
    [images, slotAssignments]
  );
  const isCreature = CREATURE_ARCHETYPES.includes(identityArchetype);

  if (isCreature) {
    return (
      <div className="space-y-6">
        <BibleSectionGuide
          title="Expressions"
          why="Expression sheets help humanoid and anthro characters stay emotionally consistent. Creature characters typically express through body language captured in reference images instead."
          consistency="For creatures, mood and personality come through posture and reference gallery images rather than facial expression slots."
          creativeImpact="Expression slots aren't required for creatures — invest in a strong main portrait and reference gallery instead."
        />
        <p className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4 text-sm text-[var(--brand-text-secondary)]">
          Expression slots are not required for creature archetypes.           CharID tracks your references using your main portrait and gallery
          images.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BibleSectionGuide
        title="Expressions"
        why="Assign expression references from your gallery in any order. Upload once, then map the same image to multiple slots when it fits."
        consistency="Without expression references, faces drift under emotion — that's when characters lose consistency."
        creativeImpact="A neutral expression is the baseline. More expressions widen the emotional range your character can hit."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EXPRESSION_ROLES.map((role) => (
          <div key={role} data-bible-target={`slot-${role}`}>
            <ReferenceSlotCard
              characterId={characterId}
              slotRole={role}
              hint={EXPRESSION_SLOT_HINTS[role]}
              image={imageForSlot(role, images, slotMap)}
              assignmentSource={slotMap[role]?.source ?? null}
              galleryImages={images}
              slotMap={slotMap}
              onUpdated={onUpdated}
              compact
            />
          </div>
        ))}
      </div>
    </div>
  );
}
