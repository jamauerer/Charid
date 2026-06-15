"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  updateCharacter,
  type UpdateCharacterResult,
} from "@/app/actions/characters";
import type { Character } from "@/types/character";

const initialState: UpdateCharacterResult = {};

const inputClassName =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30";

type EditCharacterFormProps = {
  character: Character;
  photoUrl: string | null;
  onSuccess?: (character: Character, photoUrl: string | null) => void;
  onCancel?: () => void;
};

export function EditCharacterForm({
  character,
  photoUrl,
  onSuccess,
  onCancel,
}: EditCharacterFormProps) {
  const [state, formAction, pending] = useActionState(
    updateCharacter,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [newPhotoPreview, setNewPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (state.success && state.character) {
      formRef.current?.reset();
      setNewPhotoPreview(null);
      onSuccess?.(state.character, state.photoUrl ?? null);
    }
  }, [state.success, state.character, state.photoUrl, onSuccess]);

  useEffect(() => {
    return () => {
      if (newPhotoPreview) {
        URL.revokeObjectURL(newPhotoPreview);
      }
    };
  }, [newPhotoPreview]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (newPhotoPreview) {
      URL.revokeObjectURL(newPhotoPreview);
    }
    if (file) {
      setNewPhotoPreview(URL.createObjectURL(file));
    } else {
      setNewPhotoPreview(null);
    }
  }

  const previewSrc = newPhotoPreview ?? photoUrl;

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="character_id" value={character.id} />

      <div>
        <label
          htmlFor="edit-name"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500"
        >
          Name
        </label>
        <input
          id="edit-name"
          name="name"
          type="text"
          required
          defaultValue={character.name}
          placeholder="e.g. Aria Stormwind"
          className={inputClassName}
        />
      </div>

      <div>
        <label
          htmlFor="edit-physical_description"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500"
        >
          Physical description
        </label>
        <textarea
          id="edit-physical_description"
          name="physical_description"
          required
          rows={4}
          defaultValue={character.physical_description}
          placeholder="Height, build, hair, eyes, distinguishing features..."
          className={inputClassName}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Photo
        </label>
        <div className="mb-3 overflow-hidden rounded-lg border border-white/10 bg-white/[0.02]">
          {previewSrc ? (
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={previewSrc}
                alt={character.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center text-sm text-zinc-600">
              No photo uploaded
            </div>
          )}
        </div>
        <input
          id="edit-photo"
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handlePhotoChange}
          className="w-full text-sm text-zinc-400 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-violet-600/20 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-violet-300 file:transition hover:file:bg-violet-600/30"
        />
        <p className="mt-1.5 text-xs text-zinc-600">
          Leave empty to keep the current photo. JPEG, PNG, or WebP up to 5 MB.
        </p>
      </div>

      {state.success && (
        <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          Character updated successfully.
        </p>
      )}

      {state.error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}
