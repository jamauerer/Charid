"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  saveStoryCharactersNotesSection,
  type StoryBibleActionResult,
} from "@/app/actions/story-bible";
import { StorySectionGuide } from "@/components/story-bible/StorySectionGuide";
import { inputClassName } from "@/components/CharacterFormFields";
import type { StoryBible } from "@/types/story-bible";

const labelClassName =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--brand-text-secondary)]";

const initialState: StoryBibleActionResult = {};

type StoryCharactersSectionProps = {
  storyId: string;
  bible: StoryBible;
};

export function StoryCharactersSection({
  storyId,
  bible,
}: StoryCharactersSectionProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    saveStoryCharactersNotesSection,
    initialState
  );

  useEffect(() => {
    if (state.success) router.refresh();
  }, [state.success, router]);

  return (
    <div className="space-y-8">
      <StorySectionGuide
        title="Character notes"
        why="Note who drives each act and capture continuity reminders for this story."
        consistency="The linked roster lives at the top of this story page — use this section for narrative notes."
        creativeImpact="Key character notes help you prioritize scene references and emotional tone."
      />

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="story_id" value={storyId} />

        <div>
          <label htmlFor="story-key-characters" className={labelClassName}>
            Key characters
          </label>
          <textarea
            id="story-key-characters"
            name="key_characters"
            rows={5}
            defaultValue={bible.key_characters ?? ""}
            placeholder="Protagonist, antagonist, mentors, and who drives each act…"
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="story-notes" className={labelClassName}>
            Notes
          </label>
          <textarea
            id="story-notes"
            name="notes"
            rows={4}
            defaultValue={bible.notes ?? ""}
            placeholder="Additional story notes, research links, or continuity reminders…"
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
            Character notes saved.
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[var(--brand-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--brand-accent-foreground)] transition hover:bg-[var(--brand-accent)] disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save character notes"}
        </button>
      </form>
    </div>
  );
}
