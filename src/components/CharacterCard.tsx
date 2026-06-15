"use client";

import { useState } from "react";
import Image from "next/image";
import { deleteCharacter } from "@/app/actions/characters";
import type { Character } from "@/types/character";

type CharacterCardProps = {
  character: Character;
  photoUrl: string | null;
  onDeleted: (characterId: string) => void;
};

export function CharacterCard({
  character,
  photoUrl,
  onDeleted,
}: CharacterCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createdDate = new Date(character.created_at).toLocaleDateString(
    undefined,
    { year: "numeric", month: "short", day: "numeric" }
  );

  async function handleDelete() {
    setDeleting(true);
    setError(null);

    const result = await deleteCharacter(character.id);

    if (result.error) {
      setError(result.error);
      setDeleting(false);
      return;
    }

    onDeleted(character.id);
    setShowModal(false);
    setDeleting(false);
  }

  return (
    <>
      <article className="group relative flex flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-[#111113] transition duration-200 hover:-translate-y-0.5 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/10">
        <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900">
          {photoUrl ? (
            <>
              <Image
                src={photoUrl}
                alt={character.name}
                fill
                className="object-cover transition duration-300 group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-[#111113]/20 to-transparent" />
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-zinc-900 to-zinc-950">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-7 w-7"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
              </div>
              <span className="text-xs text-zinc-600">No portrait</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="absolute right-2 top-2 rounded-md border border-white/10 bg-black/50 px-2 py-1 text-xs font-medium text-red-400 opacity-70 backdrop-blur-sm transition hover:bg-red-500/20 hover:text-red-300 sm:opacity-0 sm:group-hover:opacity-100"
          >
            Delete
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-400/80">
              Character
            </p>
            <h3 className="mt-0.5 truncate text-base font-semibold leading-tight text-white">
              {character.name}
            </h3>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-3 pt-2">
          <p className="line-clamp-2 flex-1 text-xs leading-relaxed text-zinc-400">
            {character.physical_description}
          </p>
          <div className="flex items-center justify-between border-t border-white/[0.06] pt-2">
            <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-600">
              Profile
            </span>
            <time
              dateTime={character.created_at}
              className="text-[10px] text-zinc-500"
            >
              {createdDate}
            </time>
          </div>
        </div>
      </article>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              if (!deleting) {
                setShowModal(false);
                setError(null);
              }
            }}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-white/10 bg-[#141416] p-5 shadow-2xl">
            <h2 className="text-base font-semibold text-zinc-100">
              Delete character
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Are you sure you want to delete this character? This action cannot
              be undone.
            </p>

            {error && (
              <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setShowModal(false);
                  setError(null);
                }}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
