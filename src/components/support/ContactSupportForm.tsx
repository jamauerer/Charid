"use client";

import { useActionState, useEffect, useState } from "react";
import {
  submitSupportTicket,
  type SupportActionState,
} from "@/app/actions/support";
import { selectClassName, inputClassName } from "@/components/CharacterFormFields";
import {
  SUPPORT_CATEGORIES,
  SUPPORT_CATEGORY_LABELS,
} from "@/types/support-ticket";

const labelClassName =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--brand-text-secondary)]";

const initialState: SupportActionState = {};

export function ContactSupportForm() {
  const [state, formAction, pending] = useActionState(
    submitSupportTicket,
    initialState
  );
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (state.success) {
      setSubmitted(true);
    }
  }, [state.success]);

  if (submitted && state.success) {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5">
        <p className="text-sm font-medium text-emerald-300">
          Support ticket submitted.
        </p>
        <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">
          We received your message and will review it soon. You can submit
          another ticket if needed.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-4 text-sm font-medium text-neutral-500 transition hover:text-neutral-600"
        >
          Submit another ticket
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="support-subject" className={labelClassName}>
          Subject
        </label>
        <input
          id="support-subject"
          name="subject"
          type="text"
          required
          maxLength={200}
          className={inputClassName}
          placeholder="Brief summary of your issue"
        />
      </div>

      <div>
        <label htmlFor="support-category" className={labelClassName}>
          Category
        </label>
        <select
          id="support-category"
          name="category"
          required
          defaultValue=""
          className={selectClassName}
        >
          <option value="" disabled>
            Select a category…
          </option>
          {SUPPORT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {SUPPORT_CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="support-message" className={labelClassName}>
          Message
        </label>
        <textarea
          id="support-message"
          name="message"
          rows={6}
          required
          maxLength={5000}
          className={inputClassName}
          placeholder="Describe what happened, what you expected, and steps to reproduce if applicable."
        />
      </div>

      <div>
        <label htmlFor="support-screenshot" className={labelClassName}>
          Screenshot (optional)
        </label>
        <input
          id="support-screenshot"
          name="screenshot"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="w-full text-sm text-[var(--brand-text-secondary)] file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-violet-600/20 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-neutral-600"
        />
        <p className="mt-1.5 text-xs text-[var(--brand-text-secondary)]">
          JPEG, PNG, or WebP up to 5 MB
        </p>
      </div>

      {state.error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-[var(--status-danger-text)]">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-gradient-to-r bg-[var(--brand-accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--brand-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit ticket"}
      </button>
    </form>
  );
}
