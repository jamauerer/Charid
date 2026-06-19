"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  assignWorldImageToSlot,
  removeWorldImageFromSlot,
} from "@/app/actions/world-images";
import { labelForWorldAssetRole } from "@/lib/world-asset-role-labels";
import type { AssignableWorldImageRole } from "@/lib/world-assignable-image-roles";
import type { WorldSlotAssignmentMap } from "@/lib/world-slot-assignments";
import { worldSlotAssignmentsForImage } from "@/lib/world-slot-assignments";
import { WORLD_ASSET_SOURCE_LABELS } from "@/types/world-image-slot";
import type { WorldImageWithUrl } from "@/types/world-image";

type WorldAssignRolePanelProps = {
  worldId: string;
  image: WorldImageWithUrl;
  slotMap: WorldSlotAssignmentMap;
  assignableRoles: AssignableWorldImageRole[];
  onUpdated: () => void;
  onClose: () => void;
};

export function WorldAssignRolePanel({
  worldId,
  image,
  slotMap,
  assignableRoles,
  onUpdated,
  onClose,
}: WorldAssignRolePanelProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const assignedSlots = worldSlotAssignmentsForImage(image.id, slotMap);

  function isRoleChecked(role: string): boolean {
    return assignedSlots.some((slot) => slot.slot_role === role);
  }

  function roleSource(role: string) {
    return assignedSlots.find((slot) => slot.slot_role === role)?.source ?? null;
  }

  function handleToggle(role: AssignableWorldImageRole, checked: boolean) {
    startTransition(async () => {
      const result = checked
        ? await assignWorldImageToSlot(worldId, image.id, role, "assigned")
        : await removeWorldImageFromSlot(worldId, image.id, role);

      if (!result.error) {
        onUpdated();
        router.refresh();
      }
    });
  }

  return (
    <div className="rounded-md border border-violet-500/20 bg-violet-500/5 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-violet-200">Assign roles</p>
        <button
          type="button"
          onClick={onClose}
          disabled={pending}
          className="text-xs text-[var(--brand-text-secondary)] hover:text-[var(--brand-text-secondary)] disabled:opacity-60"
        >
          Done
        </button>
      </div>

      <p className="mb-3 text-[10px] leading-relaxed text-[var(--brand-text-secondary)]">
        Toggle roles for this asset. One image can fill multiple slots — no
        duplicate uploads.
      </p>

      <ul className="space-y-1.5">
        <li className="flex items-center gap-2 rounded-md bg-[var(--brand-surface)] px-2 py-1.5">
          <input
            type="checkbox"
            checked
            disabled
            id={`${image.id}-reference`}
            className="rounded border-white/20 bg-[var(--studio-empty-fill)] text-violet-500"
          />
          <label
            htmlFor={`${image.id}-reference`}
            className="flex flex-1 items-center justify-between gap-2 text-xs text-[var(--brand-text-secondary)]"
          >
            <span>Reference</span>
            <span className="text-[10px] text-[var(--brand-text-secondary)]">In gallery</span>
          </label>
        </li>

        {assignableRoles.map((role) => {
          const checked = isRoleChecked(role);
          const source = roleSource(role);
          return (
            <li
              key={role}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-[var(--brand-surface)]"
            >
              <input
                type="checkbox"
                id={`${image.id}-${role}`}
                checked={checked}
                disabled={pending}
                onChange={(e) => handleToggle(role, e.target.checked)}
                className="rounded border-white/20 bg-[var(--studio-empty-fill)] text-violet-500 disabled:opacity-60"
              />
              <label
                htmlFor={`${image.id}-${role}`}
                className="flex flex-1 cursor-pointer items-center justify-between gap-2 text-xs text-[var(--brand-text-secondary)]"
              >
                <span>{labelForWorldAssetRole(role)}</span>
                {checked && source && (
                  <span className="text-[10px] text-[var(--brand-text-secondary)]">
                    {WORLD_ASSET_SOURCE_LABELS[source]}
                  </span>
                )}
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
