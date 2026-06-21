"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EditCharacterModal } from "@/app/dashboard/EditCharacterModal";
import type { Character } from "@/types/character";

type CharacterDetailActionsProps = {
  character: Character;
  bibleAge?: string | null;
  photoUrl: string | null;
};

export function CharacterDetailActions({
  character,
  bibleAge,
  photoUrl,
}: CharacterDetailActionsProps) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowEdit(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-accent)] px-3.5 py-1.5 text-sm font-semibold text-[var(--brand-accent-foreground)] shadow-sm transition hover:bg-[var(--brand-accent)]"
      >
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
        Edit Character
      </button>

      <EditCharacterModal
        character={character}
        bibleAge={bibleAge}
        photoUrl={photoUrl}
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onUpdated={(_updated, _photoUrl) => {
          router.refresh();
        }}
      />
    </>
  );
}
