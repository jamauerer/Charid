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

  function handleUpdated(updated: Character, photoUrl: string | null) {
    setCharacters((prev) =>
      prev.map((item) =>
        item.character.id === updated.id
          ? { character: updated, photoUrl }
          : item
      )
    );
  }

  if (characters.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-center">
        <p className="text-sm font-medium text-zinc-300">No characters yet</p>
        <p className="mt-1 text-xs text-zinc-500">
          Create your first character profile to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {characters.map(({ character, photoUrl }) => (
        <CharacterCard
          key={character.id}
          character={character}
          photoUrl={photoUrl}
          onDeleted={handleDeleted}
          onUpdated={handleUpdated}
        />
      ))}
    </div>
  );
}
