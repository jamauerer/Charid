"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { deleteCharacter } from "@/app/actions/characters";
import { EditCharacterModal } from "@/app/dashboard/EditCharacterModal";
import type { Character } from "@/types/character";

type CharacterCardProps = {
  character: Character;
  photoUrl: string | null;
  onDeleted: (characterId: string) => void;
  onUpdated: (character: Character, photoUrl: string | null) => void;
};

function IconButton({
  label,
  onClick,
  children,
  variant = "default",
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  variant?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex h-7 w-7 items-center justify-center transition ${
        variant === "danger"
          ? "text-red-400 hover:bg-red-500/20 hover:text-red-300"
          : "text-zinc-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

export function CharacterCard({
  character,
  photoUrl,
  onDeleted,
  onUpdated,
}: CharacterCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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
    setShowDeleteModal(false);
    setDeleting(false);
  }

  return (
    <>
      <article className="group relative flex flex-col overflow-hidden rounded-lg border border-white/[0.07] bg-[#111113] shadow-sm ring-1 ring-transparent transition duration-200 hover:-translate-y-0.5 hover:border-violet-500/25 hover:shadow-lg hover:shadow-violet-500/10 hover:ring-violet-500/20">
        <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900">
          {photoUrl ? (
            <>
              <Image
                src={photoUrl}
                alt={character.name}
                fill
                className="object-cover transition duration-500 group-hover:scale-[1.04]"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111113] via-transparent to-black/10" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111113]/90 via-[#111113]/10 to-transparent" />
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-zinc-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-5 w-5"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
              </div>
              <span className="text-[10px] text-zinc-600">No portrait</span>
            </div>
          )}

          <div className="absolute right-1.5 top-1.5 flex overflow-hidden rounded-md border border-white/10 bg-black/55 opacity-100 shadow-sm backdrop-blur-md transition duration-200 sm:opacity-0 sm:group-hover:opacity-100">
            <IconButton label="Edit character" onClick={() => setShowEditModal(true)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-3.5 w-3.5"
                aria-hidden
              >
                <path d="M13.488 2.513a1.75 1.75 0 0 0-2.475 0L6.75 6.774a2.75 2.75 0 0 0-.596.892l-.848 2.047a.75.75 0 0 0 .984.984l2.047-.848a2.75 2.75 0 0 0 .892-.596l4.261-4.262a1.75 1.75 0 0 0 0-2.474Z" />
                <path d="M4.75 3.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V9A.75.75 0 0 1 14 9v2.25A2.75 2.75 0 0 1 11.25 14h-6.5A2.75 2.75 0 0 1 2 11.25v-6.5A2.75 2.75 0 0 1 4.75 2H7a.75.75 0 0 1 0 1.5H4.75Z" />
              </svg>
            </IconButton>
            <div className="w-px bg-white/10" aria-hidden />
            <IconButton
              label="Delete character"
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="h-3.5 w-3.5"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M5 3.25V4H2.75a.75.75 0 0 0 0 1.5h.273l.815 8.15A1.5 1.5 0 0 0 4.82 15h6.36a1.5 1.5 0 0 0 1.493-1.35l.815-8.15H13.5a.75.75 0 0 0 0-1.5H11v-.75A2.25 2.25 0 0 0 8.75 1h-1.5A2.25 2.25 0 0 0 5 3.25Zm2.25-.75a.75.75 0 0 0-.75.75V4h3v-.75a.75.75 0 0 0-.75-.75h-1.5ZM6.05 6.423l.572 5.713a.25.25 0 0 0 .498-.05l.572-5.713a.25.25 0 0 0-.248-.273h-1.146a.25.25 0 0 0-.248.273Zm3.9 0a.25.25 0 0 0-.248-.273h-1.146a.25.25 0 0 0-.248.273l.572 5.713a.25.25 0 0 0 .498.05l.572-5.713Z"
                  clipRule="evenodd"
                />
              </svg>
            </IconButton>
          </div>

          <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2.5 pt-8">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-violet-400/90">
              Character
            </p>
            <h3 className="truncate text-sm font-semibold leading-snug text-white">
              {character.name}
            </h3>
          </div>
        </div>

        <div className="space-y-1.5 px-2.5 py-2">
          <p className="line-clamp-2 min-h-[2rem] text-[11px] leading-relaxed text-zinc-400">
            {character.physical_description}
          </p>
          <div className="flex items-center justify-between border-t border-white/[0.05] pt-1.5">
            <span className="text-[9px] font-medium uppercase tracking-wide text-zinc-600">
              Created
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

      <EditCharacterModal
        character={character}
        photoUrl={photoUrl}
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onUpdated={onUpdated}
      />

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              if (!deleting) {
                setShowDeleteModal(false);
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
                  setShowDeleteModal(false);
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
