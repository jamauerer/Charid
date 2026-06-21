"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { FormModalShell } from "@/components/dashboard/FormModalShell";
import {
  assignCharactersToWorld,
  getCharactersForPicker,
  type CharacterPickerItem,
} from "@/app/actions/characters";
import { addCharactersToStory } from "@/app/actions/stories";

type CharacterPickerModalProps = {
  mode: "world" | "story";
  worldId: string;
  worldName?: string;
  storyId?: string;
  projectId?: string | null;
  excludeCharacterIds?: string[];
  onComplete?: () => void;
  triggerLabel?: string;
};

function isStoryAttachable(
  character: CharacterPickerItem,
  excluded: Set<string>,
  projectId?: string | null
): boolean {
  if (excluded.has(character.id)) {
    return false;
  }
  if (projectId) {
    return (
      character.project_id === projectId || character.project_id === null
    );
  }
  return true;
}

export function CharacterPickerModal({
  mode,
  worldId,
  worldName,
  storyId,
  projectId = null,
  excludeCharacterIds = [],
  onComplete,
  triggerLabel = "Add Existing Character",
}: CharacterPickerModalProps) {
  const [open, setOpen] = useState(false);
  const [characters, setCharacters] = useState<CharacterPickerItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [actionError, setActionError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();

  const excluded = useMemo(() => new Set(excludeCharacterIds), [excludeCharacterIds]);

  const selectable = useMemo(() => {
    if (mode === "world") {
      return characters.filter(
        (character) =>
          !excluded.has(character.id) && character.world_id !== worldId
      );
    }
    return characters.filter((character) =>
      isStoryAttachable(character, excluded, projectId)
    );
  }, [characters, mode, worldId, excluded, projectId]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return selectable;
    return selectable.filter((character) =>
      character.name.toLowerCase().includes(query)
    );
  }, [selectable, search]);

  const showSearch = selectable.length > 10;

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    setLoadError(null);
    setSelected(new Set());
    setActionError(null);
    setSearch("");

    getCharactersForPicker().then((result) => {
      setLoading(false);
      if (result.error) {
        setLoadError(result.error);
        setCharacters([]);
        return;
      }
      setCharacters(result.characters);
    });
  }, [open]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleClose() {
    setOpen(false);
    onComplete?.();
  }

  function handleSubmit() {
    const ids = [...selected];
    if (ids.length === 0) {
      setActionError("Select at least one character.");
      return;
    }

    startTransition(async () => {
      setActionError(null);

      if (mode === "world") {
        const result = await assignCharactersToWorld(worldId, ids);
        if (result.error) {
          setActionError(result.error);
          return;
        }
      } else if (storyId) {
        const result = await addCharactersToStory(storyId, ids);
        if (result.error) {
          setActionError(result.error);
          return;
        }
      }

      handleClose();
    });
  }

  const subtitle =
    mode === "world"
      ? worldName
        ? `Assign characters to ${worldName}`
        : "Assign existing characters to this setting"
      : projectId
        ? "Add characters from this project to the story"
        : "Add characters to this story";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3.5 py-1.5 text-sm font-medium text-[var(--brand-text-secondary)] transition hover:border-neutral-300 hover:bg-[var(--brand-surface-elevated)]"
      >
        {triggerLabel}
      </button>

      {open && (
        <FormModalShell title="Add Existing Character" subtitle={subtitle} onClose={handleClose}>
          {loading ? (
            <p className="text-sm text-[var(--brand-text-secondary)]">Loading characters…</p>
          ) : loadError ? (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-[var(--status-danger-text)]">
              {loadError}
            </p>
          ) : selectable.length === 0 ? (
            <p className="text-sm text-[var(--brand-text-secondary)]">
              {mode === "world"
                ? "All your characters are already in this setting, or you have none to assign."
                : projectId
                  ? "No characters in this project are available to add. Create one first."
                  : "No characters are available to add. Create one first."}
            </p>
          ) : (
            <>
              {showSearch && (
                <div className="mb-3">
                  <label htmlFor="character-picker-search" className="sr-only">
                    Search characters
                  </label>
                  <input
                    id="character-picker-search"
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search characters…"
                    className="w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-sm text-[var(--brand-text-secondary)] outline-none focus:border-[var(--brand-accent)]"
                  />
                </div>
              )}
              {filtered.length === 0 ? (
                <p className="text-sm text-[var(--brand-text-secondary)]">
                  No characters match your search.
                </p>
              ) : (
                <ul className="max-h-64 space-y-2 overflow-y-auto">
                  {filtered.map((character) => {
                    const isSelected = selected.has(character.id);
                    return (
                      <li key={character.id}>
                        <label
                          className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition ${
                            isSelected
                              ? "border-violet-500/40 bg-violet-500/10"
                              : "border-[var(--brand-border)] bg-[var(--brand-surface)] hover:border-white/[0.12]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggle(character.id)}
                            className="mt-0.5 accent-[var(--brand-accent)]"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium text-[var(--brand-text-secondary)]">
                              {character.name}
                            </span>
                            <span className="block text-xs text-[var(--brand-text-secondary)]">
                              {mode === "story"
                                ? character.project_id
                                  ? "In this project"
                                  : "No project assigned"
                                : character.world_name
                                  ? `Currently in ${character.world_name}`
                                  : "Unassigned"}
                            </span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}

          {actionError && (
            <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-[var(--status-danger-text)]">
              {actionError}
            </p>
          )}

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-[var(--brand-border)] px-4 py-2 text-sm font-medium text-[var(--brand-text-secondary)] transition hover:bg-[var(--brand-surface)]"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={pending || selectable.length === 0}
              onClick={handleSubmit}
              className="rounded-lg bg-gradient-to-r bg-[var(--brand-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--brand-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending
                ? "Adding…"
                : `Add ${selected.size > 0 ? selected.size : ""} character${selected.size === 1 ? "" : "s"}`}
            </button>
          </div>
        </FormModalShell>
      )}
    </>
  );
}
