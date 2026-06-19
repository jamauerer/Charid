"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  saveCharacterDetailsSection,
  type CharacterBibleActionResult,
} from "@/app/actions/character-bible";
import { BibleSectionGuide } from "@/components/character-bible/BibleSectionGuide";
import { inputClassName } from "@/components/CharacterFormFields";
import type { CharacterBible } from "@/types/character-bible";

const labelClassName =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--brand-text-secondary)]";

const initialState: CharacterBibleActionResult = {};

type DetailsSectionFormProps = {
  characterId: string;
  bible: CharacterBible;
};

export function DetailsSectionForm({
  characterId,
  bible,
}: DetailsSectionFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    saveCharacterDetailsSection,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <div className="space-y-6">
      <BibleSectionGuide
        title="Details"
        why="Version details describe how your character looks right now — age, outfit, acquired scars. They pair with reference images to form the full visual picture."
        consistency="When your character's look changes (new outfit, older age), update details so references and text stay aligned."
        creativeImpact="Hair, eyes, and build pair with your images so generated work matches what you've already established."
      />

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="character_id" value={characterId} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="details-age" className={labelClassName}>
              Age
            </label>
            <input
              id="details-age"
              name="age"
              defaultValue={bible.age ?? ""}
              placeholder="e.g. 28"
              className={inputClassName}
            />
          </div>
          <div>
            <label htmlFor="details-height" className={labelClassName}>
              Height
            </label>
            <input
              id="details-height"
              name="height"
              defaultValue={bible.height ?? ""}
              placeholder="e.g. 5'10&quot;"
              className={inputClassName}
            />
          </div>
          <div>
            <label htmlFor="details-build" className={labelClassName}>
              Build
            </label>
            <input
              id="details-build"
              name="build"
              defaultValue={bible.build ?? ""}
              placeholder="e.g. Athletic, slender"
              className={inputClassName}
            />
          </div>
          <div>
            <label htmlFor="details-hair" className={labelClassName}>
              Hair
            </label>
            <input
              id="details-hair"
              name="hair"
              defaultValue={bible.hair ?? ""}
              placeholder="e.g. Spiked blue"
              className={inputClassName}
            />
          </div>
          <div>
            <label htmlFor="details-eyes" className={labelClassName}>
              Eyes
            </label>
            <input
              id="details-eyes"
              name="eyes"
              defaultValue={bible.eyes ?? ""}
              placeholder="e.g. Amber, heterochromia"
              className={inputClassName}
            />
          </div>
          <div>
            <label htmlFor="details-clothing" className={labelClassName}>
              Clothing
            </label>
            <input
              id="details-clothing"
              name="clothing"
              defaultValue={bible.clothing ?? ""}
              placeholder="Current default outfit"
              className={inputClassName}
            />
          </div>
          <div>
            <label htmlFor="details-accessories" className={labelClassName}>
              Accessories
            </label>
            <input
              id="details-accessories"
              name="accessories"
              defaultValue={bible.accessories ?? ""}
              className={inputClassName}
            />
          </div>
          <div>
            <label htmlFor="details-scars" className={labelClassName}>
              Scars / tattoos
            </label>
            <input
              id="details-scars"
              name="scars_tattoos"
              defaultValue={bible.scars_tattoos ?? ""}
              className={inputClassName}
            />
          </div>
        </div>

        <div>
          <label htmlFor="details-other" className={labelClassName}>
            Other details
          </label>
          <textarea
            id="details-other"
            name="other_details"
            rows={3}
            defaultValue={bible.other_details ?? ""}
            placeholder="Anything else about their current look"
            className={inputClassName}
          />
        </div>

        {state.error && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-[var(--status-danger-text)]">
            {state.error}
          </p>
        )}

        {state.success && (
          <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            Details saved.
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-gradient-to-r bg-[var(--brand-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-accent-hover)] disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save details"}
        </button>
      </form>
    </div>
  );
}
