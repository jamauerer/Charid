import Link from "next/link";
import type { Chapter } from "@/types/chapter";

type ChapterListProps = {
  worldId: string;
  storyId: string;
  chapters: Chapter[];
};

export function ChapterList({ worldId, storyId, chapters }: ChapterListProps) {
  if (chapters.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-center">
        <p className="text-sm text-zinc-500">No chapters yet.</p>
        <p className="mt-1 text-xs text-zinc-600">
          Create a chapter to start writing.
        </p>
      </div>
    );
  }

  return (
    <ol className="divide-y divide-white/[0.06] rounded-xl border border-white/[0.06] bg-[#0f0f11]">
      {chapters.map((chapter, index) => (
        <li key={chapter.id}>
          <Link
            href={`/dashboard/worlds/${worldId}/stories/${storyId}/chapters/${chapter.id}`}
            className="flex items-center gap-3 px-4 py-3 transition hover:bg-white/[0.03]"
          >
            <span className="w-6 shrink-0 text-xs font-medium tabular-nums text-zinc-600">
              {index + 1}.
            </span>
            <span className="text-sm font-medium text-zinc-200 transition hover:text-violet-300">
              {chapter.title}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
