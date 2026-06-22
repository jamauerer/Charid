"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { updateCharacterPortraitFocal } from "@/app/actions/characters";
import { CharacterPortraitImage } from "@/components/character-bible/CharacterPortraitImage";
import { resolvePortraitFocalY } from "@/types/character";

type CharacterPortraitPositionEditorProps = {
  characterId: string;
  photoUrl: string;
  focalY: number;
};

function pointerFocalY(clientY: number, frame: HTMLDivElement): number {
  const rect = frame.getBoundingClientRect();
  const y = ((clientY - rect.top) / rect.height) * 100;
  return Math.min(100, Math.max(0, y));
}

export function CharacterPortraitPositionEditor({
  characterId,
  photoUrl,
  focalY,
}: CharacterPortraitPositionEditorProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [editMode, setEditMode] = useState(false);
  const [localFocalY, setLocalFocalY] = useState(resolvePortraitFocalY(focalY));
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setLocalFocalY(resolvePortraitFocalY(focalY));
  }, [focalY]);

  const persistFocalY = useCallback(
    (y: number) => {
      setError(null);
      startTransition(async () => {
        const result = await updateCharacterPortraitFocal(characterId, y);
        if (result.error) {
          setError(result.error);
        }
      });
    },
    [characterId]
  );

  function handlePointerDown(e: React.PointerEvent) {
    if (!editMode) return;
    e.preventDefault();
    const frame = frameRef.current;
    if (!frame) return;
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    setLocalFocalY(pointerFocalY(e.clientY, frame));
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging || !editMode) return;
    e.preventDefault();
    const frame = frameRef.current;
    if (!frame) return;
    setLocalFocalY(pointerFocalY(e.clientY, frame));
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!dragging || !editMode) return;
    e.preventDefault();
    setDragging(false);
    const frame = frameRef.current;
    if (!frame) return;
    const y = pointerFocalY(e.clientY, frame);
    setLocalFocalY(y);
    persistFocalY(y);
  }

  return (
    <div className="space-y-3">
      <div
        ref={frameRef}
        className={`relative mx-auto aspect-[4/5] max-w-[240px] overflow-hidden rounded-md border border-[var(--brand-border)] bg-[var(--studio-empty-fill)] ${
          editMode ? "cursor-ns-resize" : ""
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <CharacterPortraitImage
          photoUrl={photoUrl}
          focalY={localFocalY}
          alt=""
        />
        {editMode && (
          <span className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/50 px-1.5 py-0.5 text-[9px] text-white">
            Drag up or down
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setEditMode((open) => !open);
            setError(null);
          }}
          className="rounded-md border border-[var(--brand-border)] bg-[var(--brand-surface)] px-2.5 py-1.5 text-[11px] font-medium text-[var(--brand-text-secondary)] transition hover:border-[var(--brand-accent)] hover:text-[var(--brand-accent)]"
        >
          {editMode ? "Done adjusting" : "Adjust Portrait Position"}
        </button>
      </div>

      {error && (
        <p className="text-xs text-[var(--status-danger-text)]">{error}</p>
      )}
    </div>
  );
}
