"use client";

import Link from "next/link";

export type StudioTimelineItem = {
  id: string;
  label: string;
  href: string;
  thumbnailLabel?: string;
};

type StudioTimelineProps = {
  items: StudioTimelineItem[];
  activeId: string;
  /** book | film | advertisement — architecture for future project types */
  mode?: "book" | "film" | "advertisement";
};

/** Floating page strip — matches docs/charid_editor_layout.html */
export function StudioTimeline({ items, activeId }: StudioTimelineProps) {
  return (
    <div className="charid-editor-page-strip" aria-label="Page strip">
      {items.map((item, index) => {
        const active = item.id === activeId;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={`charid-editor-page-thumb ${active ? "charid-editor-page-thumb-active" : ""}`}
            title={item.label}
          >
            {item.thumbnailLabel ?? index + 1}
          </Link>
        );
      })}
      <button type="button" disabled className="charid-editor-page-add" title="Add page — coming soon">
        +
      </button>
    </div>
  );
}
