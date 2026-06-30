"use client";

import Link from "next/link";

export type EditorPageStripItem = {
  id: string;
  label: string;
  href: string;
  thumbnailLabel?: string;
};

type EditorPageStripProps = {
  items: EditorPageStripItem[];
  activeId: string;
};

/** Floating page strip — matches `.page-strip` in the HTML reference */
export function EditorPageStrip({ items, activeId }: EditorPageStripProps) {
  return (
    <div className="page-strip" aria-label="Page strip">
      {items.map((item, index) => {
        const active = item.id === activeId;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`page-thumb${active ? " active" : ""}`}
            title={item.label}
          >
            {item.thumbnailLabel ?? index + 1}
          </Link>
        );
      })}
      <button type="button" disabled className="page-add-btn" title="Add page — coming soon">
        +
      </button>
    </div>
  );
}
