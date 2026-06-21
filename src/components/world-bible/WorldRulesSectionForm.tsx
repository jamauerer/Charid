"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  saveWorldRulesSection,
  type WorldBibleActionResult,
} from "@/app/actions/world-bible";
import { WorldSectionGuide } from "@/components/world-bible/WorldSectionGuide";
import { inputClassName } from "@/components/CharacterFormFields";
import type { WorldBible } from "@/types/world-bible";

const labelClassName =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--brand-text-secondary)]";

const initialState: WorldBibleActionResult = {};

type WorldRulesSectionFormProps = {
  worldId: string;
  bible: WorldBible;
};

export function WorldRulesSectionForm({
  worldId,
  bible,
}: WorldRulesSectionFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    saveWorldRulesSection,
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
        title="Rules & setting"
        why="World rules define what is possible — magic systems, technology limits, social laws, and physical constraints."
        consistency="Era and climate ground every location reference in the same physical reality."
        creativeImpact="Clear rules prevent contradictions and give stories a reliable framework."
      />

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="world_id" value={worldId} />

        <div>
          <label htmlFor="world-rules" className={labelClassName}>
            World rules
          </label>
          <textarea
            id="world-rules"
            name="rules"
            rows={5}
            defaultValue={bible.rules ?? ""}
            placeholder="Magic costs, technology limits, social laws, physics quirks…"
            className={inputClassName}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="world-era" className={labelClassName}>
              Era
            </label>
            <input
              id="world-era"
              name="era"
              defaultValue={bible.era ?? ""}
              placeholder="e.g. Medieval, Far future, 1920s"
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="world-climate" className={labelClassName}>
              Climate
            </label>
            <input
              id="world-climate"
              name="climate"
              defaultValue={bible.climate ?? ""}
              placeholder="e.g. Temperate, Arctic, Desert worlds"
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
            Rules saved.
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[var(--brand-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--brand-accent-foreground)] transition hover:bg-[var(--brand-accent)] disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save rules"}
        </button>
      </form>
    </div>
  );
}
