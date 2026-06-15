"use client";

import { EditCharacterForm } from "./EditCharacterForm";
import type { Character } from "@/types/character";

type EditCharacterModalProps = {
  character: Character;
  photoUrl: string | null;
  open: boolean;
  onClose: () => void;
  onUpdated: (character: Character, photoUrl: string | null) => void;
};

export function EditCharacterModal({
  character,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-white/10 bg-[#141416] shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-white/[0.06] bg-[#141416] px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">
              Edit Character
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Update {character.name}&rsquo;s profile
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-300"
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
        <div className="p-5">
          <EditCharacterForm
            character={character}
            photoUrl={photoUrl}
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
