"use client";

import { useActionState } from "react";
import { updateStory, type StoryActionState } from "@/app/actions/stories";
import type { Story } from "@/types/story";
import { STORY_STATUSES, STORY_PROJECT_TYPES, STORY_PROJECT_TYPE_LABELS } from "@/types/story";
import { selectClassName } from "@/components/CharacterFormFields";

type EditStoryFormProps = {
  story: Story;
  worldId: string;
};

export function EditStoryForm({ story, worldId }: EditStoryFormProps) {
  const [state, formAction, pending] = useActionState<StoryActionState, FormData>(
    updateStory,
    {}
  );

  const displayStory = state.story ?? story;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="story_id" value={story.id} />
      <input type="hidden" name="world_id" value={worldId} />

      {state.error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-[var(--status-danger-text)]">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          Story saved.
        </p>
      )}

      <div>
        <label htmlFor="edit-story-title" className="mb-1.5 block text-xs font-medium text-[var(--brand-text-secondary)]">
          Title
        </label>
        <input
          id="edit-story-title"
          name="title"
          type="text"
          required
          maxLength={200}
          defaultValue={displayStory.title}
          className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-sm text-[var(--brand-text-secondary)] outline-none focus:border-violet-500/50"
        />
      </div>

      <div>
        <label htmlFor="edit-story-summary" className="mb-1.5 block text-xs font-medium text-[var(--brand-text-secondary)]">
          Summary
        </label>
        <textarea
          id="edit-story-summary"
          name="summary"
          rows={4}
          maxLength={2000}
          defaultValue={displayStory.summary ?? ""}
          className="w-full resize-y rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-sm text-[var(--brand-text-secondary)] outline-none focus:border-violet-500/50"
        />
      </div>

      <div>
        <label htmlFor="edit-story-status" className="mb-1.5 block text-xs font-medium text-[var(--brand-text-secondary)]">
          Status
        </label>
        <select
          id="edit-story-status"
          name="status"
          defaultValue={displayStory.status}
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
        <label htmlFor="edit-story-project-type" className="mb-1.5 block text-xs font-medium text-[var(--brand-text-secondary)]">
          Project type
        </label>
        <select
          id="edit-story-project-type"
          name="project_type"
          defaultValue={displayStory.project_type}
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
        className="rounded-lg bg-white/[0.06] px-4 py-2 text-sm font-medium text-[var(--brand-text-secondary)] transition hover:bg-white/10 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save story"}
      </button>
    </form>
  );
}
