"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createWorld, type WorldActionState } from "@/app/actions/worlds";
import type { World } from "@/types/world";

const initialState: WorldActionState = {};

type WorldFormProps = {
  onSuccess?: () => void;
  onCreated?: (world: World) => void;
  projectId?: string;
};

export function WorldForm({ onSuccess, onCreated, projectId }: WorldFormProps) {
  const [state, formAction, pending] = useActionState(createWorld, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setCoverPreview(null);
      if (state.world) {
        onCreated?.(state.world);
      }
      onSuccess?.();
    }
  }, [state.success, state.world, onSuccess, onCreated]);

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
      {projectId && (
        <input type="hidden" name="project_id" value={projectId} />
      )}
      <div>
        <label htmlFor="world-name" className="mb-1.5 block text-xs font-medium text-[var(--brand-text-secondary)]">
          Name
        </label>
        <input
          id="world-name"
          name="name"
          type="text"
          required
          className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2.5 text-sm text-[var(--brand-text-secondary)] placeholder:text-[var(--brand-text-secondary)] focus:border-[var(--brand-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)]"
          placeholder="Ashlands"
        />
      </div>

      <div>
        <label htmlFor="world-description" className="mb-1.5 block text-xs font-medium text-[var(--brand-text-secondary)]">
          Description
        </label>
        <textarea
          id="world-description"
          name="description"
          rows={4}
          className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2.5 text-sm text-[var(--brand-text-secondary)] placeholder:text-[var(--brand-text-secondary)] focus:border-[var(--brand-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-accent)]"
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
            defaultChecked
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
        <label htmlFor="world-cover" className="mb-1.5 block text-xs font-medium text-[var(--brand-text-secondary)]">
          Cover image (optional)
        </label>
        <div className="mb-3 overflow-hidden rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)]">
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
            <div className="flex aspect-[16/9] items-center justify-center text-sm text-[var(--brand-text-secondary)]">
              No cover yet
            </div>
          )}
        </div>
        <input
          id="world-cover"
          name="cover"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleCoverChange}
          className="w-full text-sm text-[var(--brand-text-secondary)] file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-[var(--tag-primary-bg)] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-neutral-600 file:transition hover:file:bg-[var(--tag-primary-bg)]"
        />
      </div>

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
        {pending ? "Creating..." : "Create World"}
      </button>
    </form>
  );
}
