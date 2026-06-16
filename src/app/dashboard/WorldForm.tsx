"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createWorld, type WorldActionState } from "@/app/actions/worlds";

const initialState: WorldActionState = {};

type WorldFormProps = {
  onSuccess?: () => void;
};

export function WorldForm({ onSuccess }: WorldFormProps) {
  const [state, formAction, pending] = useActionState(createWorld, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setCoverPreview(null);
      onSuccess?.();
    }
  }, [state.success, onSuccess]);

  useEffect(() => {
    return () => {
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [coverPreview]);

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
    }
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
    } else {
      setCoverPreview(null);
    }
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <div>
        <label htmlFor="world-name" className="mb-1.5 block text-xs font-medium text-zinc-400">
          Name
        </label>
        <input
          id="world-name"
          name="name"
          type="text"
          required
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
          placeholder="Ashlands"
        />
      </div>

      <div>
        <label htmlFor="world-description" className="mb-1.5 block text-xs font-medium text-zinc-400">
          Description
        </label>
        <textarea
          id="world-description"
          name="description"
          rows={4}
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
          placeholder="Describe this world..."
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-violet-400/80">
          Visibility
        </legend>
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/[0.06] px-3 py-2.5 transition hover:bg-white/[0.03]">
          <input
            type="radio"
            name="is_public"
            value="true"
            defaultChecked
            className="accent-violet-500"
          />
          <span>
            <span className="block text-sm font-medium text-zinc-200">Public</span>
            <span className="block text-xs text-zinc-500">
              Visible on your public portfolio
            </span>
          </span>
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/[0.06] px-3 py-2.5 transition hover:bg-white/[0.03]">
          <input
            type="radio"
            name="is_public"
            value="false"
            className="accent-violet-500"
          />
          <span>
            <span className="block text-sm font-medium text-zinc-200">Private</span>
            <span className="block text-xs text-zinc-500">
              Only visible to you in the dashboard
            </span>
          </span>
        </label>
      </fieldset>

      <div>
        <label htmlFor="world-cover" className="mb-1.5 block text-xs font-medium text-zinc-400">
          Cover image (optional)
        </label>
        <div className="mb-3 overflow-hidden rounded-lg border border-white/10 bg-white/[0.02]">
          {coverPreview ? (
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={coverPreview}
                alt="Cover preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex aspect-[16/9] items-center justify-center text-sm text-zinc-600">
              No cover selected
            </div>
          )}
        </div>
        <input
          id="world-cover"
          name="cover"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleCoverChange}
          className="w-full text-sm text-zinc-400 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-violet-600/20 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-violet-300 file:transition hover:file:bg-violet-600/30"
        />
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
        {pending ? "Creating..." : "Create World"}
      </button>
    </form>
  );
}
