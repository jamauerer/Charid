"use client";

import { useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/studio/ConfirmDialog";

type ProductionEntityRowProps = {
  id: string;
  name: string;
  draggable?: boolean;
  isDragging?: boolean;
  isDropTarget?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDragOver?: (event: React.DragEvent) => void;
  onDrop?: () => void;
  onRename: (name: string) => Promise<{ error?: string } | void>;
  onDelete: () => Promise<{ error?: string } | void>;
};

export function ProductionEntityRow({
  name,
  draggable = true,
  isDragging,
  isDropTarget,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onRename,
  onDelete,
}: ProductionEntityRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [showDelete, setShowDelete] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(name);
  }, [name]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  async function commitRename() {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === name) {
      setDraft(name);
      setEditing(false);
      return;
    }

    setPending(true);
    setError(null);
    const result = await onRename(trimmed);
    setPending(false);
    if (result && "error" in result && result.error) {
      setError(result.error);
      setDraft(name);
    } else {
      setEditing(false);
    }
  }

  async function confirmDelete() {
    setPending(true);
    setError(null);
    const result = await onDelete();
    setPending(false);
    if (result && "error" in result && result.error) {
      setError(result.error);
    } else {
      setShowDelete(false);
    }
  }

  return (
    <>
      <div
        draggable={draggable && !editing}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition ${
          isDragging
            ? "border-[var(--brand-accent)] opacity-60"
            : isDropTarget
              ? "border-[var(--brand-accent)] bg-[var(--tag-primary-bg)]"
              : "border-[var(--brand-border)] bg-[var(--brand-surface-elevated)]"
        } ${draggable && !editing ? "cursor-grab active:cursor-grabbing" : ""}`}
      >
        {draggable && (
          <span
            className="shrink-0 text-[var(--brand-text-muted)]"
            aria-hidden
            title="Drag to reorder"
          >
            ⠿
          </span>
        )}

        <div className="min-w-0 flex-1">
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onBlur={() => void commitRename()}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void commitRename();
                }
                if (event.key === "Escape") {
                  setDraft(name);
                  setEditing(false);
                }
              }}
              disabled={pending}
              className="w-full rounded border border-[var(--brand-border)] bg-[var(--brand-surface)] px-2 py-1 text-sm text-[var(--foreground)]"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="truncate text-left text-sm font-medium text-[var(--foreground)] hover:underline"
              title="Click to rename"
            >
              {name}
            </button>
          )}
          {error && (
            <p className="mt-1 text-xs text-[var(--status-danger-text)]">{error}</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowDelete(true)}
          disabled={pending}
          className="shrink-0 rounded px-2 py-1 text-xs font-medium text-[var(--status-danger-text)] transition hover:bg-[var(--status-danger-bg)] disabled:opacity-50"
        >
          Delete
        </button>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete item?"
        description={`Delete "${name}"? Nested items will also be removed.`}
        confirmLabel="Delete"
        variant="danger"
        pending={pending}
        onCancel={() => setShowDelete(false)}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}
