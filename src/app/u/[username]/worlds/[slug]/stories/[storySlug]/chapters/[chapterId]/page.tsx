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
      <div className="flex min-h-dvh items-center justify-center bg-background px-4 font-sans text-[var(--brand-text-secondary)]">
        <p className="text-sm text-[var(--status-info-text)]">{error}</p>
      </div>
    );
  }

  if (!world || !story || !chapter || !profileUsername) {
    notFound();
  }

  return (
    <div className="min-h-dvh bg-background font-sans text-[var(--brand-text-secondary)]">
      <div className="pointer-events-none fixed inset-0" />

      <PublicSiteHeader />

      <main className="relative mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <nav className="mb-7 flex flex-wrap items-center gap-1 text-sm text-[var(--brand-text-secondary)]">
          <Link
            href={`/u/${profileUsername}`}
            className="transition hover:text-[var(--brand-text-secondary)]"
          >
            @{profileUsername}
          </Link>
          <span aria-hidden>/</span>
          <Link
            href={getPublicWorldPath(profileUsername, world.slug)}
            className="transition hover:text-[var(--brand-text-secondary)]"
          >
            {world.name}
          </Link>
          <span aria-hidden>/</span>
          <Link
            href={getPublicStoryPath(profileUsername, world.slug, story.slug)}
            className="transition hover:text-[var(--brand-text-secondary)]"
          >
            {story.title}
          </Link>
          <span aria-hidden>/</span>
          <span className="text-[var(--brand-text-secondary)]">{chapter.title}</span>
        </nav>

        <article className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Chapter
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--brand-text-secondary)] sm:text-3xl">
            {chapter.title}
          </h1>
          {chapter.content.trim() ? (
            <div className="mt-6 whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--brand-text-secondary)]">
              {chapter.content}
            </div>
          ) : (
            <p className="mt-6 text-sm italic text-[var(--brand-text-secondary)]">
              This chapter has no content yet.
            </p>
          )}
        </article>
      </main>
    </div>
  );
}
