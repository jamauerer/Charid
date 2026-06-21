"use client";

import { useState } from "react";
import Image from "next/image";
import { AssignRolePanel } from "@/components/character-bible/AssignRolePanel";
import { labelForAssetRole } from "@/lib/asset-role-labels";
import type { AssignableImageRole } from "@/lib/assignable-image-roles";
import type { SlotAssignmentMap } from "@/lib/character-slot-assignments";
import { slotAssignmentsForImage } from "@/lib/character-slot-assignments";
import type { CharacterImageWithUrl } from "@/types/character-image";

type ReferenceAssetCardProps = {
  characterId: string;
  image: CharacterImageWithUrl;
  slotMap: SlotAssignmentMap;
  assignableRoles: AssignableImageRole[];
  onDelete: (imageId: string) => void;
  onUpdated: () => void;
};

export function ReferenceAssetCard({
  characterId,
  image,
  slotMap,
  assignableRoles,
  onDelete,
  onUpdated,
}: ReferenceAssetCardProps) {
  const [showRoles, setShowRoles] = useState(false);
  const slots = slotAssignmentsForImage(image.id, slotMap);

  return (
    <li className="overflow-hidden rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)]">
      <div className="relative aspect-square bg-[var(--studio-empty-fill)]">
        {image.url && (
          <Image
            src={image.url}
            alt=""
            fill
            className="object-cover"
            unoptimized
          />
        )}
      </div>
      <div className="space-y-2 p-2">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs font-medium text-[var(--brand-text-secondary)]">
            {image.caption || "Reference asset"}
          </span>
          <button
            type="button"
            onClick={() => onDelete(image.id)}
            className="shrink-0 text-xs text-red-400 hover:text-[var(--status-danger-text)]"
          >
            Delete
          </button>
        </div>

        {slots.length > 0 ? (
          <ul className="flex flex-wrap gap-1">
            {slots.map((slot) => (
              <li
                key={slot.slot_role}
                className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300"
              >
                {labelForAssetRole(slot.slot_role)}
              </li>
            ))}
            <li className="rounded bg-[var(--brand-surface)] px-1.5 py-0.5 text-[10px] text-[var(--brand-text-secondary)]">
              Reference
            </li>
          </ul>
        ) : (
          <p className="text-[10px] text-[var(--brand-text-secondary)]">Reference · No roles assigned yet</p>
        )}

        <button
          type="button"
          onClick={() => setShowRoles((open) => !open)}
          className="w-full rounded-md border border-[var(--brand-border)] bg-[var(--brand-surface)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--tag-primary-text)] transition hover:border-[var(--brand-accent)]"
        >
          {showRoles ? "Hide roles" : "Assign Role"}
        </button>

        {showRoles && (
          <AssignRolePanel
            characterId={characterId}
            image={image}
            slotMap={slotMap}
            assignableRoles={assignableRoles}
            onUpdated={onUpdated}
            onClose={() => setShowRoles(false)}
          />
        )}
      </div>
    </li>
  );
}
