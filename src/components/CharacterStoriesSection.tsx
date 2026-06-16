import Link from "next/link";
import type { CharacterStoryEntry } from "@/app/actions/stories";
import { StoryStatusBadge } from "@/components/StoryStatusBadge";

type CharacterStoriesSectionProps = {
  entries: CharacterStoryEntry[];
};

export function CharacterStoriesSection({
  entries,
}: CharacterStoriesSectionProps) {
  if (entries.length === 0) {
    return (
      <section className="mt-6 border-t border-white/[0.06] pt-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-violet-400">
          Appears In Stories
        </h2>
        <p className="mt-3 text-sm italic text-zinc-600">
          This character is not linked to any stories yet.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-6 border-t border-white/[0.06] pt-5">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-violet-400">
        Appears In Stories
      </h2>
      <ul className="mt-3 space-y-2">
        {entries.map(({ story, worldId }) => (
          <li key={story.id}>
            <Link
              href={`/dashboard/worlds/${worldId}/stories/${story.id}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 transition hover:border-white/10 hover:bg-white/[0.04]"
            >
              <span className="text-sm font-medium text-zinc-200">
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
