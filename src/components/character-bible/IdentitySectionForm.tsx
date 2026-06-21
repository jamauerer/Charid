"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  saveCharacterIdentitySection,
  type CharacterBibleActionResult,
} from "@/app/actions/character-bible";
import { BibleSectionGuide } from "@/components/character-bible/BibleSectionGuide";
import { inputClassName, selectClassName } from "@/components/CharacterFormFields";
import {
  IDENTITY_ARCHETYPES,
  IDENTITY_ARCHETYPE_LABELS,
} from "@/types/identity-archetype";
import type { Character } from "@/types/character";
import type { CharacterBible } from "@/types/character-bible";

const labelClassName =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--brand-text-secondary)]";

const initialState: CharacterBibleActionResult = {};

type IdentitySectionFormProps = {
  character: Character;
  bible: CharacterBible;
};

export function IdentitySectionForm({
  character,
  bible,
}: IdentitySectionFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    saveCharacterIdentitySection,
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
        title="Identity"
        why="Identity defines who your character is across every story and medium. Name, species, personality, and permanent features stay stable even when outfits or age change."
        consistency="Permanent identity fields anchor every reference image — they tell you what must never drift."
        creativeImpact="Name, species, and personality anchor every project. They define who your character is beyond how they look."
      />

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="character_id" value={character.id} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="bible-name" className={labelClassName}>
              Character name
            </label>
            <input
              id="bible-name"
              name="name"
              required
              defaultValue={character.name}
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="bible-species" className={labelClassName}>
              Species / type
            </label>
            <input
              id="bible-species"
              name="species"
              defaultValue={character.species ?? ""}
              placeholder="e.g. Human, Dragon, Android"
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="bible-archetype" className={labelClassName}>
              Identity archetype
            </label>
            <select
              id="bible-archetype"
              name="identity_archetype"
              defaultValue={bible.identity_archetype}
              className={selectClassName}
            >
              {IDENTITY_ARCHETYPES.map((archetype) => (
                <option key={archetype} value={archetype}>
                  {IDENTITY_ARCHETYPE_LABELS[archetype]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="bible-format" className={labelClassName}>
              Creative format
            </label>
            <input
              id="bible-format"
              name="creative_format"
              defaultValue={bible.creative_format ?? ""}
              placeholder="e.g. Anime, Watercolor, 3D"
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="bible-gender" className={labelClassName}>
              Gender
            </label>
            <input
              id="bible-gender"
              name="gender"
              defaultValue={character.gender ?? ""}
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="bible-location" className={labelClassName}>
              Location
            </label>
            <input
              id="bible-location"
              name="location"
              defaultValue={character.location ?? ""}
              className={inputClassName}
            />
          </div>
        </div>

        <div>
          <label htmlFor="bible-personality" className={labelClassName}>
            Core personality
          </label>
          <textarea
            id="bible-personality"
            name="core_personality"
            rows={3}
            defaultValue={character.core_personality ?? ""}
            placeholder="Bold, sarcastic, loyal — the traits that define how they act"
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="bible-features" className={labelClassName}>
            Permanent features
          </label>
          <textarea
            id="bible-features"
            name="permanent_features"
            rows={2}
            defaultValue={character.permanent_features ?? ""}
            placeholder="Scars that never fade, heterochromia, prosthetic arm…"
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="bible-backstory" className={labelClassName}>
            Backstory
          </label>
          <textarea
            id="bible-backstory"
            name="backstory"
            rows={5}
            defaultValue={character.backstory ?? ""}
            placeholder="Origin, goals, key events…"
            className={inputClassName}
          />
        </div>

        <fieldset className="space-y-2">
          <legend className={labelClassName}>Portfolio visibility</legend>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--brand-border)] px-3 py-2.5">
            <input
              type="radio"
              name="is_public"
              value="true"
              defaultChecked={character.is_public === true}
              className="accent-[var(--brand-accent)]"
            />
            <span className="text-sm text-[var(--brand-text-secondary)]">Public on portfolio</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--brand-border)] px-3 py-2.5">
            <input
              type="radio"
              name="is_public"
              value="false"
              defaultChecked={character.is_public !== true}
              className="accent-[var(--brand-accent)]"
            />
            <span className="text-sm text-[var(--brand-text-secondary)]">Private (dashboard only)</span>
          </label>
        </fieldset>

        {state.error && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-[var(--status-danger-text)]">
            {state.error}
          </p>
        )}

        {state.success && (
          <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            Identity saved.
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[var(--brand-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--brand-accent-foreground)] transition hover:bg-[var(--brand-accent)] disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save identity"}
        </button>
      </form>
    </div>
  );
}
