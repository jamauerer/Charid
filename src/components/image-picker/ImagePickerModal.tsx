"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ModalPortal } from "@/components/ModalPortal";
import {
  filterPickerItems,
  formatPickerDate,
} from "@/lib/image-picker-character";
import type { ImagePickerItem } from "@/types/image-picker";
import { studioBtnPrimary, studioBtnSecondary } from "@/lib/visual-identity";

export type ImagePickerModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  items: ImagePickerItem[];
  currentImageId?: string | null;
  onConfirm: (imageId: string) => void;
  pending?: boolean;
  emptyMessage?: string;
  /** When true, show a hint that results are prioritized for the target slot */
  showPriorityHint?: boolean;
};

export function ImagePickerModal({
  open,
  onClose,
  title,
  subtitle,
  items,
  currentImageId,
  onConfirm,
  pending = false,
  emptyMessage = "Upload an image to your gallery first, then assign it here.",
  showPriorityHint = true,
}: ImagePickerModalProps) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(
    () => filterPickerItems(items, search),
    [items, search]
  );

  const defaultSelectedId =
    filtered.find((i) => i.id !== currentImageId)?.id ??
    items.find((i) => i.id !== currentImageId)?.id ??
    null;

  const activeSelectedId = selectedId ?? defaultSelectedId;

  const selected =
    filtered.find((i) => i.id === activeSelectedId) ??
    items.find((i) => i.id === activeSelectedId) ??
    null;

  function handleClose() {
    setSearch("");
    setSelectedId(null);
    onClose();
  }

  if (!open) return null;

  function handleConfirm() {
    if (!activeSelectedId || pending) return;
    onConfirm(activeSelectedId);
  }

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[110] overflow-y-auto">
        <button
          type="button"
          aria-label="Close"
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          onClick={handleClose}
        />
        <div className="flex min-h-full items-start justify-center p-4 sm:items-center sm:p-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="image-picker-title"
            className="relative z-10 flex w-full max-w-4xl max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-2xl border border-violet-500/20 bg-[var(--brand-surface)] shadow-lg"
          >
            <header className="shrink-0 border-b border-[var(--brand-border)] px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500/90">
                    Image picker
                  </p>
                  <h2
                    id="image-picker-title"
                    className="mt-1 text-lg font-semibold text-[var(--brand-text-secondary)]"
                  >
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="mt-1 text-sm text-[var(--brand-text-secondary)]">{subtitle}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={pending}
                  className="rounded-md p-1.5 text-[var(--brand-text-secondary)] transition hover:bg-[var(--brand-surface-elevated)] hover:text-[var(--brand-text-secondary)] disabled:opacity-60"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              {items.length > 0 && (
                <div className="mt-4">
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, slot, or type…"
                    className="w-full rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-2.5 text-sm text-[var(--brand-text-secondary)] placeholder:text-[var(--brand-text-secondary)] focus:border-violet-500/40 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
                  />
                  {showPriorityHint && !search.trim() && (
                    <p className="mt-2 text-xs text-[var(--brand-text-secondary)]">
                      Best matches for this slot appear first.
                    </p>
                  )}
                </div>
              )}
            </header>

            {items.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-[var(--brand-text-secondary)]">{emptyMessage}</p>
                <button
                  type="button"
                  onClick={handleClose}
                  className={`${studioBtnSecondary} mt-4`}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
                  <div className="min-h-0 flex-1 overflow-y-auto border-b border-[var(--brand-border)] p-4 lg:border-b-0 lg:border-r">
                    {filtered.length === 0 ? (
                      <p className="py-8 text-center text-sm text-[var(--brand-text-secondary)]">
                        No images match your search.
                      </p>
                    ) : (
                      <ul className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
                        {filtered.map((item) => (
                          <li key={item.id}>
                            <ImagePickerCard
                              item={item}
                              selected={activeSelectedId === item.id}
                              disabled={pending || item.id === currentImageId}
                              onSelect={() => setSelectedId(item.id)}
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <aside className="flex w-full shrink-0 flex-col border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] p-4 lg:w-72 lg:border-l">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
                      Preview
                    </p>
                    {selected ? (
                      <>
                        <div className="relative mt-3 aspect-square w-full overflow-hidden rounded-xl border border-[var(--brand-border)] bg-[var(--studio-empty-fill)]">
                          {selected.url ? (
                            <Image
                              src={selected.url}
                              alt=""
                              fill
                              className="object-contain"
                              unoptimized
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[var(--brand-text-secondary)]">
                              No preview
                            </div>
                          )}
                        </div>
                        <ImagePickerMeta item={selected} className="mt-3" />
                      </>
                    ) : (
                      <p className="mt-6 text-sm text-[var(--brand-text-secondary)]">
                        Select an image to preview before assigning.
                      </p>
                    )}
                  </aside>
                </div>

                <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-[var(--brand-border)] px-5 py-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={pending}
                    className={studioBtnSecondary}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={
                      pending ||
                      !activeSelectedId ||
                      activeSelectedId === currentImageId
                    }
                    className={studioBtnPrimary}
                  >
                    {pending ? "Assigning…" : "Confirm selection"}
                  </button>
                </footer>
              </>
            )}
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}

function ImagePickerCard({
  item,
  selected,
  disabled,
  onSelect,
}: {
  item: ImagePickerItem;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={`flex w-full flex-col overflow-hidden rounded-xl border text-left transition ${
        selected
          ? "border-violet-500/60 ring-2 ring-violet-500/30"
          : "border-[var(--brand-border)] hover:border-violet-400/40"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      <div className="relative aspect-square min-h-[120px] w-full bg-[var(--studio-empty-fill)]">
        {item.url ? (
          <Image
            src={item.url}
            alt=""
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <span className="flex h-full items-center justify-center text-[var(--brand-text-secondary)]">
            ?
          </span>
        )}
      </div>
      <div className="space-y-1 p-2">
        <p className="line-clamp-2 text-xs font-medium text-[var(--brand-text-secondary)]">
          {item.title}
        </p>
        <p className="text-[10px] text-[var(--brand-text-secondary)]">{item.originLabel}</p>
        {item.slotLabels.length > 0 && (
          <p className="line-clamp-1 text-[10px] text-emerald-400/90">
            {item.slotLabels.join(" · ")}
          </p>
        )}
      </div>
    </button>
  );
}

function ImagePickerMeta({
  item,
  className = "",
}: {
  item: ImagePickerItem;
  className?: string;
}) {
  const date = formatPickerDate(item.createdAt);

  return (
    <div className={`space-y-2 ${className}`}>
      <p className="text-sm font-medium text-[var(--brand-text-secondary)]">{item.title}</p>
      <p className="text-xs text-[var(--brand-text-secondary)]">{item.originLabel}</p>
      {item.slotLabels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.slotLabels.map((label) => (
            <span
              key={label}
              className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300"
            >
              {label}
            </span>
          ))}
        </div>
      )}
      {date && (
        <p className="text-[10px] text-[var(--brand-text-secondary)]">Added {date}</p>
      )}
    </div>
  );
}
