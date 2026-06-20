"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ModalPortal } from "@/components/ModalPortal";
import { CharacterForm } from "@/app/dashboard/CharacterForm";
import { studioBtnPrimarySm } from "@/lib/visual-identity";

type ProjectAddCharacterButtonProps = {
  projectId: string;
};

export function ProjectAddCharacterButton({ projectId }: ProjectAddCharacterButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={studioBtnPrimarySm}>
        + Character
      </button>

      {open && (
        <ModalPortal>
          <div className="fixed inset-0 z-[100] overflow-y-auto">
            <button
              type="button"
              aria-label="Close dialog"
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
              onClick={() => setOpen(false)}
            />
            <div className="flex min-h-full items-start justify-center p-4 sm:items-center sm:p-6">
              <div className="relative z-10 w-full max-w-lg rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 shadow-lg">
                <h2 className="text-base font-semibold text-[var(--foreground)]">
                  New Character
                </h2>
                <p className="mt-1 text-xs text-[var(--brand-text-muted)]">
                  Adds to this project
                </p>
                <div className="mt-4">
                  <CharacterForm
                    projectId={projectId}
                    onSuccess={() => {
                      setOpen(false);
                      router.refresh();
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </>
  );
}
