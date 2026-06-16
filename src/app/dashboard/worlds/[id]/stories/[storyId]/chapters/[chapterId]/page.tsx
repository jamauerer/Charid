import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getChapterById } from "@/app/actions/chapters";
import { getStoryById } from "@/app/actions/stories";
import { getWorldById } from "@/app/actions/worlds";
import { ChapterEditorForm } from "@/app/dashboard/ChapterEditorForm";

type ChapterEditorPageProps = {
  params: Promise<{ id: string; storyId: string; chapterId: string }>;
};

export default async function ChapterEditorPage({
  params,
}: ChapterEditorPageProps) {
  const { id: worldId, storyId, chapterId } = await params;

  const { world, error: worldError } = await getWorldById(worldId);
  if (worldError === "You must be logged in.") {
    redirect("/login");
  }
  if (!world) {
    notFound();
  }

  const { story, error: storyError } = await getStoryById(worldId, storyId);
  if (!story) {
    notFound();
  }
  if (storyError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-amber-300">
        {storyError}
      </div>
    );
  }

  const { chapter, error: chapterError } = await getChapterById(
    storyId,
    chapterId
  );
  if (!chapter) {
    notFound();
  }
  if (chapterError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-amber-300">
        {chapterError}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6">
        <Link
          href={`/dashboard/worlds/${worldId}/stories/${storyId}`}
          className="inline-flex items-center gap-1 text-sm text-zinc-400 transition hover:text-zinc-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
              clipRule="evenodd"
            />
          </svg>
          Back to {story.title}
        </Link>
      </div>

      <div className="mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-400/80">
          Chapter
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-zinc-100">
          {chapter.title}
        </h1>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-[#0f0f11] p-5 sm:p-6">
        <ChapterEditorForm
          chapter={chapter}
          storyId={storyId}
          worldId={worldId}
        />
      </div>
    </div>
  );
}
