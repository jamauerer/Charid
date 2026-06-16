"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CharacterCard } from "@/components/CharacterCard";
import type { Character } from "@/types/character";

type CharacterWithPhoto = {
  character: Character;
  photoUrl: string | null;
};

type WorldCharactersSectionProps = {
  initialCharacters: CharacterWithPhoto[];
};

export function WorldCharactersSection({
  initialCharacters,
}: WorldCharactersSectionProps) {
  const router = useRouter();
  const [characters, setCharacters] = useState(initialCharacters);

  function handleDeleted(characterId: string) {
    setCharacters((prev) =>
      prev.filter(({ character }) => character.id !== characterId)
    );
    router.refresh();
  }

  function handleUpdated(character: Character, photoUrl: string | null) {
    setCharacters((prev) =>
      prev.map((item) =>
        item.character.id === character.id ? { character, photoUrl } : item
      )
    );
    router.refresh();
  }

  if (characters.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-10 text-center">
        <p className="text-sm text-zinc-500">
          No characters assigned to this world yet.
        </p>
        <p className="mt-1 text-xs text-zinc-600">
          Edit a character and choose this world from the dropdown.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
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
