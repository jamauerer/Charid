import Link from "next/link";
import Image from "next/image";
import { redirect, notFound } from "next/navigation";
import {
  getCharacterById,
  getCharacterPhotoUrl,
} from "@/app/actions/characters";
import { CharacterDetailActions } from "./CharacterDetailActions";

type CharacterDetailPageProps = {
  params: Promise<{ id: string }>;
};

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;

  return (
    <div>
      <dt className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm text-zinc-200">{value}</dd>
    </div>
  );
}

export default async function CharacterDetailPage({
  params,
}: CharacterDetailPageProps) {
  const { id } = await params;
  const { character, error } = await getCharacterById(id);

  if (error === "You must be logged in.") {
    redirect("/login");
  }

  if (!character) {
    notFound();
  }

  const photoUrl = await getCharacterPhotoUrl(character.photo_path);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-7 flex items-center justify-between gap-3">
        <Link
          href="/dashboard"
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
          Back to Characters
        </Link>
        <CharacterDetailActions character={character} photoUrl={photoUrl} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
        <div className="mx-auto w-full max-w-[320px] lg:mx-0">
          <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0f0f11]">
            <div className="relative aspect-[4/3] bg-zinc-900">
              {photoUrl ? (
                <Image
                  src={photoUrl}
                  alt={character.name}
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-zinc-600">
                  No photo uploaded
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-[#0f0f11] p-5 sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-400/80">
            Character Profile
          </p>
          <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-zinc-100 sm:text-2xl">
            {character.name}
          </h1>

          <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3.5 sm:grid-cols-3">
            <DetailField label="Gender" value={character.gender} />
            <DetailField label="Age" value={character.age} />
            <DetailField label="Location" value={character.location} />
          </dl>

          <section className="mt-6 border-t border-white/[0.06] pt-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-violet-400">
              Backstory
            </h2>
            {character.backstory ? (
              <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-zinc-300">
                {character.backstory}
              </p>
            ) : (
              <p className="mt-3 text-sm italic text-zinc-600">
                No backstory provided yet.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
