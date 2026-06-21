import Link from "next/link";
import type { Chapter } from "@/types/chapter";

type ChapterListProps = {
  worldId: string;
  storyId: string;
  chapters: Chapter[];
  continueChapterId?: string;
};

export function ChapterList({
  worldId,
  storyId,
  chapters,
  continueChapterId,
}: ChapterListProps) {
  if (chapters.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 py-8 text-center">
        <p className="text-sm text-[var(--brand-text-secondary)]">No chapters yet.</p>
        <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
          Create your first chapter to start writing your story.
        </p>
      </div>
    );
  }

  return (
    <ol className="divide-y divide-white/[0.06] rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)]">
      {chapters.map((chapter, index) => {
        const isContinue = chapter.id === continueChapterId;

        return (
          <li key={chapter.id}>
            <Link
              href={`/dashboard/worlds/${worldId}/stories/${storyId}/chapters/${chapter.id}`}
              className={`flex items-center gap-3 px-4 py-3 transition hover:bg-[var(--brand-surface)] ${
                isContinue ? "bg-[var(--tag-primary-bg)]" : ""
              }`}
            >
              <span className="w-6 shrink-0 text-xs font-medium tabular-nums text-[var(--brand-text-secondary)]">
                {index + 1}.
              </span>
              <span className="flex min-w-0 flex-1 items-center gap-2">
                <span className="truncate text-sm font-medium text-[var(--brand-text-secondary)] transition hover:text-neutral-600">
                  {chapter.title}
                </span>
                {isContinue && (
                  <span className="shrink-0 rounded-full bg-[var(--tag-primary-bg)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-600">
                    Continue here
                  </span>
                )}
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
