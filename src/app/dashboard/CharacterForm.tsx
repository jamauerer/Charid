"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createCharacter,
  type CharacterActionState,
} from "@/app/actions/characters";
import { CharacterFormFields } from "@/components/CharacterFormFields";

const initialState: CharacterActionState = {};

type CharacterFormProps = {
  onSuccess?: () => void;
  onCreated?: (characterId: string) => void;
  defaultWorldId?: string;
  projectId?: string;
  storyId?: string;
};

export function CharacterForm({
  onSuccess,
  onCreated,
  defaultWorldId,
  projectId,
  storyId,
}: CharacterFormProps) {
  const [state, formAction, pending] = useActionState(
    createCharacter,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      if (state.characterId) {
        onCreated?.(state.characterId);
      }
      onSuccess?.();
    }
  }, [state.success, state.characterId, onSuccess, onCreated]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      {defaultWorldId && (
        <input type="hidden" name="world_id" value={defaultWorldId} />
      )}
      {projectId && (
        <input type="hidden" name="project_id" value={projectId} />
      )}
      {storyId && (
        <input type="hidden" name="story_id" value={storyId} />
      )}
      <CharacterFormFields />

      <fieldset className="space-y-4">
        <legend className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Photo
        </legend>
        <div>
          <label
            htmlFor="photo"
            className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--brand-text-secondary)]"
          >
            Photo (optional)
          </label>
          <input
            id="photo"
            name="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="w-full text-sm text-[var(--brand-text-secondary)] file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-[var(--tag-primary-bg)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-neutral-600 file:transition hover:file:bg-[var(--tag-primary-bg)]"
          />
          <p className="mt-1.5 text-xs text-[var(--brand-text-secondary)]">
            JPEG, PNG, or WebP up to 5 MB
          </p>
        </div>
      </fieldset>

      {state.error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-[var(--status-danger-text)]">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-[var(--brand-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--brand-accent-foreground)] shadow-md transition hover:bg-[var(--brand-accent)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save character"}
      </button>
    </form>
  );
}
