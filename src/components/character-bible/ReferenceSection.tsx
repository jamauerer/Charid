"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BibleSectionGuide } from "@/components/character-bible/BibleSectionGuide";
import { ReferenceAssetCard } from "@/components/character-bible/ReferenceAssetCard";
import { ReferenceSlotCard } from "@/components/character-bible/ReferenceSlotCard";
import { assignableRolesForArchetype } from "@/lib/assignable-image-roles";
import {
  buildSlotAssignmentMap,
  galleryImages,
  imageForSlot,
} from "@/lib/character-slot-assignments";
import {
  deleteCharacterImage,
  uploadCharacterImage,
} from "@/app/actions/character-images";
import type { CharacterImageWithUrl } from "@/types/character-image";
import type { CharacterImageSlotAssignment } from "@/types/character-image-slot";
import type { IdentityArchetype } from "@/types/identity-archetype";

type ReferenceSectionProps = {
  characterId: string;
  images: CharacterImageWithUrl[];
  slotAssignments: CharacterImageSlotAssignment[];
  identityArchetype: IdentityArchetype;
};

export function ReferenceSection({
  characterId,
  images: initialImages,
  slotAssignments: initialAssignments,
  identityArchetype,
}: ReferenceSectionProps) {
  const [images, setImages] = useState(initialImages);
  const router = useRouter();

  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  const slotMap = useMemo(
    () => buildSlotAssignmentMap(images, initialAssignments),
    [images, initialAssignments]
  );

  const assignableRoles = useMemo(
    () => assignableRolesForArchetype(identityArchetype),
    [identityArchetype]
  );

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const canonical = imageForSlot("canonical", images, slotMap);
  const canonicalAssignment = slotMap.canonical;
  const references = galleryImages(images);

  async function handleReferenceUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.set("image", file);
    await uploadCharacterImage(characterId, formData);
    refresh();
    e.target.value = "";
  }

  async function handleDelete(imageId: string) {
    if (
      !confirm(
        "Remove this asset? Role assignments using it will also clear."
      )
    ) {
      return;
    }
    await deleteCharacterImage(imageId);
    refresh();
  }

  return (
    <div className="space-y-6">
      <BibleSectionGuide
        title="Reference assets"
        why="Upload images first, then assign roles. CharID never assumes a front view — you decide which image plays each role from whatever you already have."
        consistency="Images → assign roles, not roles → upload images. One asset can be Main portrait and Right view at the same time."
        creativeImpact="Every gallery image strengthens your reference library. Assigned roles show what's complete at a glance."
      />

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Your images
        </h3>
        <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">
          Upload artwork, portraits, or imports. Use{" "}
          <strong className="font-medium text-[var(--brand-text-secondary)]">Assign Role</strong> on
          any asset to map it to portrait, turnaround, or expression roles.
        </p>

        <div className="mt-4" data-bible-target="reference-upload">
          <label className="text-xs font-medium text-[var(--brand-text-secondary)]">
            Upload image
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleReferenceUpload}
            className="mt-2 w-full text-sm text-[var(--brand-text-secondary)] file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-violet-600/20 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-neutral-600"
          />
        </div>

        {references.length === 0 ? (
          <p className="mt-4 text-sm italic text-[var(--brand-text-secondary)]">
            No images yet. Upload above — nothing is assumed to be a specific
            angle.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {references.map((image) => (
              <ReferenceAssetCard
                key={image.id}
                characterId={characterId}
                image={image}
                slotMap={slotMap}
                assignableRoles={assignableRoles}
                onDelete={handleDelete}
                onUpdated={refresh}
              />
            ))}
          </ul>
        )}
      </section>

      <section className="border-t border-[var(--brand-border)] pt-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Main portrait
        </h3>
        <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">
          Optional portfolio anchor. Assign from your gallery or upload when
          ready.
        </p>
        <div className="mt-4" data-bible-target="slot-canonical">
          <ReferenceSlotCard
            characterId={characterId}
            slotRole="canonical"
            image={canonical}
            assignmentSource={canonicalAssignment?.source ?? null}
            galleryImages={images}
            slotMap={slotMap}
            onUpdated={refresh}
          />
        </div>
      </section>
    </div>
  );
}
