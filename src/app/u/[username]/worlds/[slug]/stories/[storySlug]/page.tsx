import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicStory } from "@/app/actions/stories";
import { getPublicChaptersByStory } from "@/app/actions/chapters";
import { PublicCharacterCard } from "@/components/portfolio/PublicCharacterCard";
import { PublicChapterList } from "@/components/portfolio/PublicChapterList";
import { PublicSiteHeader } from "@/components/portfolio/PublicSiteHeader";
import { StoryGalleryViewer } from "@/components/gallery/StoryGalleryViewer";
import { StoryStatusBadge } from "@/components/StoryStatusBadge";
import { StoryProjectTypeBadge } from "@/components/StoryProjectTypeBadge";
import { getPublicWorldPath } from "@/lib/public-profile";

type PublicStoryPageProps = {
  params: Promise<{ username: string; slug: string; storySlug: string }>;
};

export default async function PublicStoryPage({ params }: PublicStoryPageProps) {
  const { username, slug: worldSlug, storySlug } = await params;
  const { world, story, characters, characterPhotos, images, featuredImageId, profileUsername, error } =
    await getPublicStory(username, worldSlug, storySlug);

  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4 font-sans text-zinc-100">
        <p className="text-sm text-amber-300">{error}</p>
      </div>
    );
  }

  if (!world || !story || !profileUsername) {
    notFound();
  }

  const chapters = await getPublicChaptersByStory(story.id);

  return (
    <div className="min-h-dvh bg-background font-sans text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(120,119,198,0.08),transparent)]" />

      <PublicSiteHeader />

      <main className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
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
          <span className="text-zinc-300">{story.title}</span>
        </nav>

        <div className="mb-10 rounded-xl border border-white/[0.06] bg-[#0f0f11] p-5 sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-400/80">
            Story
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
              {story.title}
            </h1>
            <StoryProjectTypeBadge projectType={story.project_type} />
            <StoryStatusBadge status={story.status} />
          </div>
          {story.summary?.trim() ? (
            <p className="mt-4 max-w-3xl whitespace-pre-wrap text-[15px] leading-relaxed text-zinc-300">
              {story.summary}
            </p>
          ) : (
            <p className="mt-4 text-sm italic text-zinc-600">
              No summary has been shared for this story yet.
            </p>
          )}
        </div>

        {images.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Reference Assets
            </h2>
            <StoryGalleryViewer
              images={images}
              featuredImageId={featuredImageId}
              storyTitle={story.title}
            />
          </section>
        )}

        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Chapters
          </h2>
          <PublicChapterList
            username={profileUsername}
            worldSlug={world.slug}
            storySlug={story.slug}
            chapters={chapters}
          />
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Characters in this Story
          </h2>
          {characters.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-10 text-center">
              <p className="text-sm text-zinc-500">
                No public characters linked to this story yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {characters.map((character) => (
                <PublicCharacterCard
                  key={character.id}
                  username={profileUsername}
                  character={character}
                  photoUrl={characterPhotos[character.id] ?? null}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
