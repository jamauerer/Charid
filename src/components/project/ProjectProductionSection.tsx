import type { ProjectStoryEntry } from "@/app/actions/projects";
import {
  PROJECT_WORK_INTENT_LABELS,
  type ProjectWorkIntent,
} from "@/types/project";
import { STORY_PROJECT_TYPE_LABELS } from "@/types/story";

type ProjectProductionSectionProps = {
  workIntent: ProjectWorkIntent | null;
  stories: ProjectStoryEntry[];
};

export function ProjectProductionSection({
  workIntent,
  stories,
}: ProjectProductionSectionProps) {
  const intentLabel = workIntent
    ? PROJECT_WORK_INTENT_LABELS[workIntent]
    : "Not set";

  const storyFormats = [
    ...new Set(stories.map(({ story }) => story.project_type)),
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
          Production status
        </h3>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-[var(--brand-text-muted)]">Project format</dt>
            <dd className="font-medium text-[var(--foreground)]">{intentLabel}</dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-[var(--brand-text-muted)]">Story formats</dt>
            <dd className="font-medium text-[var(--foreground)]">
              {storyFormats.length === 0
                ? "No stories yet"
                : storyFormats
                    .map((type) => STORY_PROJECT_TYPE_LABELS[type])
                    .join(", ")}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-xs leading-relaxed text-[var(--brand-text-muted)]">
          Production tools — comic pages, picture-book spreads, screenplay sluglines,
          and panel layouts — will ship in a later phase. Scenes and timeline remain
          your working spine until then.
        </p>
      </div>
    </div>
  );
}
