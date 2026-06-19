import Link from "next/link";
import type { CharacterStoryEntry } from "@/app/actions/stories";
import { StoryStatusBadge } from "@/components/StoryStatusBadge";

type CharacterStoriesSectionProps = {
  entries: CharacterStoryEntry[];
  embedded?: boolean;
};

export function CharacterStoriesSection({
  entries,
  embedded = false,
}: CharacterStoriesSectionProps) {
  const sectionClass = embedded
    ? "space-y-3"
    : "mt-6 border-t border-[var(--brand-border)] pt-5";
  if (entries.length === 0) {
    return (
      <section className={sectionClass}>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Appears In Stories
        </h2>
        <p className="mt-3 text-sm italic text-[var(--brand-text-secondary)]">
          This character is not linked to any stories yet.
        </p>
      </section>
    );
  }

  return (
    <section className={sectionClass}>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
        Appears In Stories
      </h2>
      <ul className="mt-3 space-y-2">
        {entries.map(({ story, worldId }) => (
          <li key={story.id}>
            <Link
              href={`/dashboard/worlds/${worldId}/stories/${story.id}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2.5 transition hover:border-[var(--brand-border)] hover:bg-[var(--brand-surface)]"
            >
              <span className="text-sm font-medium text-[var(--brand-text-secondary)]">
                {story.title}
              </span>
              <StoryStatusBadge status={story.status} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
