"use client";

import { useEffect, type RefObject } from "react";

type LayoutEditorKeyboardOptions = {
  containerRef: RefObject<HTMLElement | null>;
  enabled?: boolean;
  onDelete?: () => void;
  onEscape?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onDuplicate?: () => void;
};

export function useLayoutEditorKeyboard({
  containerRef,
  enabled = true,
  onDelete,
  onEscape,
  onUndo,
  onRedo,
  onDuplicate,
}: LayoutEditorKeyboardOptions) {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      const mod = event.metaKey || event.ctrlKey;

      if (mod && event.key === "z" && !event.shiftKey) {
        event.preventDefault();
        onUndo?.();
        return;
      }

      if (mod && (event.key === "y" || (event.key === "z" && event.shiftKey))) {
        event.preventDefault();
        onRedo?.();
        return;
      }

      if (mod && event.key === "d") {
        event.preventDefault();
        onDuplicate?.();
        return;
      }

      if (event.key === "Escape") {
        onEscape?.();
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        onDelete?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, onDelete, onEscape, onUndo, onRedo, onDuplicate]);
}
