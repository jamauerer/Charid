"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { deleteCharacter } from "@/app/actions/characters";
import { EditCharacterModal } from "@/app/dashboard/EditCharacterModal";
import { ModalPortal } from "@/components/ModalPortal";
import type { Character } from "@/types/character";

type CharacterCardProps = {
  character: Character;
  photoUrl: string | null;
  onDeleted: (characterId: string) => void;
  onUpdated: (character: Character, photoUrl: string | null) => void;
};

function formatMetadata(character: Character): string | null {
  const parts = [character.gender, character.age, character.location].filter(
    Boolean
  ) as string[];
  return parts.length > 0 ? parts.join(" • ") : null;
}

export function CharacterCard({
  character,
  photoUrl,
  onDeleted,
  onUpdated,
}: CharacterCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const metadata = formatMetadata(character);

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
      <article className="group relative overflow-hidden rounded-lg border border-white/[0.06] bg-[#0f0f11] transition hover:border-white/10 hover:bg-[#111113]">
        <Link
          href={`/dashboard/characters/${character.id}`}
          className="relative block aspect-[4/3] overflow-hidden bg-zinc-900"
        >
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={character.name}
              fill
              className="object-cover transition duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              unoptimized
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-zinc-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="h-4 w-4"
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
        </Link>

        <div ref={menuRef} className="absolute right-1.5 top-1.5 z-10">
          <button
            type="button"
            aria-label="Character actions"
            aria-expanded={menuOpen}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuOpen((open) => !open);
            }}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-black/60 text-zinc-300 backdrop-blur-sm transition hover:bg-black/80 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden
            >
              <path d="M10 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM10 8.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM11.5 15.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0Z" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 min-w-[120px] overflow-hidden rounded-lg border border-white/10 bg-[#141416] py-1 shadow-xl">
              <button
                type="button"
                className="flex w-full items-center px-3 py-1.5 text-left text-xs text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenuOpen(false);
                  setShowEditModal(true);
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="flex w-full items-center px-3 py-1.5 text-left text-xs text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenuOpen(false);
                  setShowDeleteModal(true);
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="px-3 py-2.5">
          <h3 className="truncate text-sm font-bold tracking-tight text-zinc-100">
            {character.name}
          </h3>
          {metadata && (
            <p className="mt-1 truncate text-xs text-zinc-500">{metadata}</p>
          )}
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
        <ModalPortal>
          <div className="fixed inset-0 z-[100] overflow-y-auto">
            <button
              type="button"
              aria-label="Close dialog"
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => {
                if (!deleting) {
                  setShowDeleteModal(false);
                  setError(null);
                }
              }}
            />
            <div className="flex min-h-full items-start justify-center p-4 sm:items-center sm:p-6">
              <div className="relative z-10 w-full max-w-md rounded-xl border border-white/10 bg-[#141416] p-5 shadow-2xl">
                <h2 className="text-base font-semibold text-zinc-100">
                  Delete character
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  Are you sure you want to delete this character? This action
                  cannot be undone.
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
          </div>
        </ModalPortal>
      )}
    </>
  );
}
