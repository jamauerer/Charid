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
      <article className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="relative aspect-[4/3] bg-zinc-100 dark:bg-zinc-800">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={character.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-zinc-400">
              No photo
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {character.name}
            </h3>
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
            >
              Delete
            </button>
          </div>
          <p className="mt-2 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
            {character.physical_description}
          </p>
          <p className="mt-3 text-xs text-zinc-400">
            Created{" "}
            {new Date(character.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </article>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              if (!deleting) {
                setShowModal(false);
                setError(null);
              }
            }}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Delete character
            </h2>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              Are you sure you want to delete this character? This action cannot
              be undone.
            </p>

            {error && (
              <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setShowModal(false);
                  setError(null);
                }}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
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
