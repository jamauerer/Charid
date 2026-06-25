"use client";

import { useEffect, type RefObject } from "react";

type LayoutEditorKeyboardOptions = {
  containerRef: RefObject<HTMLElement | null>;
  enabled?: boolean;
  onDelete?: () => void;
  onEscape?: () => void;
};

export function useLayoutEditorKeyboard({
  containerRef,
  enabled = true,
  onDelete,
  onEscape,
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
  }, [enabled, onDelete, onEscape]);
}
