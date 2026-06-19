"use client";

import { useActionState, useState } from "react";
import {
  submitCharacterVisionFeedback,
  type CreatorFeedbackActionState,
} from "@/app/actions/creator-feedback";
import { inputClassName } from "@/components/CharacterFormFields";
import type { CreatorFeedback } from "@/types/creator-feedback";

const labelClassName =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--brand-text-secondary)]";

const initialState: CreatorFeedbackActionState = {};

type CharacterBibleFeedbackProps = {
  characterId: string;
  initialFeedback: CreatorFeedback | null;
};

export function CharacterBibleFeedback({
  characterId,
  initialFeedback,
}: CharacterBibleFeedbackProps) {
  const [state, formAction, pending] = useActionState(
    submitCharacterVisionFeedback,
    initialState
  );
  const [rating, setRating] = useState<number>(
    state.feedback?.rating ?? initialFeedback?.rating ?? 0
  );
  const latest = state.feedback ?? initialFeedback;

  return (
    <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 sm:p-6">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
        Your feedback
      </h2>
      <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">
        How well does this character represent your vision?
      </p>

      <form action={formAction} className="mt-4 space-y-4">
        <input type="hidden" name="character_id" value={characterId} />
        <input type="hidden" name="rating" value={rating || ""} />

        <div>
          <span className={labelClassName}>Rating</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`${value} star${value === 1 ? "" : "s"}`}
                onClick={() => setRating(value)}
                className={`rounded-md px-2 py-1 text-lg transition ${
                  rating >= value
                    ? "text-neutral-500 hover:text-neutral-600"
                    : "text-[var(--brand-text-secondary)] hover:text-[var(--brand-text-secondary)]"
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="feedback-notes" className={labelClassName}>
            What is missing or incorrect? (optional)
          </label>
          <textarea
            id="feedback-notes"
            name="notes"
            rows={3}
            maxLength={2000}
            defaultValue={latest?.notes ?? ""}
            placeholder="Hair color, personality tone, missing reference views…"
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
            Thanks — your feedback helps CharID preserve creator intent.
          </p>
        )}

        <button
          type="submit"
          disabled={pending || rating === 0}
          className="rounded-lg border border-[var(--brand-border)] px-4 py-2 text-sm font-medium text-[var(--brand-text-secondary)] transition hover:bg-[var(--brand-surface)] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving…" : "Submit feedback"}
        </button>
      </form>
    </div>
  );
}
