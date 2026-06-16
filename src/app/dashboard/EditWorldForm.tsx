"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { updateWorld, type WorldActionState } from "@/app/actions/worlds";
import type { World } from "@/types/world";

type EditWorldFormProps = {
  world: World;
  coverUrl: string | null;
};

export function EditWorldForm({ world, coverUrl: initialCoverUrl }: EditWorldFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<WorldActionState, FormData>(
    updateWorld,
    {}
  );
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [removeCover, setRemoveCover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayWorld = state.world ?? world;
  const showExistingCover = !removeCover && !coverPreview && initialCoverUrl;

  useEffect(() => {
    if (state.success) {
      setCoverPreview(null);
      setRemoveCover(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      router.refresh();
    }
  }, [state.success, router]);

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
      setRemoveCover(false);
    } else {
      setCoverPreview(null);
    }
  }

  function handleRemoveCoverChange(checked: boolean) {
    setRemoveCover(checked);
    if (checked) {
      if (coverPreview) {
        URL.revokeObjectURL(coverPreview);
        setCoverPreview(null);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="world_id" value={world.id} />

      {state.error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          World saved.
        </p>
      )}

      <div>
        <label htmlFor="edit-world-name" className="mb-1.5 block text-xs font-medium text-zinc-400">
          Name
        </label>
        <input
          id="edit-world-name"
          name="name"
          type="text"
          required
          maxLength={200}
          defaultValue={displayWorld.name}
          key={`name-${displayWorld.id}-${displayWorld.name}`}
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
        />
      </div>

      <div>
        <label htmlFor="edit-world-description" className="mb-1.5 block text-xs font-medium text-zinc-400">
          Description
        </label>
        <textarea
          id="edit-world-description"
          name="description"
          rows={4}
          defaultValue={displayWorld.description ?? ""}
          key={`desc-${displayWorld.id}-${displayWorld.description ?? ""}`}
          className="w-full resize-y rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
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
            defaultChecked={displayWorld.is_public}
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
            defaultChecked={!displayWorld.is_public}
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
        <label htmlFor="edit-world-cover" className="mb-1.5 block text-xs font-medium text-zinc-400">
          Cover image
        </label>
        <div className="mb-3 overflow-hidden rounded-lg border border-white/10 bg-white/[0.02]">
          {coverPreview ? (
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={coverPreview}
                alt="New cover preview"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : showExistingCover ? (
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={initialCoverUrl}
                alt={displayWorld.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex aspect-[16/9] items-center justify-center text-sm text-zinc-600">
              No cover image
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          id="edit-world-cover"
          name="cover"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleCoverChange}
          disabled={removeCover}
          className="w-full text-sm text-zinc-400 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-violet-600/20 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-violet-300 file:transition hover:file:bg-violet-600/30 disabled:opacity-50"
        />
        {(initialCoverUrl || world.cover_image_path) && (
          <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              name="remove_cover"
              value="true"
              checked={removeCover}
              onChange={(e) => handleRemoveCoverChange(e.target.checked)}
              className="accent-violet-500"
            />
            Remove cover image
          </label>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:from-violet-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save World"}
      </button>
    </form>
  );
}
