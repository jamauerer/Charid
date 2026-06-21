import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicPortfolio } from "@/app/actions/profile";
import { PublicCharacterCard } from "@/components/portfolio/PublicCharacterCard";
import { PublicWorldCard } from "@/components/portfolio/PublicWorldCard";
import { PublicSiteHeader } from "@/components/portfolio/PublicSiteHeader";
import {
  getPublicBio,
  getPublicDisplayName,
} from "@/lib/public-profile";

type PublicPortfolioPageProps = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ preview?: string }>;
};

export default async function PublicPortfolioPage({
  params,
  searchParams,
}: PublicPortfolioPageProps) {
  const { username } = await params;
  const { preview } = await searchParams;
  const ownerPreview = preview === "1";
  const { data, error, isOwnerPreview } = await getPublicPortfolio(username, {
    ownerPreview,
  });

  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4 font-sans text-[var(--brand-text-secondary)]">
        <p className="text-sm text-[var(--status-info-text)]">{error}</p>
      </div>
    );
  }

  if (!data) {
    notFound();
  }

  const { profile, characters, worlds, avatarUrl, characterPhotos, worldCovers } =
    data;
  const displayName = getPublicDisplayName(profile);
  const bio = getPublicBio(profile);
  const hasCustomBio = Boolean(profile.bio?.trim());

  return (
    <div className="min-h-dvh bg-background font-sans text-[var(--brand-text-secondary)]">
      <div className="pointer-events-none fixed inset-0" />

      <PublicSiteHeader />

      {isOwnerPreview && (
        <div className="relative border-b border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-4 py-3 text-center">
          <p className="text-sm text-[var(--status-info-text)]">
            <span className="font-medium">Preview mode</span> — your portfolio
            is private. Visitors cannot see this page until you publish.
          </p>
          <p className="mt-1 text-xs text-[var(--status-info-text)]">
            Showing only your public worlds and characters, exactly as visitors
            would see after you go live.
          </p>
        </div>
      )}

      <main className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 h-28 w-28 overflow-hidden rounded-full border-2 border-[var(--brand-border)] bg-[var(--studio-empty-fill)] sm:h-32 sm:w-32">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName}
                width={128}
                height={128}
                className="h-full w-full object-cover"
                priority
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-[var(--brand-text-secondary)]">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Character Portfolio
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--brand-text-secondary)] sm:text-3xl">
            {displayName}
          </h1>
          <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">@{profile.username}</p>
          <p
            className={`mx-auto mt-4 max-w-xl text-sm leading-relaxed ${
              hasCustomBio ? "text-[var(--brand-text-secondary)]" : "italic text-[var(--brand-text-secondary)]"
            }`}
          >
            {bio}
          </p>
        </div>

        {worlds.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
              Worlds
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {worlds.map((world) => (
                <PublicWorldCard
                  key={world.id}
                  username={profile.username}
                  world={world}
                  coverUrl={worldCovers[world.id] ?? null}
                />
              ))}
            </div>
          </section>
        )}

        {characters.length === 0 && worlds.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 py-10 text-center">
            <p className="text-sm font-medium text-[var(--brand-text-secondary)]">
              No public content yet
            </p>
            <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
              When this creator publishes worlds and characters, they will appear here.
            </p>
          </div>
        ) : characters.length > 0 ? (
          <>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
              Characters
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {characters.map((character) => (
                <PublicCharacterCard
                  key={character.id}
                  username={profile.username}
                  character={character}
                  photoUrl={characterPhotos[character.id] ?? null}
                />
              ))}
            </div>
          </>
        ) : null}

        <section className="mt-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
            Stories
          </h2>
          <div className="rounded-xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 py-8 text-center">
            <p className="text-sm text-[var(--brand-text-secondary)]">Coming Soon</p>
          </div>
        </section>
      </main>
    </div>
  );
}
