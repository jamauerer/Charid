"use client";

import { CharacterCard } from "@/components/CharacterCard";
import type { Character } from "@/types/character";

export type CharacterWithPhoto = {
  character: Character;
  photoUrl: string | null;
};

type CharacterGridProps = {
  characters: CharacterWithPhoto[];
  onDeleted: (characterId: string) => void;
  onUpdated: (character: Character, photoUrl: string | null) => void;
};

export function CharacterGrid({
  characters,
  onDeleted,
  onUpdated,
}: CharacterGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5">
      {characters.map(({ character, photoUrl }) => (
        <CharacterCard
          key={character.id}
          character={character}
          photoUrl={photoUrl}
          onDeleted={onDeleted}
          onUpdated={onUpdated}
        />
      ))}
    </div>
  );
}
