import Link from "next/link";
import Image from "next/image";
import { redirect, notFound } from "next/navigation";
import {
  getCharacterPhotoUrl,
} from "@/app/actions/characters";
import {
  getCharactersByWorldId,
  getWorldById,
  getWorldCoverUrl,
} from "@/app/actions/worlds";
import { WorldCharactersSection } from "./WorldCharactersSection";

type WorldDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function WorldDetailPage({ params }: WorldDetailPageProps) {
  const { id } = await params;
  const { world, error } = await getWorldById(id);

  if (error === "You must be logged in.") {
    redirect("/login");
  }

  if (!world) {
    notFound();
  }

  const coverUrl = await getWorldCoverUrl(world.cover_image_path);
  const { characters } = await getCharactersByWorldId(id);

  const charactersWithPhotos = await Promise.all(
    characters.map(async (character) => ({
      character,
      photoUrl: await getCharacterPhotoUrl(character.photo_path),
    }))
  );

  return (
    <div className="mx-auto w-full max-w-[1280px]">
      <div className="mb-6">
        <Link
          href="/dashboard/worlds"
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
          Back to Worlds
        </Link>
      </div>

      <div className="mb-8 overflow-hidden rounded-xl border border-white/[0.06] bg-[#0f0f11]">
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
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-400/80">
                World
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-zinc-100">
                {world.name}
              </h1>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                world.is_public
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-zinc-500/15 text-zinc-400"
              }`}
            >
              {world.is_public ? "Public" : "Private"}
            </span>
          </div>
          {world.description ? (
            <p className="mt-4 max-w-3xl whitespace-pre-wrap text-[15px] leading-relaxed text-zinc-300">
              {world.description}
            </p>
          ) : (
            <p className="mt-4 text-sm italic text-zinc-600">
              No description yet.
            </p>
          )}
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Characters in this World
        </h2>
        <WorldCharactersSection initialCharacters={charactersWithPhotos} />
      </section>
    </div>
  );
}
