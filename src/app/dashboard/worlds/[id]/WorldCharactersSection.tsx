"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CharacterCard } from "@/components/CharacterCard";
import { CharacterPickerModal } from "@/components/dashboard/CharacterPickerModal";
import { ContextualCharacterCreateModal } from "@/components/dashboard/ContextualCharacterCreateModal";
import type { Character } from "@/types/character";

type CharacterWithPhoto = {
  character: Character;
  photoUrl: string | null;
};

type WorldCharactersSectionProps = {
  worldId: string;
  worldName: string;
  initialCharacters: CharacterWithPhoto[];
};

export function WorldCharactersSection({
  worldId,
  worldName,
  initialCharacters,
}: WorldCharactersSectionProps) {
  const router = useRouter();
  const [characters, setCharacters] = useState(initialCharacters);

  useEffect(() => {
    setCharacters(initialCharacters);
  }, [initialCharacters]);

  function handleRefresh() {
    router.refresh();
  }

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

  const assignedIds = characters.map(({ character }) => character.id);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <CharacterPickerModal
          mode="world"
          worldId={worldId}
          worldName={worldName}
          excludeCharacterIds={assignedIds}
          onComplete={handleRefresh}
        />
        <ContextualCharacterCreateModal
          worldId={worldId}
          worldName={worldName}
          onComplete={handleRefresh}
        />
      </div>

      {characters.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 py-10 text-center">
          <p className="text-sm text-[var(--brand-text-secondary)]">No characters in this world yet.</p>
          <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
            Create a new character or add existing ones — you stay on this world.
          </p>
        </div>
      ) : (
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
      )}
    </div>
  );
}
