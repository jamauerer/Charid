"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { deleteCharacter } from "@/app/actions/characters";
import { EditCharacterModal } from "@/app/dashboard/EditCharacterModal";
import { ConfirmDialog } from "@/components/studio/ConfirmDialog";
import { CardCoverPlaceholder } from "@/components/studio/CardCoverPlaceholder";
import { studioCardSurface } from "@/lib/visual-identity";
import type { CharacterDisplay } from "@/types/character";

type CharacterCardProps = {
  character: CharacterDisplay;
  photoUrl: string | null;
  onDeleted: (characterId: string) => void;
  onUpdated: (character: CharacterDisplay, photoUrl: string | null) => void;
};

function formatMetadata(character: CharacterDisplay): string | null {
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
      <article className={`group relative ${studioCardSurface}`}>
        <Link
          href={`/dashboard/characters/${character.id}`}
          className="relative block aspect-[4/5] overflow-hidden bg-[var(--studio-empty-fill)]"
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
            <CardCoverPlaceholder
              title="No portrait yet"
              description="Add a photo when you're ready."
            />
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
            className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--brand-border)] bg-black/60 text-[var(--brand-text-secondary)] backdrop-blur-sm transition hover:bg-black/80 hover:text-white"
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
            <div className="absolute right-0 top-full mt-1 min-w-[120px] overflow-hidden rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] py-1 shadow-xl">
              <button
                type="button"
                className="flex w-full items-center px-3 py-1.5 text-left text-xs text-[var(--brand-text-secondary)] transition hover:bg-[var(--brand-surface-elevated)] hover:text-white"
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
                className="flex w-full items-center px-3 py-1.5 text-left text-xs text-red-400 transition hover:bg-red-500/10 hover:text-[var(--status-danger-text)]"
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

        <div className="px-4 py-3.5">
          <h3 className="truncate text-base font-semibold tracking-tight text-[var(--foreground)]">
            {character.name}
          </h3>
          {metadata && (
            <p className="mt-1 truncate text-xs text-[var(--brand-text-secondary)]">
              {metadata}
            </p>
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

      <ConfirmDialog
        open={showDeleteModal}
        title="Delete character"
        description={`Delete ${character.name}? This removes the character and all reference images. This cannot be undone.`}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        pending={deleting}
        error={error}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleting) {
            setShowDeleteModal(false);
            setError(null);
          }
        }}
      />
    </>
  );
}
