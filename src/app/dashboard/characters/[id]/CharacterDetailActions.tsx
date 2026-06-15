"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { EditCharacterModal } from "@/app/dashboard/EditCharacterModal";
import type { Character } from "@/types/character";

type CharacterDetailActionsProps = {
  character: Character;
  photoUrl: string | null;
};

export function CharacterDetailActions({
  character,
  photoUrl,
}: CharacterDetailActionsProps) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowEdit(true)}
        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.04] hover:text-white"
      >
        Edit
      </button>

      <EditCharacterModal
        character={character}
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
