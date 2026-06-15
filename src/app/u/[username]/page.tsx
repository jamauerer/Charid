import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicPortfolio } from "@/app/actions/profile";
import { PublicCharacterCard } from "@/components/portfolio/PublicCharacterCard";

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

  const { profile, characters, avatarUrl, characterPhotos } = data;
  const displayName = profile.display_name ?? profile.username;

  return (
    <div className="min-h-dvh bg-background font-sans text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(120,119,198,0.08),transparent)]" />

      <header className="relative border-b border-white/[0.06] bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white">
              C
            </div>
            <span className="text-sm font-semibold text-zinc-200">CharID</span>
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.04] hover:text-zinc-200"
          >
            Sign in
          </Link>
        </div>
      </header>

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
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
            {displayName}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">@{profile.username}</p>
          {profile.bio && (
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-400">
              {profile.bio}
            </p>
          )}
        </div>

        {characters.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-10 text-center">
            <p className="text-sm text-zinc-500">
              No public characters yet.
            </p>
          </div>
        ) : (
          <>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Characters
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {characters.map((character) => (
                <PublicCharacterCard
                  key={character.id}
                  character={character}
                  photoUrl={characterPhotos[character.id] ?? null}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
