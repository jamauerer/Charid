"use client";

import { useEffect, useMemo, useState } from "react";
import { CharacterGrid } from "./CharacterGrid";
import { CreateModal } from "@/components/dashboard/CreateModal";
import { StudioEmptyState } from "@/components/studio/StudioEmptyState";
import { PageHeader } from "@/components/studio/PageHeader";
import {
  dsAlertWarning,
  dsChip,
  dsInput,
} from "@/lib/design-system";
import { STUDIO_EMPTY_COPY } from "@/lib/studio-empty-copy";
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
    (character.species?.toLowerCase().includes(q) ?? false) ||
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
    <div className="mx-auto w-full max-w-[1280px]">
      {error && <div className={`mb-4 ${dsAlertWarning}`}>{error}</div>}

      <PageHeader
        title="Your Characters"
        actions={
          <>
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--brand-text-muted)]"
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
                className={`${dsInput} py-2 pl-9 sm:w-64`}
              />
            </div>
            <CreateModal />
          </>
        }
      />

      <div className="-mt-3 mb-5">
        <span className={`${dsChip} tabular-nums`}>{characters.length}</span>
      </div>

      {characters.length === 0 && !error ? (
        <StudioEmptyState
          headline={STUDIO_EMPTY_COPY.character.headline}
          description={STUDIO_EMPTY_COPY.character.description}
        >
          <CreateModal />
        </StudioEmptyState>
      ) : filteredCharacters.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 py-8 text-center">
          <p className="text-sm font-medium text-[var(--foreground)]">
            No matches found
          </p>
          <p className="mt-1 text-xs text-[var(--brand-text-muted)]">
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
