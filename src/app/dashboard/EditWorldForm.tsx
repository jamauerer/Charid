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
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-[var(--status-danger-text)]">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          World saved.
        </p>
      )}

      <div>
        <label htmlFor="edit-world-name" className="mb-1.5 block text-xs font-medium text-[var(--brand-text-secondary)]">
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
          className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2.5 text-sm text-[var(--brand-text-secondary)] placeholder:text-[var(--brand-text-secondary)] focus:border-[var(--brand-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)]"
        />
      </div>

      <div>
        <label htmlFor="edit-world-description" className="mb-1.5 block text-xs font-medium text-[var(--brand-text-secondary)]">
          Description
        </label>
        <textarea
          id="edit-world-description"
          name="description"
          rows={4}
          defaultValue={displayWorld.description ?? ""}
          key={`desc-${displayWorld.id}-${displayWorld.description ?? ""}`}
          className="w-full resize-y rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2.5 text-sm text-[var(--brand-text-secondary)] placeholder:text-[var(--brand-text-secondary)] focus:border-[var(--brand-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)]"
          placeholder="Describe this world..."
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Visibility
        </legend>
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-[var(--brand-border)] px-3 py-2.5 transition hover:bg-[var(--brand-surface)]">
          <input
            type="radio"
            name="is_public"
            value="true"
            defaultChecked={displayWorld.is_public}
            className="accent-[var(--brand-accent)]"
          />
          <span>
            <span className="block text-sm font-medium text-[var(--brand-text-secondary)]">Public</span>
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
            defaultChecked={!displayWorld.is_public}
            className="accent-[var(--brand-accent)]"
          />
          <span>
            <span className="block text-sm font-medium text-[var(--brand-text-secondary)]">Private</span>
            <span className="block text-xs text-[var(--brand-text-secondary)]">
              Only visible to you in the dashboard
            </span>
          </span>
        </label>
      </fieldset>

      <div>
        <label htmlFor="edit-world-cover" className="mb-1.5 block text-xs font-medium text-[var(--brand-text-secondary)]">
          Cover image
        </label>
        <div className="mb-3 overflow-hidden rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)]">
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
            <div className="flex aspect-[16/9] items-center justify-center text-sm text-[var(--brand-text-secondary)]">
              No cover yet
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
          className="w-full text-sm text-[var(--brand-text-secondary)] file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-[var(--tag-primary-bg)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-neutral-600 file:transition hover:file:bg-[var(--tag-primary-bg)] disabled:opacity-50"
        />
        {(initialCoverUrl || world.cover_image_path) && (
          <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-[var(--brand-text-secondary)]">
            <input
              type="checkbox"
              name="remove_cover"
              value="true"
              checked={removeCover}
              onChange={(e) => handleRemoveCoverChange(e.target.checked)}
              className="accent-[var(--brand-accent)]"
            />
            Remove cover image
          </label>
        )}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-[var(--brand-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--brand-accent-foreground)] shadow-md transition hover:bg-[var(--brand-accent)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save World"}
      </button>
    </form>
  );
}
