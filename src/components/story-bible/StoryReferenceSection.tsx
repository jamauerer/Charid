"use client";

import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { StorySectionGuide } from "@/components/story-bible/StorySectionGuide";
import { StoryReferenceAssetCard } from "@/components/story-bible/StoryReferenceAssetCard";
import { assignableStoryRoles } from "@/lib/story-assignable-image-roles";
import { buildStorySlotAssignmentMap } from "@/lib/story-slot-assignments";
import {
  deleteStoryImage,
  uploadStoryImage,
} from "@/app/actions/story-images";
import type { StoryImageWithUrl } from "@/types/story-image";
import type { StoryImageSlotAssignment } from "@/types/story-image-slot";

type StoryReferenceSectionProps = {
  storyId: string;
  images: StoryImageWithUrl[];
  slotAssignments: StoryImageSlotAssignment[];
};

export function StoryReferenceSection({
  storyId,
  images,
  slotAssignments,
}: StoryReferenceSectionProps) {
  const router = useRouter();

  const slotMap = useMemo(
    () => buildStorySlotAssignmentMap(images, slotAssignments),
    [images, slotAssignments]
  );

  const assignableRoles = useMemo(() => assignableStoryRoles(), []);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  async function handleReferenceUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.set("image", file);
    formData.set("asset_type", "reference");
    await uploadStoryImage(storyId, formData);
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
    await deleteStoryImage(imageId);
    refresh();
  }

  return (
    <div className="space-y-6">
      <StorySectionGuide
        title="Assets"
        why="Upload images first, then assign roles. Your gallery is the source of truth for every visual reference."
        consistency="Images → assign roles, not roles → upload images. One asset can be Cover and Scene reference at the same time."
        creativeImpact="Every gallery image strengthens your story's visual library."
      />

      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Your images
        </h3>
        <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">
          Upload cover art, scene references, mood boards, or storyboards. Use{" "}
          <strong className="font-medium text-[var(--brand-text-secondary)]">Assign Role</strong> on
          any asset after upload.
        </p>

        <div className="mt-4" data-bible-target="story-reference-upload">
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

        {images.length === 0 ? (
          <p className="mt-4 text-sm italic text-[var(--brand-text-secondary)]">
            No images yet. Upload above — nothing is assumed to be a specific
            role.
          </p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
              <StoryReferenceAssetCard
                key={image.id}
                storyId={storyId}
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
