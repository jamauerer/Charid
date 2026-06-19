"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { WorldSectionGuide } from "@/components/world-bible/WorldSectionGuide";
import { WorldReferenceAssetCard } from "@/components/world-bible/WorldReferenceAssetCard";
import { assignableWorldRoles } from "@/lib/world-assignable-image-roles";
import {
  buildWorldSlotAssignmentMap,
  worldGalleryImages,
} from "@/lib/world-slot-assignments";
import {
  deleteWorldImage,
  uploadWorldImage,
} from "@/app/actions/world-images";
import type { WorldImageWithUrl } from "@/types/world-image";
import type { WorldImageSlotAssignment } from "@/types/world-image-slot";

type WorldReferenceSectionProps = {
  worldId: string;
  images: WorldImageWithUrl[];
  slotAssignments: WorldImageSlotAssignment[];
};

export function WorldReferenceSection({
  worldId,
  images,
  slotAssignments,
}: WorldReferenceSectionProps) {
  const router = useRouter();

  const slotMap = useMemo(
    () => buildWorldSlotAssignmentMap(images, slotAssignments),
    [images, slotAssignments]
  );

  const assignableRoles = useMemo(() => assignableWorldRoles(), []);
  const references = worldGalleryImages(images);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  async function handleReferenceUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.set("image", file);
    await uploadWorldImage(worldId, formData);
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
    await deleteWorldImage(imageId);
    refresh();
  }

  return (
    <div className="space-y-6">
      <WorldSectionGuide
        title="Reference assets"
        why="Upload images first, then assign roles. CharID never assumes a map or location shot — you decide which image plays each role."
        consistency="Images → assign roles, not roles → upload images. One asset can be Main map and Environment at the same time."
        creativeImpact="Every gallery image strengthens your reference library. Assigned roles show what's complete at a glance."
      />

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Your images
        </h3>
        <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">
          Upload maps, environments, or mood references. Use{" "}
          <strong className="font-medium text-[var(--brand-text-secondary)]">Assign Role</strong> on
          any asset to map it to location, map, or atmosphere roles.
        </p>

        <div className="mt-4" data-bible-target="world-reference-upload">
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
            role.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {references.map((image) => (
              <WorldReferenceAssetCard
                key={image.id}
                worldId={worldId}
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
    </div>
  );
}
