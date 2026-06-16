import Link from "next/link";
import type { StoryWithCounts } from "@/types/story";
import { getPublicStoryPath } from "@/lib/public-profile";
import { StoryStatusBadge } from "@/components/StoryStatusBadge";

type PublicStoryCardProps = {
  username: string;
  worldSlug: string;
  story: StoryWithCounts;
};

export function PublicStoryCard({
  username,
  worldSlug,
  story,
}: PublicStoryCardProps) {
  const href = getPublicStoryPath(username, worldSlug, story.slug);

  return (
    <Link
      href={href}
      className="block rounded-xl border border-white/[0.06] bg-[#0f0f11] p-4 transition hover:border-white/10 hover:bg-[#111113]"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-zinc-100">{story.title}</h3>
        <StoryStatusBadge status={story.status} />
      </div>
      {story.summary ? (
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-400">
          {story.summary}
        </p>
      ) : (
        <p className="mt-2 text-xs italic text-zinc-600">No summary shared</p>
      )}
      <p className="mt-3 text-[11px] text-zinc-500">
        {story.character_count}{" "}
        {story.character_count === 1 ? "character" : "characters"}
      </p>
    </Link>
  );
}
