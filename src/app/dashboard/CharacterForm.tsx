"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createCharacter,
  type CharacterActionState,
} from "@/app/actions/characters";

const initialState: CharacterActionState = {};

const inputClassName =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30";

type CharacterFormProps = {
  onSuccess?: () => void;
};

export function CharacterForm({ onSuccess }: CharacterFormProps) {
  const [state, formAction, pending] = useActionState(
    createCharacter,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      onSuccess?.();
    }
  }, [state.success, onSuccess]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500"
        >
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="e.g. Aria Stormwind"
          className={inputClassName}
        />
      </div>

      <div>
        <label
          htmlFor="physical_description"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500"
        >
          Physical description
        </label>
        <textarea
          id="physical_description"
          name="physical_description"
          required
          rows={4}
          placeholder="Height, build, hair, eyes, distinguishing features..."
          className={inputClassName}
        />
      </div>

      <div>
        <label
          htmlFor="photo"
          className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500"
        >
          Photo (optional)
        </label>
        <input
          id="photo"
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="w-full text-sm text-zinc-400 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-violet-600/20 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-violet-300 file:transition hover:file:bg-violet-600/30"
        />
        <p className="mt-1.5 text-xs text-zinc-600">
          JPEG, PNG, or WebP up to 5 MB
        </p>
      </div>

      {state.error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save character"}
      </button>
    </form>
  );
}
