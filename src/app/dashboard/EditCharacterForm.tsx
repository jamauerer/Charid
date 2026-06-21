"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  updateCharacter,
  type UpdateCharacterResult,
} from "@/app/actions/characters";
import { CharacterFormFields } from "@/components/CharacterFormFields";
import { CharacterGalleryManager } from "@/components/gallery/CharacterGalleryManager";
import { WorldSelectField } from "@/components/WorldSelectField";
import type { Character } from "@/types/character";

const initialState: UpdateCharacterResult = {};

type EditCharacterFormProps = {
  character: Character;
  bibleAge?: string | null;
  photoUrl: string | null;
  onSuccess?: (character: Character, photoUrl: string | null) => void;
  onCancel?: () => void;
};

export function EditCharacterForm({
  character,
  bibleAge,
  photoUrl: _photoUrl,
  onSuccess,
  onCancel,
}: EditCharacterFormProps) {
  const [state, formAction, pending] = useActionState(
    updateCharacter,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success && state.character) {
      formRef.current?.reset();
      onSuccess?.(state.character, state.photoUrl ?? null);
    }
  }, [state.success, state.character, state.photoUrl, onSuccess]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <input type="hidden" name="character_id" value={character.id} />

      <CharacterFormFields character={character} ageDefault={bibleAge} idPrefix="edit-" />

      <WorldSelectField character={character} idPrefix="edit-" />

      <fieldset className="space-y-3">
        <legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Visibility
        </legend>
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--brand-border)] px-3 py-2.5 transition hover:bg-[var(--brand-surface)]">
          <input
            type="radio"
            name="is_public"
            value="true"
            defaultChecked={character.is_public === true}
            className="accent-[var(--brand-accent)]"
          />
          <span>
            <span className="block text-sm font-medium text-[var(--brand-text-secondary)]">
              Public
            </span>
            <span className="block text-xs text-[var(--brand-text-secondary)]">
              Visible on your public portfolio
            </span>
          </span>
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--brand-border)] px-3 py-2.5 transition hover:bg-[var(--brand-surface)]">
          <input
            type="radio"
            name="is_public"
            value="false"
            defaultChecked={character.is_public !== true}
            className="accent-[var(--brand-accent)]"
          />
          <span>
            <span className="block text-sm font-medium text-[var(--brand-text-secondary)]">
              Private
            </span>
            <span className="block text-xs text-[var(--brand-text-secondary)]">
              Only visible to you in the dashboard
            </span>
          </span>
        </label>
      </fieldset>

      <CharacterGalleryManager characterId={character.id} />

      {state.error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-[var(--status-danger-text)]">
          {state.error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="rounded-lg border border-[var(--brand-border)] px-4 py-2.5 text-sm font-medium text-[var(--brand-text-secondary)] transition hover:bg-[var(--brand-surface)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[var(--brand-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--brand-accent-foreground)] shadow-md transition hover:bg-[var(--brand-accent)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}
