"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  saveStoryTimelineSection,
  type StoryBibleActionResult,
} from "@/app/actions/story-bible";
import { StorySectionGuide } from "@/components/story-bible/StorySectionGuide";
import { inputClassName } from "@/components/CharacterFormFields";
import type { StoryBible } from "@/types/story-bible";

const labelClassName =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--brand-text-secondary)]";

const initialState: StoryBibleActionResult = {};

type StoryTimelineSectionFormProps = {
  storyId: string;
  bible: StoryBible;
};

export function StoryTimelineSectionForm({
  storyId,
  bible,
}: StoryTimelineSectionFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    saveStoryTimelineSection,
    initialState
  );

  useEffect(() => {
    if (state.success) router.refresh();
  }, [state.success, router]);

  return (
    <div className="space-y-6">
      <StorySectionGuide
        title="Timeline"
        why="Timeline notes keep events in order — when things happen is as important as what happens."
        consistency="Chronology prevents continuity drift as you add scenes, chapters, and references."
        creativeImpact="A clear timeline makes it easier to place key scenes and character arcs."
      />

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="story_id" value={storyId} />

        <div>
          <label htmlFor="story-timeline" className={labelClassName}>
            Timeline
          </label>
          <textarea
            id="story-timeline"
            name="timeline"
            rows={8}
            defaultValue={bible.timeline ?? ""}
            placeholder="Day 1: …&#10;Week 2: …&#10;Act II begins when…"
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
            Timeline saved.
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-gradient-to-r bg-[var(--brand-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-accent-hover)] disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save timeline"}
        </button>
      </form>
    </div>
  );
}
