"use client";

import { ModalPortal } from "@/components/ModalPortal";
import { EditCharacterForm } from "./EditCharacterForm";
import type { Character } from "@/types/character";

type EditCharacterModalProps = {
  character: Character;
  bibleAge?: string | null;
  photoUrl: string | null;
  open: boolean;
  onClose: () => void;
  onUpdated: (character: Character, photoUrl: string | null) => void;
};

export function EditCharacterModal({
  character,
  bibleAge,
  photoUrl,
  open,
  onClose,
  onUpdated,
}: EditCharacterModalProps) {
  if (!open) {
    return null;
  }

  function handleSuccess(updated: Character, updatedPhotoUrl: string | null) {
    onUpdated(updated, updatedPhotoUrl);
    onClose();
  }

  return (
    <ModalPortal>
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <button
        type="button"
        aria-label="Close dialog"
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="flex min-h-full items-start justify-center p-4 sm:items-center sm:p-6">
        <div className="relative z-10 flex w-full max-w-2xl max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] shadow-lg sm:max-h-[calc(100dvh-3rem)]">
          <div className="shrink-0 flex items-center justify-between border-b border-[var(--brand-border)] px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-[var(--brand-text-secondary)]">
                Edit Character
              </h2>
              <p className="mt-0.5 text-xs text-[var(--brand-text-secondary)]">
                Update {character.name}&rsquo;s profile
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-[var(--brand-text-secondary)] transition hover:bg-[var(--brand-surface-elevated)] hover:text-[var(--brand-text-secondary)]"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5"
                aria-hidden
              >
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          </div>
          <div className="overflow-y-auto p-5">
            <EditCharacterForm
              character={character}
              bibleAge={bibleAge}
              photoUrl={photoUrl}
              onSuccess={handleSuccess}
              onCancel={onClose}
            />
          </div>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
