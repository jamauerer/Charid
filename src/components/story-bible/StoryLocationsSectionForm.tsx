"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  saveStoryLocationsSection,
  type StoryBibleActionResult,
} from "@/app/actions/story-bible";
import { StorySectionGuide } from "@/components/story-bible/StorySectionGuide";
import { inputClassName } from "@/components/CharacterFormFields";
import type { StoryBible } from "@/types/story-bible";

const labelClassName =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--brand-text-secondary)]";

const initialState: StoryBibleActionResult = {};

type StoryLocationsSectionFormProps = {
  storyId: string;
  bible: StoryBible;
};

export function StoryLocationsSectionForm({
  storyId,
  bible,
}: StoryLocationsSectionFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    saveStoryLocationsSection,
    initialState
  );

  useEffect(() => {
    if (state.success) router.refresh();
  }, [state.success, router]);

  return (
    <div className="space-y-6">
      <StorySectionGuide
        title="Locations"
        why="Where scenes unfold shapes mood, composition, and reference choices."
        consistency="Key locations tie your story's canon to the world's geography and atmosphere."
        creativeImpact="Location notes help you assign scene references and mood boards with intent."
      />

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="story_id" value={storyId} />

        <div>
          <label htmlFor="story-key-locations" className={labelClassName}>
            Key locations
          </label>
          <textarea
            id="story-key-locations"
            name="key_locations"
            rows={8}
            defaultValue={bible.key_locations ?? ""}
            placeholder="The harbor at dawn…&#10;The abandoned temple…"
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
            Locations saved.
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[var(--brand-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--brand-accent-foreground)] transition hover:bg-[var(--brand-accent)] disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save locations"}
        </button>
      </form>
    </div>
  );
}
