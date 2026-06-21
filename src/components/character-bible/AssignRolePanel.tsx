"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  assignImageToSlot,
  removeImageFromSlot,
} from "@/app/actions/character-images";
import { labelForAssetRole } from "@/lib/asset-role-labels";
import type { AssignableImageRole } from "@/lib/assignable-image-roles";
import type { SlotAssignmentMap } from "@/lib/character-slot-assignments";
import { slotAssignmentsForImage } from "@/lib/character-slot-assignments";
import { ASSET_SOURCE_LABELS } from "@/types/character-image-slot";
import type { CharacterImageWithUrl } from "@/types/character-image";

type AssignRolePanelProps = {
  characterId: string;
  image: CharacterImageWithUrl;
  slotMap: SlotAssignmentMap;
  assignableRoles: AssignableImageRole[];
  onUpdated: () => void;
  onClose: () => void;
};

export function AssignRolePanel({
  characterId,
  image,
  slotMap,
  assignableRoles,
  onUpdated,
  onClose,
}: AssignRolePanelProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const assignedSlots = slotAssignmentsForImage(image.id, slotMap);

  function isRoleChecked(role: string): boolean {
    return assignedSlots.some((slot) => slot.slot_role === role);
  }

  function roleSource(role: string) {
    return assignedSlots.find((slot) => slot.slot_role === role)?.source ?? null;
  }

  function handleToggle(role: AssignableImageRole, checked: boolean) {
    startTransition(async () => {
      const result = checked
        ? await assignImageToSlot(characterId, image.id, role, "assigned")
        : await removeImageFromSlot(characterId, image.id, role);

      if (!result.error) {
        onUpdated();
        router.refresh();
      }
    });
  }

  return (
    <div className="rounded-md border border-[var(--brand-border)] bg-[var(--tag-primary-bg)] p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-[var(--tag-primary-text)]">Assign roles</p>
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
            className="rounded border-white/20 bg-[var(--studio-empty-fill)] text-[var(--brand-accent)]"
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
                className="rounded border-white/20 bg-[var(--studio-empty-fill)] text-[var(--brand-accent)] disabled:opacity-60"
              />
              <label
                htmlFor={`${image.id}-${role}`}
                className="flex flex-1 cursor-pointer items-center justify-between gap-2 text-xs text-[var(--brand-text-secondary)]"
              >
                <span>{labelForAssetRole(role)}</span>
                {checked && source && (
                  <span className="text-[10px] text-[var(--brand-text-secondary)]">
                    {ASSET_SOURCE_LABELS[source]}
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
