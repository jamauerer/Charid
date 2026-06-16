import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicChapter } from "@/app/actions/chapters";
import { PublicSiteHeader } from "@/components/portfolio/PublicSiteHeader";
import {
  getPublicStoryPath,
  getPublicWorldPath,
} from "@/lib/public-profile";

type PublicChapterPageProps = {
  params: Promise<{ username: string; slug: string; storySlug: string; chapterId: string }>;
};

export default async function PublicChapterPage({
  params,
}: PublicChapterPageProps) {
  const { username, slug: worldSlug, storySlug, chapterId } = await params;
  const { world, story, chapter, profileUsername, error } =
    await getPublicChapter(username, worldSlug, storySlug, chapterId);

  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4 font-sans text-zinc-100">
        <p className="text-sm text-amber-300">{error}</p>
      </div>
    );
  }

  if (!world || !story || !chapter || !profileUsername) {
    notFound();
  }

  return (
    <div className="min-h-dvh bg-background font-sans text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(120,119,198,0.08),transparent)]" />

      <PublicSiteHeader />

      <main className="relative mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <nav className="mb-7 flex flex-wrap items-center gap-1 text-sm text-zinc-500">
          <Link
            href={`/u/${profileUsername}`}
            className="transition hover:text-zinc-300"
          >
            @{profileUsername}
          </Link>
          <span aria-hidden>/</span>
          <Link
            href={getPublicWorldPath(profileUsername, world.slug)}
            className="transition hover:text-zinc-300"
          >
            {world.name}
          </Link>
          <span aria-hidden>/</span>
          <Link
            href={getPublicStoryPath(profileUsername, world.slug, story.slug)}
            className="transition hover:text-zinc-300"
          >
            {story.title}
          </Link>
          <span aria-hidden>/</span>
          <span className="text-zinc-300">{chapter.title}</span>
        </nav>

        <article className="rounded-xl border border-white/[0.06] bg-[#0f0f11] p-5 sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-400/80">
            Chapter
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
            {chapter.title}
          </h1>
          {chapter.content.trim() ? (
            <div className="mt-6 whitespace-pre-wrap text-[15px] leading-relaxed text-zinc-300">
              {chapter.content}
            </div>
          ) : (
            <p className="mt-6 text-sm italic text-zinc-600">
              This chapter has no content yet.
            </p>
          )}
        </article>
      </main>
    </div>
  );
}
