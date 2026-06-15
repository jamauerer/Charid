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
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-900">
        <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300">
          No characters yet
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          Click &ldquo;New Character&rdquo; to create your first one.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
