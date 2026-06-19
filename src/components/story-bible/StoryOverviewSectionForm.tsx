"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  saveStoryOverviewSection,
  type StoryBibleActionResult,
} from "@/app/actions/story-bible";
import { StorySectionGuide } from "@/components/story-bible/StorySectionGuide";
import { inputClassName } from "@/components/CharacterFormFields";
import type { StoryBible } from "@/types/story-bible";

const labelClassName =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--brand-text-secondary)]";

const initialState: StoryBibleActionResult = {};

type StoryOverviewSectionFormProps = {
  storyId: string;
  bible: StoryBible;
};

export function StoryOverviewSectionForm({
  storyId,
  bible,
}: StoryOverviewSectionFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    saveStoryOverviewSection,
    initialState
  );

  useEffect(() => {
    if (state.success) router.refresh();
  }, [state.success, router]);

  return (
    <div className="space-y-6">
      <StorySectionGuide
        title="Overview"
        why="Overview sets the foundation for your story — what it's about, how it feels, and what themes drive it forward."
        consistency="Summary, themes, and tone anchor every scene reference and character beat you add later."
        creativeImpact="A clear overview helps you stay aligned on the story's identity across chapters."
      />

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="story_id" value={storyId} />

        <div>
          <label htmlFor="story-summary" className={labelClassName}>
            Summary
          </label>
          <textarea
            id="story-summary"
            name="summary"
            rows={5}
            defaultValue={bible.summary ?? ""}
            placeholder="What is this story about? The core premise and emotional arc…"
            className={inputClassName}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="story-themes" className={labelClassName}>
              Themes
            </label>
            <input
              id="story-themes"
              name="themes"
              defaultValue={bible.themes ?? ""}
              placeholder="e.g. Redemption, Found family, Identity"
              className={inputClassName}
            />
          </div>
          <div>
            <label htmlFor="story-tone" className={labelClassName}>
              Tone
            </label>
            <input
              id="story-tone"
              name="tone"
              defaultValue={bible.tone ?? ""}
              placeholder="e.g. Hopeful, Tense, Whimsical"
              className={inputClassName}
            />
          </div>
        </div>

        {state.error && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-[var(--status-danger-text)]">
            {state.error}
          </p>
        )}
        {state.success && (
          <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            Overview saved.
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-gradient-to-r bg-[var(--brand-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-accent-hover)] disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save overview"}
        </button>
      </form>
    </div>
  );
}
