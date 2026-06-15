"use client";

import { useState } from "react";
import { ModalPortal } from "@/components/ModalPortal";
import { CharacterForm } from "./CharacterForm";

export function NewCharacterModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:from-violet-500 hover:to-indigo-500 hover:shadow-violet-500/35"
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
        New Character
      </button>

      {open && (
        <ModalPortal>
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <button
            type="button"
            aria-label="Close dialog"
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="flex min-h-full items-start justify-center p-4 sm:items-center sm:p-6">
            <div className="relative z-10 flex w-full max-w-lg max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-xl border border-white/10 bg-[#141416] shadow-2xl sm:max-h-[calc(100dvh-3rem)]">
              <div className="shrink-0 flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                <div>
                  <h2 className="text-base font-semibold text-zinc-100">
                    New Character
                  </h2>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    Add a new profile to your studio
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
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
              <div className="overflow-y-auto p-5">
                <CharacterForm onSuccess={() => setOpen(false)} />
              </div>
            </div>
          </div>
        </div>
        </ModalPortal>
      )}
    </>
  );
}
