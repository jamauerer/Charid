import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicCharacter } from "@/app/actions/profile";
import { CharacterGalleryViewer } from "@/components/gallery/CharacterGalleryViewer";
import { PublicSiteHeader } from "@/components/portfolio/PublicSiteHeader";
import { getPublicDisplayName } from "@/lib/public-profile";

type PublicCharacterPageProps = {
  params: Promise<{ username: string; id: string }>;
};

function DetailField({
  label,
  value,
  placeholder,
}: {
  label: string;
  value: string | null | undefined;
  placeholder?: string;
}) {
  const display = value?.trim() || placeholder;
  if (!display) return null;

  return (
    <div>
      <dt className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </dt>
      <dd
        className={`mt-0.5 text-sm ${
          value?.trim() ? "text-zinc-200" : "italic text-zinc-600"
        }`}
      >
        {display}
      </dd>
    </div>
  );
}

export default async function PublicCharacterPage({
  params,
}: PublicCharacterPageProps) {
  const { username, id } = await params;
  const { data, error } = await getPublicCharacter(username, id);

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

  const { profile, character, photoUrl, images, featuredImageId } = data;
  const creatorName = getPublicDisplayName(profile);

  return (
    <div className="min-h-dvh bg-background font-sans text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(120,119,198,0.08),transparent)]" />

      <PublicSiteHeader />

      <main className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-7 flex items-center justify-between gap-3">
          <Link
            href={`/u/${profile.username}`}
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
            Back to @{profile.username}
          </Link>
          <p className="truncate text-xs text-zinc-500">
            by{" "}
            <Link
              href={`/u/${profile.username}`}
              className="text-zinc-400 transition hover:text-zinc-200"
            >
              {creatorName}
            </Link>
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:items-start">
          <div className="mx-auto w-full max-w-[420px] lg:mx-0">
            <CharacterGalleryViewer
              images={images}
              featuredImageId={featuredImageId}
              characterName={character.name}
              fallbackPhotoUrl={photoUrl}
            />
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-[#0f0f11] p-5 sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-400/80">
              Character Profile
            </p>
            <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
              {character.name}
            </h1>

            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3.5 sm:grid-cols-3">
              <DetailField
                label="Gender"
                value={character.gender}
                placeholder="Not specified"
              />
              <DetailField
                label="Age"
                value={character.age}
                placeholder="Not specified"
              />
              <DetailField
                label="Location"
                value={character.location}
                placeholder="Not specified"
              />
            </dl>

            <section className="mt-6 border-t border-white/[0.06] pt-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                Backstory
              </h2>
              {character.backstory?.trim() ? (
                <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-zinc-300">
                  {character.backstory}
                </p>
              ) : (
                <p className="mt-3 text-sm italic text-zinc-600">
                  No backstory has been shared for this character yet.
                </p>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
