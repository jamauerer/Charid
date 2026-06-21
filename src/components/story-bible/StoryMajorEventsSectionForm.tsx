"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  saveStoryMajorEventsSection,
  type StoryBibleActionResult,
} from "@/app/actions/story-bible";
import { StorySectionGuide } from "@/components/story-bible/StorySectionGuide";
import { inputClassName } from "@/components/CharacterFormFields";
import type { StoryBible } from "@/types/story-bible";

const labelClassName =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--brand-text-secondary)]";

const initialState: StoryBibleActionResult = {};

type StoryMajorEventsSectionFormProps = {
  storyId: string;
  bible: StoryBible;
};

export function StoryMajorEventsSectionForm({
  storyId,
  bible,
}: StoryMajorEventsSectionFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    saveStoryMajorEventsSection,
    initialState
  );

  useEffect(() => {
    if (state.success) router.refresh();
  }, [state.success, router]);

  return (
    <div className="space-y-6">
      <StorySectionGuide
        title="Major events"
        why="Plot beats become the backbone for scene references, chapter planning, and character arcs."
        consistency="Documenting major events keeps every creative decision tied to the story's through-line."
        creativeImpact="Key events help you pick the right reference images and mood boards."
      />

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="story_id" value={storyId} />

        <div>
          <label htmlFor="story-major-events" className={labelClassName}>
            Major events
          </label>
          <textarea
            id="story-major-events"
            name="major_events"
            rows={8}
            defaultValue={bible.major_events ?? ""}
            placeholder="Inciting incident…&#10;Midpoint reversal…&#10;Climax…"
            className={inputClassName}
          />
        </div>

        {state.error && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-[var(--status-danger-text)]">
            {state.error}
          </p>
        )}
        {state.success && (
          <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            Major events saved.
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[var(--brand-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--brand-accent-foreground)] transition hover:bg-[var(--brand-accent)] disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save major events"}
        </button>
      </form>
    </div>
  );
}
