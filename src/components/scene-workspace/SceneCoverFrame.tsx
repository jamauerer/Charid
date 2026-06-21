"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { updateSceneCoverFocal } from "@/app/actions/scenes";

type SceneCoverFrameProps = {
  sceneId: string;
  storyId: string;
  worldId: string;
  title: string;
  sceneNumber: number;
  coverUrl: string | null;
  focalX: number;
  focalY: number;
  onFocalChange?: (x: number, y: number) => void;
  editable?: boolean;
};

function sceneInitial(title: string): string {
  const trimmed = title.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

export function SceneCoverFrame({
  sceneId,
  storyId,
  worldId,
  title,
  sceneNumber,
  coverUrl,
  focalX,
  focalY,
  onFocalChange,
  editable = false,
}: SceneCoverFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [localFocal, setLocalFocal] = useState({ x: focalX, y: focalY });
  const [dragging, setDragging] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setLocalFocal({ x: focalX, y: focalY });
  }, [focalX, focalY]);

  const persistFocal = useCallback(
    (x: number, y: number) => {
      onFocalChange?.(x, y);
      startTransition(async () => {
        await updateSceneCoverFocal(storyId, sceneId, worldId, x, y);
      });
    },
    [onFocalChange, sceneId, storyId, worldId]
  );

  function pointerPosition(clientX: number, clientY: number) {
    const frame = frameRef.current;
    if (!frame) return null;
    const rect = frame.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.min(100, Math.max(0, x)),
      y: Math.min(100, Math.max(0, y)),
    };
  }

  function handlePointerDown(e: React.PointerEvent) {
    if (!editable || !coverUrl) return;
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    const pos = pointerPosition(e.clientX, e.clientY);
    if (pos) {
      setLocalFocal(pos);
    }
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging || !editable || !coverUrl) return;
    e.preventDefault();
    const pos = pointerPosition(e.clientX, e.clientY);
    if (pos) {
      setLocalFocal(pos);
    }
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!dragging || !editable || !coverUrl) return;
    e.preventDefault();
    setDragging(false);
    persistFocal(localFocal.x, localFocal.y);
  }

  const objectPosition = `${localFocal.x}% ${localFocal.y}%`;

  return (
    <div
      ref={frameRef}
      className={`relative aspect-[4/3] overflow-hidden rounded-t-xl bg-gradient-to-br from-[var(--studio-empty-fill)] via-[var(--brand-surface-elevated)] to-[var(--brand-surface)] ${
        editable && coverUrl ? "cursor-grab active:cursor-grabbing" : ""
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {coverUrl ? (
        <Image
          src={coverUrl}
          alt=""
          fill
          className="pointer-events-none object-cover select-none"
          style={{ objectPosition }}
          unoptimized
          draggable={false}
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-1 px-2">
          <span className="text-2xl font-semibold text-[var(--brand-text-secondary)] opacity-40">
            {sceneInitial(title)}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-[var(--brand-text-secondary)] opacity-60">
            Scene {sceneNumber}
          </span>
        </div>
      )}
      {editable && coverUrl && (
        <span className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/50 px-1.5 py-0.5 text-[9px] text-white">
          Drag to reposition
        </span>
      )}
    </div>
  );
}
