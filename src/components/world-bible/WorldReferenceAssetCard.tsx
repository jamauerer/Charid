"use client";

import { useState } from "react";
import Image from "next/image";
import { WorldAssignRolePanel } from "@/components/world-bible/WorldAssignRolePanel";
import { labelForWorldAssetRole } from "@/lib/world-asset-role-labels";
import type { AssignableWorldImageRole } from "@/lib/world-assignable-image-roles";
import type { WorldSlotAssignmentMap } from "@/lib/world-slot-assignments";
import { worldSlotAssignmentsForImage } from "@/lib/world-slot-assignments";
import type { WorldImageWithUrl } from "@/types/world-image";

type WorldReferenceAssetCardProps = {
  worldId: string;
  image: WorldImageWithUrl;
  slotMap: WorldSlotAssignmentMap;
  assignableRoles: AssignableWorldImageRole[];
  onDelete: (imageId: string) => void;
  onUpdated: () => void;
};

export function WorldReferenceAssetCard({
  worldId,
  image,
  slotMap,
  assignableRoles,
  onDelete,
  onUpdated,
}: WorldReferenceAssetCardProps) {
  const [showRoles, setShowRoles] = useState(false);
  const slots = worldSlotAssignmentsForImage(image.id, slotMap);

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
                {labelForWorldAssetRole(slot.slot_role)}
              </li>
            ))}
            <li className="rounded bg-[var(--brand-surface)] px-1.5 py-0.5 text-[10px] text-[var(--brand-text-secondary)]">
              Reference
            </li>
          </ul>
        ) : (
          <p className="text-[10px] text-[var(--brand-text-secondary)]">
            Reference · No roles assigned yet
          </p>
        )}

        <button
          type="button"
          onClick={() => setShowRoles((open) => !open)}
          className="w-full rounded-md border border-[var(--brand-border)] bg-[var(--brand-surface)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--tag-primary-text)] transition hover:border-[var(--brand-accent)]"
        >
          {showRoles ? "Hide roles" : "Assign Role"}
        </button>

        {showRoles && (
          <WorldAssignRolePanel
            worldId={worldId}
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
