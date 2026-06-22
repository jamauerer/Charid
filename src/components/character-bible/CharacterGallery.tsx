"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ReferenceSlotCard } from "@/components/character-bible/ReferenceSlotCard";
import { assignableRolesForArchetype } from "@/lib/assignable-image-roles";
import {
  EXPRESSION_SLOT_HINTS,
  TURNAROUND_SLOT_HINTS,
} from "@/lib/asset-role-labels";
import {
  buildSlotAssignmentMap,
  galleryImages,
  imageForSlot,
} from "@/lib/character-slot-assignments";
import {
  EXPRESSION_ROLES,
  TURNAROUND_ROLES,
} from "@/types/character-image";
import type { CharacterImageWithUrl } from "@/types/character-image";
import type { CharacterImageSlotAssignment } from "@/types/character-image-slot";
import type { IdentityArchetype } from "@/types/identity-archetype";

const PORTRAIT_HINT =
  "Your main portrait — the face of this character across stories and graphic novels.";

type CharacterGalleryProps = {
  characterId: string;
  images: CharacterImageWithUrl[];
  slotAssignments: CharacterImageSlotAssignment[];
  identityArchetype: IdentityArchetype;
};

export function CharacterGallery({
  characterId,
  images,
  slotAssignments,
  identityArchetype,
}: CharacterGalleryProps) {
  const router = useRouter();
  const slotMap = useMemo(
    () => buildSlotAssignmentMap(images, slotAssignments),
    [images, slotAssignments]
  );
  const gallery = useMemo(() => galleryImages(images), [images]);
  const assignableRoles = useMemo(
    () => assignableRolesForArchetype(identityArchetype),
    [identityArchetype]
  );

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const portrait = imageForSlot("canonical", images, slotMap);
  const showTurnaround = assignableRoles.includes("turnaround_front");
  const showExpressions = assignableRoles.includes("expression_neutral");

  return (
    <section id="character-gallery" className="mb-10 scroll-mt-6">
      <div className="mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
          Character Gallery
        </h2>
        <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
          Add images for each slot — upload, assign, or generate directly here.
        </p>
      </div>

      <div className="mb-6">
        <ReferenceSlotCard
          characterId={characterId}
          slotRole="canonical"
          hint={PORTRAIT_HINT}
          image={portrait}
          assignmentSource={slotMap.canonical?.source ?? null}
          galleryImages={gallery}
          slotMap={slotMap}
          onUpdated={refresh}
        />
      </div>

      {showTurnaround && (
        <div className="mb-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Turnaround
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TURNAROUND_ROLES.map((role) => (
              <ReferenceSlotCard
                key={role}
                characterId={characterId}
                slotRole={role}
                hint={TURNAROUND_SLOT_HINTS[role]}
                image={imageForSlot(role, images, slotMap)}
                assignmentSource={slotMap[role]?.source ?? null}
                galleryImages={gallery}
                slotMap={slotMap}
                onUpdated={refresh}
                compact
              />
            ))}
          </div>
        </div>
      )}

      {showExpressions && (
        <div>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Expressions
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {EXPRESSION_ROLES.map((role) => (
              <ReferenceSlotCard
                key={role}
                characterId={characterId}
                slotRole={role}
                hint={EXPRESSION_SLOT_HINTS[role]}
                image={imageForSlot(role, images, slotMap)}
                assignmentSource={slotMap[role]?.source ?? null}
                galleryImages={gallery}
                slotMap={slotMap}
                onUpdated={refresh}
                compact
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
