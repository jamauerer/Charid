import Image from "next/image";
import Link from "next/link";
import type { StoryWithCounts } from "@/types/story";
import { getPublicStoryPath } from "@/lib/public-profile";
import { StoryStatusBadge } from "@/components/StoryStatusBadge";
import { StoryProjectTypeBadge } from "@/components/StoryProjectTypeBadge";

type PublicStoryCardProps = {
  username: string;
  worldSlug: string;
  story: StoryWithCounts;
  coverUrl?: string | null;
};

export function PublicStoryCard({
  username,
  worldSlug,
  story,
  coverUrl,
}: PublicStoryCardProps) {
  const href = getPublicStoryPath(username, worldSlug, story.slug);

  return (
    <Link
      href={href}
      className="block overflow-hidden rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] transition hover:border-[var(--brand-border)] hover:bg-[#111113]"
    >
      <div className="relative aspect-[16/9] bg-[var(--studio-empty-fill)]">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={story.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-950/20 to-zinc-900 text-xs text-[var(--brand-text-secondary)]">
            No cover
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-[var(--brand-text-secondary)]">{story.title}</h3>
          <div className="flex flex-wrap items-center gap-1.5">
            <StoryProjectTypeBadge projectType={story.project_type} />
            <StoryStatusBadge status={story.status} />
          </div>
        </div>
        {story.summary ? (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[var(--brand-text-secondary)]">
            {story.summary}
          </p>
        ) : (
          <p className="mt-2 text-xs italic text-[var(--brand-text-secondary)]">No summary shared</p>
        )}
        <p className="mt-3 text-[11px] text-[var(--brand-text-secondary)]">
          {story.character_count}{" "}
          {story.character_count === 1 ? "character" : "characters"}
        </p>
      </div>
    </Link>
  );
}
