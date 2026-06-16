"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  addCharacterToStory,
  removeCharacterFromStory,
} from "@/app/actions/stories";
import type { Character } from "@/types/character";
import type { StoryCharacterEntry } from "@/app/actions/stories";

type StoryCharacterSectionProps = {
  storyId: string;
  initialEntries: StoryCharacterEntry[];
  availableCharacters: Character[];
  photoUrls: Record<string, string | null>;
};

export function StoryCharacterSection({
  storyId,
  initialEntries,
  availableCharacters,
  photoUrls,
}: StoryCharacterSectionProps) {
  const router = useRouter();
  const [entries, setEntries] = useState(initialEntries);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const rosterIds = new Set(entries.map((e) => e.character_id));
  const addable = availableCharacters.filter((c) => !rosterIds.has(c.id));

  function handleAdd(characterId: string) {
    setError(null);
    startTransition(async () => {
      const result = await addCharacterToStory(storyId, characterId);
      if (result.error) {
        setError(result.error);
        return;
      }
      const character = availableCharacters.find((c) => c.id === characterId);
      if (character) {
        setEntries((prev) => [
          ...prev,
          { story_id: storyId, character_id: characterId, character },
        ]);
      }
      router.refresh();
    });
  }

  function handleRemove(characterId: string) {
    if (!confirm("Remove this character from the story?")) return;
    setError(null);
    startTransition(async () => {
      const result = await removeCharacterFromStory(storyId, characterId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setEntries((prev) => prev.filter((e) => e.character_id !== characterId));
      router.refresh();
    });
  }

  return (
    <div>
      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-center">
          <p className="text-sm text-zinc-500">No characters in this story yet.</p>
          <p className="mt-1 text-xs text-zinc-600">
            Add characters from this world below.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {entries.map(({ character_id, character }) => (
            <article
              key={character_id}
              className="overflow-hidden rounded-lg border border-white/[0.06] bg-[#0f0f11]"
            >
              <Link
                href={`/dashboard/characters/${character.id}`}
                className="relative block aspect-[4/3] overflow-hidden bg-zinc-900"
              >
                {photoUrls[character.id] ? (
                  <Image
                    src={photoUrls[character.id]!}
                    alt={character.name}
                    fill
                    className="object-cover transition duration-300 hover:scale-[1.02]"
                    sizes="(max-width: 640px) 100vw, 25vw"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-[10px] text-zinc-600">
                    No portrait
                  </div>
                )}
              </Link>
              <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                <Link
                  href={`/dashboard/characters/${character.id}`}
                  className="truncate text-sm font-bold text-zinc-100 transition hover:text-violet-300"
                >
                  {character.name}
                </Link>
                <button
                  type="button"
                  onClick={() => handleRemove(character_id)}
                  disabled={pending}
                  className="shrink-0 text-[11px] text-zinc-500 transition hover:text-red-400 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-white/[0.06] bg-[#0f0f11] p-4">
        <label
          htmlFor="add-story-character"
          className="mb-2 block text-xs font-medium text-zinc-400"
        >
          Add character from this world
        </label>
        {addable.length === 0 ? (
          <p className="text-xs text-zinc-600">
            {availableCharacters.length === 0
              ? "Assign characters to this world first, then add them to the story."
              : "All world characters are already in this story."}
          </p>
        ) : (
          <select
            id="add-story-character"
            defaultValue=""
            disabled={pending}
            onChange={(e) => {
              const id = e.target.value;
              if (id) {
                handleAdd(id);
                e.target.value = "";
              }
            }}
            className="w-full rounded-lg border border-white/10 bg-[#141416] px-3 py-2 text-sm text-zinc-200 outline-none focus:border-violet-500/50"
          >
            <option value="" disabled>
              Select a character…
            </option>
            {addable.map((character) => (
              <option key={character.id} value={character.id}>
                {character.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
