import Image from "next/image";
import Link from "next/link";
import type { StoryWithCounts } from "@/types/story";
import { StoryStatusBadge } from "@/components/StoryStatusBadge";
import { StoryProjectTypeBadge } from "@/components/StoryProjectTypeBadge";

type StoryCardProps = {
  worldId: string;
  story: StoryWithCounts;
  coverUrl?: string | null;
};

export function StoryCard({ worldId, story, coverUrl }: StoryCardProps) {
  return (
    <Link
      href={`/dashboard/worlds/${worldId}/stories/${story.id}`}
      className="block overflow-hidden rounded-xl border border-white/[0.06] bg-[#0f0f11] transition hover:border-white/10 hover:bg-[#111113]"
    >
      <div className="relative aspect-[16/9] bg-zinc-900">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={story.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-950/20 to-zinc-900 text-xs text-zinc-600">
            No cover
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-zinc-100">{story.title}</h3>
          <div className="flex flex-wrap items-center gap-1.5">
            <StoryProjectTypeBadge projectType={story.project_type} />
            <StoryStatusBadge status={story.status} />
          </div>
        </div>
        {story.summary ? (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-400">
            {story.summary}
          </p>
        ) : (
          <p className="mt-2 text-xs italic text-zinc-600">No summary yet</p>
        )}
        <p className="mt-3 text-[11px] text-zinc-500">
          {story.character_count}{" "}
          {story.character_count === 1 ? "character" : "characters"}
        </p>
      </div>
    </Link>
  );
}
