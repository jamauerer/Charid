import Image from "next/image";
import Link from "next/link";
import type { StoryWithCounts } from "@/types/story";
import { StoryStatusBadge } from "@/components/StoryStatusBadge";
import { StoryProjectTypeBadge } from "@/components/StoryProjectTypeBadge";
import { CardCoverPlaceholder } from "@/components/studio/CardCoverPlaceholder";
import { studioCardSurface } from "@/lib/visual-identity";

type StoryCardProps = {
  worldId: string;
  story: StoryWithCounts;
  coverUrl?: string | null;
};

export function StoryCard({ worldId, story, coverUrl }: StoryCardProps) {
  return (
    <Link
      href={`/dashboard/worlds/${worldId}/stories/${story.id}`}
      className={`block ${studioCardSurface}`}
    >
      <div className="relative aspect-video overflow-hidden bg-[var(--studio-empty-fill)]">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={story.title}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <CardCoverPlaceholder title="No cover yet" />
        )}
      </div>
      <div className="px-2.5 py-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-sm font-medium text-[var(--foreground)]">
            {story.title}
          </h3>
          <div className="flex shrink-0 items-center gap-1">
            <StoryProjectTypeBadge projectType={story.project_type} />
            <StoryStatusBadge status={story.status} />
          </div>
        </div>
        {story.summary && (
          <p className="mt-1 line-clamp-1 text-[11px] text-[var(--brand-text-muted)]">
            {story.summary}
          </p>
        )}
      </div>
    </Link>
  );
}
