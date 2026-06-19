"use client";

import { useActionState, useEffect } from "react";
import { createStory, type StoryActionState } from "@/app/actions/stories";
import { STORY_STATUSES, STORY_PROJECT_TYPES, STORY_PROJECT_TYPE_LABELS, type StoryProjectType } from "@/types/story";
import type { Story } from "@/types/story";
import { selectClassName } from "@/components/CharacterFormFields";

type StoryFormProps = {
  worldId: string;
  projectId?: string;
  defaultProjectType?: StoryProjectType;
  onSuccess?: (story: Story) => void;
};

export function StoryForm({
  worldId,
  projectId,
  defaultProjectType = "novel",
  onSuccess,
}: StoryFormProps) {
  const [state, formAction, pending] = useActionState<StoryActionState, FormData>(
    createStory,
    {}
  );

  useEffect(() => {
    if (state.success && state.story) {
      onSuccess?.(state.story);
    }
  }, [state.success, state.story, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="world_id" value={worldId} />
      {projectId && <input type="hidden" name="project_id" value={projectId} />}

      {state.error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-[var(--status-danger-text)]">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="story-title" className="mb-1.5 block text-xs font-medium text-[var(--brand-text-secondary)]">
          Title
        </label>
        <input
          id="story-title"
          name="title"
          type="text"
          required
          maxLength={200}
          placeholder="The Burning Forest"
          className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-sm text-[var(--brand-text-secondary)] outline-none placeholder:text-[var(--brand-text-secondary)] focus:border-violet-500/50"
        />
      </div>

      <div>
        <label htmlFor="story-summary" className="mb-1.5 block text-xs font-medium text-[var(--brand-text-secondary)]">
          Summary
        </label>
        <textarea
          id="story-summary"
          name="summary"
          rows={4}
          maxLength={2000}
          placeholder="A brief overview of this story plan…"
          className="w-full resize-y rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-sm text-[var(--brand-text-secondary)] outline-none placeholder:text-[var(--brand-text-secondary)] focus:border-violet-500/50"
        />
      </div>

      <div>
        <label htmlFor="story-status" className="mb-1.5 block text-xs font-medium text-[var(--brand-text-secondary)]">
          Status
        </label>
        <select
          id="story-status"
          name="status"
          defaultValue="Idea"
          className={selectClassName}
        >
          {STORY_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="story-project-type" className="mb-1.5 block text-xs font-medium text-[var(--brand-text-secondary)]">
          Story format
        </label>
        <select
          id="story-project-type"
          name="project_type"
          defaultValue={defaultProjectType}
          className={selectClassName}
        >
          {STORY_PROJECT_TYPES.map((type) => (
            <option key={type} value={type}>
              {STORY_PROJECT_TYPE_LABELS[type]}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-gradient-to-r bg-[var(--brand-accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-500/15 transition hover:bg-[var(--brand-accent-hover)] disabled:opacity-50"
      >
        {pending ? "Creating..." : "Create Story"}
      </button>
    </form>
  );
}
