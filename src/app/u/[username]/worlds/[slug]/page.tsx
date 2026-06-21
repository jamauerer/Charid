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
    <section className="rounded-xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 py-8 text-center">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
        {title}
      </h2>
      <p className="mt-2 text-sm text-[var(--brand-text-secondary)]">Coming Soon</p>
    </section>
  );
}

export default async function PublicWorldPage({ params }: PublicWorldPageProps) {
  const { username, slug } = await params;
  const { world, coverUrl, stories, storyCoverUrls, characters, characterPhotos, profileUsername, error } =
    await getPublicWorld(username, slug);

  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4 font-sans text-[var(--brand-text-secondary)]">
        <p className="text-sm text-[var(--status-info-text)]">{error}</p>
      </div>
    );
  }

  if (!world || !profileUsername) {
    notFound();
  }

  return (
    <div className="min-h-dvh bg-background font-sans text-[var(--brand-text-secondary)]">
      <div className="pointer-events-none fixed inset-0" />

      <PublicSiteHeader />

      <main className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-7">
          <Link
            href={`/u/${profileUsername}`}
            className="inline-flex items-center gap-1 text-sm text-[var(--brand-text-secondary)] transition hover:text-[var(--brand-text-secondary)]"
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

        <div className="mb-10 overflow-hidden rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)]">
          <div className="relative aspect-[21/9] bg-[var(--studio-empty-fill)] sm:aspect-[3/1]">
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
              <div className="flex h-full items-center justify-center bg-[var(--studio-empty-fill)] text-sm text-[var(--brand-text-secondary)]">
                No cover yet
              </div>
            )}
          </div>
          <div className="p-5 sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
              World
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--brand-text-secondary)] sm:text-3xl">
              {world.name}
            </h1>
            {world.description?.trim() ? (
              <p className="mt-4 max-w-3xl whitespace-pre-wrap text-[15px] leading-relaxed text-[var(--brand-text-secondary)]">
                {world.description}
              </p>
            ) : (
              <p className="mt-4 text-sm italic text-[var(--brand-text-secondary)]">
                No description has been shared for this world yet.
              </p>
            )}
          </div>
        </div>

        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
            Stories
          </h2>
          {stories.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 py-8 text-center">
              <p className="text-sm text-[var(--brand-text-secondary)]">No stories in this world yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {stories.map((story) => (
                <PublicStoryCard
                  key={story.id}
                  username={profileUsername}
                  worldSlug={world.slug}
                  story={story}
                  coverUrl={storyCoverUrls[story.id] ?? null}
                />
              ))}
            </div>
          )}
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
            Characters
          </h2>
          {characters.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 py-10 text-center">
              <p className="text-sm text-[var(--brand-text-secondary)]">
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
