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
      <dt className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-zinc-200">{value}</dd>
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
    <div className="relative min-h-dvh bg-background font-sans text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(120,119,198,0.15),transparent)]" />

      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href="/dashboard"
            className="text-sm text-zinc-400 transition hover:text-zinc-200"
          >
            ← Back to dashboard
          </Link>
          <CharacterDetailActions character={character} photoUrl={photoUrl} />
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-3xl px-4 py-5 pb-10 sm:px-6 sm:py-6 sm:pb-12">
        <div className="rounded-xl border border-white/[0.08] bg-[#111113]">
          <div className="relative overflow-hidden rounded-t-xl aspect-[16/9] bg-zinc-900 sm:aspect-[21/9]">
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
            <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-400/90">
                Character Profile
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {character.name}
              </h1>
            </div>
          </div>

          <div className="space-y-6 p-5 sm:p-6">
            <dl className="grid gap-4 sm:grid-cols-3">
              <DetailField label="Gender" value={character.gender} />
              <DetailField label="Age" value={character.age} />
              <DetailField label="Location" value={character.location} />
            </dl>

            {character.backstory ? (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-violet-400/80">
                  Backstory
                </h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                  {character.backstory}
                </p>
              </section>
            ) : (
              <p className="text-sm italic text-zinc-600">
                No backstory provided yet.
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
