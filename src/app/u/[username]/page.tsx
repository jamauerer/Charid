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
};

export default async function PublicPortfolioPage({
  params,
}: PublicPortfolioPageProps) {
  const { username } = await params;
  const { data, error } = await getPublicPortfolio(username);

  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4 font-sans text-zinc-100">
        <p className="text-sm text-amber-300">{error}</p>
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
    <div className="min-h-dvh bg-background font-sans text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(120,119,198,0.08),transparent)]" />

      <PublicSiteHeader />

      <main className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 h-28 w-28 overflow-hidden rounded-full border-2 border-white/10 bg-zinc-900 sm:h-32 sm:w-32">
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
              <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-zinc-600">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-400/80">
            Character Portfolio
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
            {displayName}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">@{profile.username}</p>
          <p
            className={`mx-auto mt-4 max-w-xl text-sm leading-relaxed ${
              hasCustomBio ? "text-zinc-400" : "italic text-zinc-600"
            }`}
          >
            {bio}
          </p>
        </div>

        {worlds.length > 0 && (
          <section className="mb-10">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
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
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-10 text-center">
            <p className="text-sm font-medium text-zinc-400">
              No public content yet
            </p>
            <p className="mt-1 text-xs text-zinc-600">
              When this creator publishes worlds and characters, they will appear here.
            </p>
          </div>
        ) : characters.length > 0 ? (
          <>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
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
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Stories
          </h2>
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-center">
            <p className="text-sm text-zinc-600">Coming Soon</p>
          </div>
        </section>
      </main>
    </div>
  );
}
