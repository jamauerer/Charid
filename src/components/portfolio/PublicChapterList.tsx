import Link from "next/link";
import type { Chapter } from "@/types/chapter";
import { getPublicChapterPath } from "@/lib/public-profile";

type PublicChapterListProps = {
  username: string;
  worldSlug: string;
  storySlug: string;
  chapters: Chapter[];
};

export function PublicChapterList({
  username,
  worldSlug,
  storySlug,
  chapters,
}: PublicChapterListProps) {
  if (chapters.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 py-8 text-center">
        <p className="text-sm text-[var(--brand-text-secondary)]">No chapters published yet.</p>
      </div>
    );
  }

  return (
    <ol className="divide-y divide-white/[0.06] rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)]">
      {chapters.map((chapter, index) => (
        <li key={chapter.id}>
          <Link
            href={getPublicChapterPath(
              username,
              worldSlug,
              storySlug,
              chapter.id
            )}
            className="flex items-center gap-3 px-4 py-3 transition hover:bg-[var(--brand-surface)]"
          >
            <span className="w-6 shrink-0 text-xs font-medium tabular-nums text-[var(--brand-text-secondary)]">
              {index + 1}.
            </span>
            <span className="text-sm font-medium text-[var(--brand-text-secondary)] transition hover:text-neutral-600">
              {chapter.title}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
