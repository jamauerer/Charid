"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import type { SceneWithCast } from "@/types/scene";
import {
  deriveSceneTimelineStatus,
  type SceneTimelineStatus,
} from "@/lib/scenes/scene-timeline-status";
import { SceneCoverFrame } from "@/components/scene-workspace/SceneCoverFrame";
import { uploadSceneCover } from "@/app/actions/scenes";

type TimelineNodeProps = {
  scene: SceneWithCast;
  sceneNumber: number;
  worldId: string;
  storyId: string;
  draggable?: boolean;
  isDragging?: boolean;
  isDropTarget?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: () => void;
};

const STATUS_LABEL: Record<SceneTimelineStatus, string> = {
  draft: "Draft",
  ready: "Ready",
};

export function TimelineNode({
  scene,
  sceneNumber,
  worldId,
  storyId,
  draggable = true,
  isDragging = false,
  isDropTarget = false,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: TimelineNodeProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [coverUrl, setCoverUrl] = useState(scene.cover_url ?? null);
  const [focal, setFocal] = useState({
    x: scene.cover_focal_x,
    y: scene.cover_focal_y,
  });
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const status = deriveSceneTimelineStatus(scene);
  const href = `/dashboard/worlds/${worldId}/stories/${storyId}/scenes/${scene.id}`;

  function handleUpload(file: File) {
    setUploadError(null);
    const formData = new FormData();
    formData.set("cover", file);
    startTransition(async () => {
      const result = await uploadSceneCover(storyId, scene.id, worldId, formData);
      if (result.error) {
        setUploadError(result.error);
        return;
      }
      setCoverUrl(result.coverUrl ?? null);
      setFocal({ x: 50, y: 50 });
    });
  }

  return (
    <div
      onDragOver={onDragOver}
      onDrop={(e) => {
        e.preventDefault();
        onDrop?.();
      }}
      className={`relative flex w-[9.5rem] shrink-0 snap-start flex-col rounded-xl border bg-[var(--brand-surface)] transition sm:w-[10.5rem] ${
        isDragging
          ? "border-[var(--brand-accent)] opacity-50"
          : isDropTarget
            ? "border-[var(--status-info-border)] ring-2 ring-[var(--status-info-border)]"
            : "border-[var(--brand-border)] hover:border-[var(--status-info-border)] hover:shadow-sm"
      }`}
    >
      {draggable && (
        <button
          type="button"
          draggable
          aria-label={`Drag to reorder ${scene.title}`}
          title="Drag to reorder"
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", scene.id);
            onDragStart?.();
          }}
          onDragEnd={onDragEnd}
          onClick={(e) => e.preventDefault()}
          className="absolute left-1.5 top-1.5 z-20 flex h-6 w-6 cursor-grab items-center justify-center rounded-md border border-[var(--brand-border)] bg-[var(--brand-surface)] text-[10px] leading-none text-[var(--brand-text-secondary)] active:cursor-grabbing"
        >
          ⋮⋮
        </button>
      )}

      <Link
        href={href}
        draggable={false}
        className="flex flex-1 flex-col rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-accent)]"
      >
        <div className="relative">
          <SceneCoverFrame
            sceneId={scene.id}
            storyId={storyId}
            worldId={worldId}
            title={scene.title}
            sceneNumber={sceneNumber}
            coverUrl={coverUrl}
            focalX={focal.x}
            focalY={focal.y}
            editable={Boolean(coverUrl)}
            onFocalChange={(x, y) => setFocal({ x, y })}
          />
          <span
            className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-medium ${
              status === "ready"
                ? "bg-[var(--status-info-bg)] text-[var(--status-info-text)]"
                : "bg-[var(--brand-surface-elevated)] text-[var(--brand-text-secondary)]"
            }`}
          >
            {STATUS_LABEL[status]}
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-3 pt-2">
          <span className="line-clamp-2 text-sm font-semibold leading-snug text-[var(--brand-text-secondary)] group-hover:text-[var(--foreground)]">
            {scene.title}
          </span>
          {scene.location_display && (
            <span className="truncate text-[10px] text-[var(--brand-text-secondary)]">
              {scene.location_display}
            </span>
          )}
          <span className="text-[10px] font-medium text-[var(--brand-accent)]">
            Open scene →
          </span>
        </div>
      </Link>

      <div className="px-3 pb-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => fileRef.current?.click()}
          className="text-[10px] font-medium text-[var(--brand-text-secondary)] underline-offset-2 hover:underline"
        >
          {coverUrl ? "Replace cover" : "Add cover"}
        </button>
        {uploadError && (
          <p className="mt-1 text-[10px] text-[var(--status-danger-text)]">{uploadError}</p>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
