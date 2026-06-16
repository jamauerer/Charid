"use client";

import { useActionState, useEffect } from "react";
import { createStory, type StoryActionState } from "@/app/actions/stories";
import { STORY_STATUSES, STORY_PROJECT_TYPES, STORY_PROJECT_TYPE_LABELS } from "@/types/story";

type StoryFormProps = {
  worldId: string;
  onSuccess?: () => void;
};

export function StoryForm({ worldId, onSuccess }: StoryFormProps) {
  const [state, formAction, pending] = useActionState<StoryActionState, FormData>(
    createStory,
    {}
  );

  useEffect(() => {
    if (state.success) {
      onSuccess?.();
    }
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="world_id" value={worldId} />

      {state.error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="story-title" className="mb-1.5 block text-xs font-medium text-zinc-400">
          Title
        </label>
        <input
          id="story-title"
          name="title"
          type="text"
          required
          maxLength={200}
          placeholder="The Burning Forest"
          className="w-full rounded-lg border border-white/10 bg-[#141416] px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-violet-500/50"
        />
      </div>

      <div>
        <label htmlFor="story-summary" className="mb-1.5 block text-xs font-medium text-zinc-400">
          Summary
        </label>
        <textarea
          id="story-summary"
          name="summary"
          rows={4}
          maxLength={2000}
          placeholder="A brief overview of this story plan…"
          className="w-full resize-y rounded-lg border border-white/10 bg-[#141416] px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-violet-500/50"
        />
      </div>

      <div>
        <label htmlFor="story-status" className="mb-1.5 block text-xs font-medium text-zinc-400">
          Status
        </label>
        <select
          id="story-status"
          name="status"
          defaultValue="Idea"
          className="w-full rounded-lg border border-white/10 bg-[#141416] px-3 py-2 text-sm text-zinc-200 outline-none focus:border-violet-500/50"
        >
          {STORY_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="story-project-type" className="mb-1.5 block text-xs font-medium text-zinc-400">
          Project type
        </label>
        <select
          id="story-project-type"
          name="project_type"
          defaultValue="novel"
          className="w-full rounded-lg border border-white/10 bg-[#141416] px-3 py-2 text-sm text-zinc-200 outline-none focus:border-violet-500/50"
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
        className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-500/15 transition hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50"
      >
        {pending ? "Creating..." : "Create Story"}
      </button>
    </form>
  );
}
