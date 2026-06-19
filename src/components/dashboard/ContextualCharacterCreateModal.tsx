"use client";

import { useState } from "react";
import { FormModalShell } from "@/components/dashboard/FormModalShell";
import { CharacterForm } from "@/app/dashboard/CharacterForm";

type ContextualCharacterCreateModalProps = {
  worldId: string;
  worldName?: string;
  storyId?: string;
  onLinkedToStory?: (characterId: string) => void;
  onComplete?: () => void;
  triggerLabel?: string;
};

export function ContextualCharacterCreateModal({
  worldId,
  worldName,
  storyId,
  onLinkedToStory,
  onComplete,
  triggerLabel = "Create New Character",
}: ContextualCharacterCreateModalProps) {
  const [open, setOpen] = useState(false);

  function handleClose() {
    setOpen(false);
    onComplete?.();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r bg-[var(--brand-accent)] px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm shadow-violet-500/15 transition hover:bg-[var(--brand-accent-hover)]"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4"
          aria-hidden
        >
          <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
        </svg>
        {triggerLabel}
      </button>

      {open && (
        <FormModalShell
          title="New Character"
          subtitle={
            worldName
              ? `Creates in ${worldName} — you stay on this page`
              : "Linked to this world when saved"
          }
          onClose={handleClose}
        >
          <CharacterForm
            defaultWorldId={worldId}
            onCreated={(characterId) => {
              if (storyId) {
                onLinkedToStory?.(characterId);
              }
            }}
            onSuccess={handleClose}
          />
        </FormModalShell>
      )}
    </>
  );
}
