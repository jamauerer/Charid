"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createProject, type ProjectActionState } from "@/app/actions/projects";
import type { Project } from "@/types/project";

const initialState: ProjectActionState = {};

type ProjectFormProps = {
  onSuccess?: () => void;
  onCreated?: (project: Project) => void;
};

export function ProjectForm({ onSuccess, onCreated }: ProjectFormProps) {
  const [state, formAction, pending] = useActionState(
    createProject,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setCoverPreview(null);
      if (state.project) {
        onCreated?.(state.project);
      }
      onSuccess?.();
    }
  }, [state.success, state.project, onSuccess, onCreated]);

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
        <label
          htmlFor="project-title"
          className="mb-1.5 block text-xs font-medium text-[var(--brand-text-secondary)]"
        >
          Title
        </label>
        <input
          id="project-title"
          name="title"
          type="text"
          required
          className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2.5 text-sm text-[var(--brand-text-secondary)] placeholder:text-[var(--brand-text-secondary)] focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
          placeholder="Children's Dragon Comic"
        />
      </div>

      <div>
        <label
          htmlFor="project-description"
          className="mb-1.5 block text-xs font-medium text-[var(--brand-text-secondary)]"
        >
          Description
        </label>
        <textarea
          id="project-description"
          name="description"
          rows={3}
          className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2.5 text-sm text-[var(--brand-text-secondary)] placeholder:text-[var(--brand-text-secondary)] focus:border-violet-500/50 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
          placeholder="Everything needed to finish this work — characters, worlds, stories…"
        />
      </div>

      <div>
        <label
          htmlFor="project-cover"
          className="mb-1.5 block text-xs font-medium text-[var(--brand-text-secondary)]"
        >
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
          id="project-cover"
          name="cover"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleCoverChange}
          className="w-full text-sm text-[var(--brand-text-secondary)] file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-violet-600/20 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-neutral-600 file:transition hover:file:bg-violet-600/30"
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
        className="w-full rounded-lg bg-gradient-to-r bg-[var(--brand-accent)] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:bg-[var(--brand-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Creating..." : "Create Project"}
      </button>
    </form>
  );
}
