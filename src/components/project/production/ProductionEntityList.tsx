"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { reorderById } from "@/lib/production-reorder";
import { ProductionEntityRow } from "@/components/project/production/ProductionEntityRow";

export type ProductionListItem = {
  id: string;
  name: string;
};

type ProductionEntityListProps = {
  items: ProductionListItem[];
  onReorder: (orderedIds: string[]) => Promise<{ error?: string }>;
  onRename: (id: string, name: string) => Promise<{ error?: string }>;
  onDelete: (id: string) => Promise<{ error?: string }>;
  emptyMessage?: string;
};

export function ProductionEntityList({
  items: initialItems,
  onReorder,
  onRename,
  onDelete,
  emptyMessage = "No items yet.",
}: ProductionEntityListProps) {
  const [items, setItems] = useState(initialItems);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const persistOrder = useCallback(
    (ordered: ProductionListItem[]) => {
      startTransition(async () => {
        setError(null);
        const result = await onReorder(ordered.map((item) => item.id));
        if (result.error) {
          setError(result.error);
          setItems(initialItems);
        }
      });
    },
    [initialItems, onReorder]
  );

  function handleDropOnItem(targetId: string) {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDropTargetId(null);
      return;
    }

    const next = reorderById(items, draggedId, targetId);
    setItems(next);
    setDraggedId(null);
    setDropTargetId(null);
    persistOrder(next);
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-[var(--brand-text-muted)]">{emptyMessage}</p>
    );
  }

  return (
    <div className={pending ? "space-y-2 opacity-80" : "space-y-2"}>
      {error && (
        <p className="rounded-lg border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] px-3 py-2 text-sm text-[var(--status-danger-text)]">
          {error}
        </p>
      )}
      <p className="text-xs text-[var(--brand-text-muted)]">Drag to reorder.</p>
      {items.map((item) => (
        <ProductionEntityRow
          key={item.id}
          id={item.id}
          name={item.name}
          isDragging={draggedId === item.id}
          isDropTarget={dropTargetId === item.id}
          onDragStart={() => setDraggedId(item.id)}
          onDragEnd={() => {
            setDraggedId(null);
            setDropTargetId(null);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDropTargetId(item.id);
          }}
          onDrop={() => handleDropOnItem(item.id)}
          onRename={(name) => onRename(item.id, name)}
          onDelete={() => onDelete(item.id)}
        />
      ))}
    </div>
  );
}
