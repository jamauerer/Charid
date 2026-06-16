import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicWorld } from "@/app/actions/worlds";
import { PublicCharacterCard } from "@/components/portfolio/PublicCharacterCard";
import { PublicStoryCard } from "@/components/portfolio/PublicStoryCard";
import { PublicSiteHeader } from "@/components/portfolio/PublicSiteHeader";

type PublicWorldPageProps = {
  params: Promise<{ username: string; slug: string }>;
};

function ComingSoonSection({ title }: { title: string }) {
  return (
    <section className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-center">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
        {title}
      </h2>
      <p className="mt-2 text-sm text-zinc-600">Coming Soon</p>
    </section>
  );
}

export default async function PublicWorldPage({ params }: PublicWorldPageProps) {
  const { username, slug } = await params;
  const { world, coverUrl, stories, characters, characterPhotos, profileUsername, error } =
    await getPublicWorld(username, slug);

  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4 font-sans text-zinc-100">
        <p className="text-sm text-amber-300">{error}</p>
      </div>
    );
  }

  if (!world || !profileUsername) {
    notFound();
  }

  return (
    <div className="min-h-dvh bg-background font-sans text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(120,119,198,0.08),transparent)]" />

      <PublicSiteHeader />

      <main className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-7">
          <Link
            href={`/u/${profileUsername}`}
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
            Back to @{profileUsername}
          </Link>
        </div>

        <div className="mb-10 overflow-hidden rounded-xl border border-white/[0.06] bg-[#0f0f11]">
          <div className="relative aspect-[21/9] bg-zinc-900 sm:aspect-[3/1]">
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt={world.name}
                fill
                className="object-cover"
                priority
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-violet-950/30 to-zinc-900 text-sm text-zinc-600">
                No cover image
              </div>
            )}
          </div>
          <div className="p-5 sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-400/80">
              World
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
              {world.name}
            </h1>
            {world.description?.trim() ? (
              <p className="mt-4 max-w-3xl whitespace-pre-wrap text-[15px] leading-relaxed text-zinc-300">
                {world.description}
              </p>
            ) : (
              <p className="mt-4 text-sm italic text-zinc-600">
                No description has been shared for this world yet.
              </p>
            )}
          </div>
        </div>

        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Stories
          </h2>
          {stories.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-center">
              <p className="text-sm text-zinc-500">No stories in this world yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {stories.map((story) => (
                <PublicStoryCard
                  key={story.id}
                  username={profileUsername}
                  worldSlug={world.slug}
                  story={story}
                />
              ))}
            </div>
          )}
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Characters
          </h2>
          {characters.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-10 text-center">
              <p className="text-sm text-zinc-500">
                No public characters in this world yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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

        <div className="grid gap-4 sm:grid-cols-2">
          <ComingSoonSection title="Locations" />
          <ComingSoonSection title="Media" />
        </div>
      </main>
    </div>
  );
}
