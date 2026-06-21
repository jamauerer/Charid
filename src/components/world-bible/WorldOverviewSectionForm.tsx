"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  saveWorldOverviewSection,
  type WorldBibleActionResult,
} from "@/app/actions/world-bible";
import { WorldSectionGuide } from "@/components/world-bible/WorldSectionGuide";
import { inputClassName } from "@/components/CharacterFormFields";
import type { WorldBible } from "@/types/world-bible";

const labelClassName =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--brand-text-secondary)]";

const initialState: WorldBibleActionResult = {};

type WorldOverviewSectionFormProps = {
  worldId: string;
  bible: WorldBible;
};

export function WorldOverviewSectionForm({
  worldId,
  bible,
}: WorldOverviewSectionFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    saveWorldOverviewSection,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [state.success, router]);

  return (
    <div className="space-y-6">
      <WorldSectionGuide
        title="Overview"
        why="Overview sets the foundation for your world — what it is, how it feels, and what stories live inside it."
        consistency="Genre, tone, and overview text anchor every location and character reference you add later."
        creativeImpact="A clear overview helps you and collaborators stay aligned on the world's identity."
      />

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="world_id" value={worldId} />
        <input type="hidden" name="themes" value={bible.themes ?? ""} />

        <div>
          <label htmlFor="world-overview" className={labelClassName}>
            World overview
          </label>
          <textarea
            id="world-overview"
            name="overview"
            rows={5}
            defaultValue={bible.overview ?? ""}
            placeholder="What is this world? Key facts, history, and what makes it unique…"
            className={inputClassName}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="world-genre" className={labelClassName}>
              Genre
            </label>
            <input
              id="world-genre"
              name="genre"
              defaultValue={bible.genre ?? ""}
              placeholder="e.g. Fantasy, Sci-fi, Slice of life"
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="world-tone" className={labelClassName}>
              Tone
            </label>
            <input
              id="world-tone"
              name="tone"
              defaultValue={bible.tone ?? ""}
              placeholder="e.g. Dark, Whimsical, Gritty"
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
          className="rounded-lg bg-[var(--brand-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--brand-accent-foreground)] transition hover:bg-[var(--brand-accent)] disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save overview"}
        </button>
      </form>
    </div>
  );
}
