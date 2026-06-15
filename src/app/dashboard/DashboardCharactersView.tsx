"use client";

import { useEffect, useMemo, useState } from "react";
import { CharacterGrid } from "./CharacterGrid";
import { NewCharacterModal } from "./NewCharacterModal";
import type { CharacterWithPhoto } from "./CharacterGrid";
import type { Character } from "@/types/character";

type DashboardCharactersViewProps = {
  initialCharacters: CharacterWithPhoto[];
  error?: string;
};

function matchesSearch(
  { character }: CharacterWithPhoto,
  query: string
): boolean {
  const q = query.toLowerCase();
  return (
    character.name.toLowerCase().includes(q) ||
    (character.gender?.toLowerCase().includes(q) ?? false) ||
    (character.age?.toLowerCase().includes(q) ?? false) ||
    (character.location?.toLowerCase().includes(q) ?? false)
  );
}

export function DashboardCharactersView({
  initialCharacters,
  error,
}: DashboardCharactersViewProps) {
  const [search, setSearch] = useState("");
  const [characters, setCharacters] = useState(initialCharacters);

  useEffect(() => {
    setCharacters(initialCharacters);
  }, [initialCharacters]);

  const filteredCharacters = useMemo(() => {
    const trimmed = search.trim();
    if (!trimmed) return characters;
    return characters.filter((item) => matchesSearch(item, trimmed));
  }, [characters, search]);

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

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      {error && (
        <div className="mb-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          {error}
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold tracking-tight text-zinc-100">
            Your Characters
          </h1>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-zinc-400">
            {characters.length}
          </span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search characters..."
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] py-1.5 pl-8 pr-3 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none transition focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/30 sm:w-56"
            />
          </div>
          <NewCharacterModal />
        </div>
      </div>

      {characters.length === 0 && !error ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-center">
          <p className="text-sm font-medium text-zinc-300">No characters yet</p>
          <p className="mt-1 text-xs text-zinc-500">
            Create your first character profile to get started.
          </p>
        </div>
      ) : filteredCharacters.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-5 py-8 text-center">
          <p className="text-sm font-medium text-zinc-300">No matches found</p>
          <p className="mt-1 text-xs text-zinc-500">
            Try a different search term.
          </p>
        </div>
      ) : (
        <CharacterGrid
          characters={filteredCharacters}
          onDeleted={handleDeleted}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}
