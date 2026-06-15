"use client";

import { useState } from "react";
import { CharacterCard } from "@/components/CharacterCard";
import type { Character } from "@/types/character";

export type CharacterWithPhoto = {
  character: Character;
  photoUrl: string | null;
};

type CharacterGridProps = {
  initialCharacters: CharacterWithPhoto[];
};

export function CharacterGrid({ initialCharacters }: CharacterGridProps) {
  const [characters, setCharacters] = useState(initialCharacters);

  function handleDeleted(characterId: string) {
    setCharacters((prev) =>
      prev.filter(({ character }) => character.id !== characterId)
    );
  }

  if (characters.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-10 text-center">
        <p className="font-medium text-zinc-300">No characters yet</p>
        <p className="mt-1 text-sm text-zinc-500">
          Create your first character profile to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {characters.map(({ character, photoUrl }) => (
        <CharacterCard
          key={character.id}
          character={character}
          photoUrl={photoUrl}
          onDeleted={handleDeleted}
        />
      ))}
    </div>
  );
}
