import { StoryCard } from "@/components/StoryCard";
import { StudioEmptyState } from "@/components/studio/StudioEmptyState";
import type { ProjectStoryEntry } from "@/app/actions/projects";
import { STUDIO_EMPTY_COPY } from "@/lib/studio-empty-copy";

type ProjectStoriesSectionProps = {
  entries: ProjectStoryEntry[];
};

export function ProjectStoriesSection({ entries }: ProjectStoriesSectionProps) {
  if (entries.length === 0) {
    return (
      <StudioEmptyState
        headline={STUDIO_EMPTY_COPY.story.headline}
        description={STUDIO_EMPTY_COPY.story.description}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map(({ story, world, coverUrl }) => (
        <div key={story.id} className="space-y-2">
          <StoryCard worldId={world.id} story={story} coverUrl={coverUrl} />
          <p className="text-xs text-[var(--brand-text-secondary)]">
            in{" "}
            <a
              href={`/dashboard/worlds/${world.id}`}
                className="text-[var(--foreground)] transition hover:text-[var(--brand-ui-accent)]"
            >
              {world.name}
            </a>
          </p>
        </div>
      ))}
    </div>
  );
}
