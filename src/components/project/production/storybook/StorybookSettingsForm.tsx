"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { upsertStorybookSettings } from "@/app/actions/production/storybook";
import type { StorybookSettings } from "@/types/production/storybook";
import { studioBtnPrimarySm } from "@/lib/visual-identity";

type StorybookSettingsFormProps = {
  projectId: string;
  settings: StorybookSettings | null;
};

export function StorybookSettingsForm({
  projectId,
  settings,
}: StorybookSettingsFormProps) {
  const router = useRouter();
  const [ageRange, setAgeRange] = useState(settings?.age_range ?? "");
  const [readingLevel, setReadingLevel] = useState(settings?.reading_level ?? "");
  const [educationalGoals, setEducationalGoals] = useState(
    settings?.educational_goals ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      setError(null);
      setSaved(false);
      const result = await upsertStorybookSettings(projectId, {
        age_range: ageRange,
        reading_level: readingLevel,
        educational_goals: educationalGoals,
      });
      if (result.error) {
        setError(result.error);
      } else {
        setSaved(true);
        router.refresh();
      }
    });
  }

  return (
    <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
        Book settings
      </h3>
      <p className="mt-1 text-xs text-[var(--brand-text-muted)]">
        Configuration for your storybook — not a production unit.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <label
            htmlFor="storybook-age-range"
            className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-muted)]"
          >
            Age range
          </label>
          <input
            id="storybook-age-range"
            type="text"
            value={ageRange}
            onChange={(event) => setAgeRange(event.target.value)}
            placeholder="e.g. 3–5 years"
            className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="storybook-reading-level"
            className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-muted)]"
          >
            Reading level
          </label>
          <input
            id="storybook-reading-level"
            type="text"
            value={readingLevel}
            onChange={(event) => setReadingLevel(event.target.value)}
            placeholder="e.g. Early reader"
            className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="storybook-educational-goals"
            className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-muted)]"
          >
            Educational goals
          </label>
          <textarea
            id="storybook-educational-goals"
            value={educationalGoals}
            onChange={(event) => setEducationalGoals(event.target.value)}
            rows={4}
            placeholder="What should young readers learn or feel?"
            className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] px-3 py-2 text-sm"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] px-3 py-2 text-sm text-[var(--status-danger-text)]">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className={studioBtnPrimarySm}
          >
            Save settings
          </button>
          {saved && (
            <span className="text-xs text-[var(--brand-text-muted)]">Saved</span>
          )}
        </div>
      </div>
    </div>
  );
}
