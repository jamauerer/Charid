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

type WorldCulturesSectionFormProps = {
  worldId: string;
  bible: WorldBible;
};

export function WorldCulturesSectionForm({
  worldId,
  bible,
}: WorldCulturesSectionFormProps) {
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
        title="Cultures & themes"
        why="Themes and cultural threads tie locations and characters together — they explain what your world values, fears, and celebrates."
        consistency="Recurring themes keep stories and visuals coherent even when settings change."
        creativeImpact="Strong themes give every scene a sense of place and meaning beyond geography."
      />

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="world_id" value={worldId} />
        <input type="hidden" name="overview" value={bible.overview ?? ""} />
        <input type="hidden" name="genre" value={bible.genre ?? ""} />
        <input type="hidden" name="tone" value={bible.tone ?? ""} />

        <div>
          <label htmlFor="world-themes" className={labelClassName}>
            Themes & cultural threads
          </label>
          <textarea
            id="world-themes"
            name="themes"
            rows={6}
            defaultValue={bible.themes ?? ""}
            placeholder="Power vs. freedom, tradition vs. progress, faith, technology, class divides…"
            className={inputClassName}
          />
          <p className="mt-2 text-xs text-[var(--brand-text-secondary)]">
            Describe recurring ideas, cultural values, or social dynamics that
            shape how people live in this world.
          </p>
        </div>

        {state.error && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-[var(--status-danger-text)]">
            {state.error}
          </p>
        )}

        {state.success && (
          <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            Themes saved.
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[var(--brand-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--brand-accent-foreground)] transition hover:bg-[var(--brand-accent)] disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save themes"}
        </button>
      </form>
    </div>
  );
}
