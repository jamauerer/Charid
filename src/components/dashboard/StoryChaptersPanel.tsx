import Link from "next/link";
import type { Chapter } from "@/types/chapter";
import { ChapterList } from "@/components/ChapterList";
import { NewChapterModal } from "@/app/dashboard/NewChapterModal";
import { CREATOR_STORY } from "@/lib/creator-vocabulary";
import { studioBtnSecondary } from "@/lib/visual-identity";

type StoryChaptersPanelProps = {
  worldId: string;
  storyId: string;
  chapters: Chapter[];
  continueChapter: Chapter | null;
};

export function StoryChaptersPanel({
  worldId,
  storyId,
  chapters,
  continueChapter,
}: StoryChaptersPanelProps) {
  const continueHref = continueChapter
    ? `/dashboard/worlds/${worldId}/stories/${storyId}/chapters/${continueChapter.id}`
    : null;

  return (
    <section
      id="story-chapters"
      aria-labelledby="story-chapters-heading"
      className="mb-10 scroll-mt-6"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            id="story-chapters-heading"
            className="text-sm font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]"
          >
            Chapters
          </h2>
          <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
            {CREATOR_STORY.chaptersHint}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {continueHref && (
            <Link
              href={continueHref}
              className={studioBtnSecondary}
            >
              Continue writing
            </Link>
          )}
          <NewChapterModal
            worldId={worldId}
            storyId={storyId}
            triggerLabel={CREATOR_STORY.createNextChapterLabel}
          />
        </div>
      </div>
      <ChapterList
        worldId={worldId}
        storyId={storyId}
        chapters={chapters}
        continueChapterId={continueChapter?.id}
      />
    </section>
  );
}
