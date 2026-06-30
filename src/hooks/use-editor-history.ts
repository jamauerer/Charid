"use client";

import { useCallback, useRef, useState } from "react";

const MAX_HISTORY = 50;

export type EditorHistoryState<T> = {
  past: T[];
  present: T;
  future: T[];
};

export function useEditorHistory<T>(initial: T) {
  const [history, setHistory] = useState<EditorHistoryState<T>>({
    past: [],
    present: initial,
    future: [],
  });

  const skipRecordRef = useRef(false);

  const setPresent = useCallback((next: T | ((prev: T) => T)) => {
    setHistory((current) => ({
      ...current,
      present: typeof next === "function" ? (next as (prev: T) => T)(current.present) : next,
    }));
  }, []);

  const record = useCallback((next: T) => {
    if (skipRecordRef.current) {
      skipRecordRef.current = false;
      setHistory((current) => ({ ...current, present: next }));
      return;
    }

    setHistory((current) => ({
      past: [...current.past.slice(-MAX_HISTORY + 1), current.present],
      present: next,
      future: [],
    }));
  }, []);

  const undo = useCallback((): T | null => {
    let restored: T | null = null;
    setHistory((current) => {
      if (current.past.length === 0) return current;
      const previous = current.past[current.past.length - 1];
      skipRecordRef.current = true;
      restored = previous;
      return {
        past: current.past.slice(0, -1),
        present: previous,
        future: [current.present, ...current.future],
      };
    });
    return restored;
  }, []);

  const redo = useCallback((): T | null => {
    let restored: T | null = null;
    setHistory((current) => {
      if (current.future.length === 0) return current;
      const next = current.future[0];
      skipRecordRef.current = true;
      restored = next;
      return {
        past: [...current.past, current.present],
        present: next,
        future: current.future.slice(1),
      };
    });
    return restored;
  }, []);

  const reset = useCallback((next: T) => {
    setHistory({ past: [], present: next, future: [] });
  }, []);

  return {
    present: history.present,
    setPresent,
    record,
    undo,
    redo,
    reset,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}
