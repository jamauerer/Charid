"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  addCharacterToStory,
  removeCharacterFromStory,
} from "@/app/actions/stories";
import { CharacterPickerModal } from "@/components/dashboard/CharacterPickerModal";
import { ContextualCharacterCreateModal } from "@/components/dashboard/ContextualCharacterCreateModal";
import { ConfirmDialog } from "@/components/studio/ConfirmDialog";
import type { StoryCharacterEntry } from "@/app/actions/stories";

type StoryCharacterSectionProps = {
  storyId: string;
  worldId: string;
  worldName?: string;
  projectId?: string | null;
  initialEntries: StoryCharacterEntry[];
  photoUrls: Record<string, string | null>;
};

export function StoryCharacterSection({
  storyId,
  worldId,
  worldName,
  projectId = null,
  initialEntries,
  photoUrls,
}: StoryCharacterSectionProps) {
  const router = useRouter();
  const [entries, setEntries] = useState(initialEntries);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [characterToRemove, setCharacterToRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    setEntries(initialEntries);
  }, [initialEntries]);

  const rosterIds = entries.map((entry) => entry.character_id);

  function handleRefresh() {
    router.refresh();
  }

  async function linkNewCharacter(characterId: string) {
    const result = await addCharacterToStory(storyId, characterId);
    if (result.error) {
      setError(result.error);
      return;
    }
    handleRefresh();
  }

  function confirmRemove() {
    if (!characterToRemove) return;
    setError(null);
    startTransition(async () => {
      const result = await removeCharacterFromStory(
        storyId,
        characterToRemove.id
      );
      if (result.error) {
        setError(result.error);
        return;
      }
      setEntries((prev) =>
        prev.filter((entry) => entry.character_id !== characterToRemove.id)
      );
      setCharacterToRemove(null);
      handleRefresh();
    });
  }

  return (
    <>
    <div>
      {error && (
        <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-[var(--status-danger-text)]">
          {error}
        </p>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        <CharacterPickerModal
          mode="story"
          worldId={worldId}
          worldName={worldName}
          storyId={storyId}
          projectId={projectId}
          excludeCharacterIds={rosterIds}
          onComplete={handleRefresh}
        />
        <ContextualCharacterCreateModal
          projectId={projectId}
          storyId={storyId}
          onLinkedToStory={linkNewCharacter}
          onComplete={handleRefresh}
        />
      </div>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 py-8 text-center">
          <p className="text-sm text-[var(--brand-text-secondary)]">No characters in this story yet.</p>
          <p className="mt-1 text-xs text-[var(--brand-text-secondary)]">
            Add an existing character or create a new one — you stay on this story.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {entries.map(({ character_id, character }) => (
            <article
              key={character_id}
              className="overflow-hidden rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)]"
            >
              <Link
                href={`/dashboard/characters/${character.id}`}
                className="relative block aspect-[4/3] overflow-hidden bg-[var(--studio-empty-fill)]"
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
                  <div className="flex h-full items-center justify-center bg-[var(--studio-empty-fill)] text-[10px] text-[var(--brand-text-secondary)]">
                    No portrait
                  </div>
                )}
              </Link>
              <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                <Link
                  href={`/dashboard/characters/${character.id}`}
                  className="truncate text-sm font-bold text-[var(--brand-text-secondary)] transition hover:text-neutral-600"
                >
                  {character.name}
                </Link>
                <button
                  type="button"
                  onClick={() =>
                    setCharacterToRemove({
                      id: character_id,
                      name: character.name,
                    })
                  }
                  disabled={pending}
                  className="shrink-0 text-[11px] text-[var(--brand-text-secondary)] transition hover:text-red-400 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>

    <ConfirmDialog
      open={characterToRemove !== null}
      title="Remove from story"
      description={
        characterToRemove
          ? `Remove ${characterToRemove.name} from this story? The character profile stays in your library.`
          : ""
      }
      confirmLabel="Remove"
      pending={pending}
      onConfirm={confirmRemove}
      onCancel={() => {
        if (!pending) {
          setCharacterToRemove(null);
        }
      }}
    />
    </>
  );
}
