import type { ReactNode } from "react";
import { studioCardSurface } from "@/lib/visual-identity";

type LibraryItemCardProps = {
  href: string;
  title: string;
  subtitle?: string | null;
  meta?: ReactNode;
  image?: ReactNode;
  relationships?: ReactNode;
  footer?: ReactNode;
  actions?: ReactNode;
  libraryKind: string;
  libraryId: string;
  projectId?: string | null;
  storyId?: string | null;
};

/**
 * Reusable library card — prepared for future drag into studio editors.
 * Editing links out to existing workspaces; no inline editing here.
 */
export function LibraryItemCard({
  href,
  title,
  subtitle,
  meta,
  image,
  relationships,
  footer,
  actions,
  libraryKind,
  libraryId,
  projectId,
  storyId,
}: LibraryItemCardProps) {
  return (
    <article
      className={`library-item-card group relative ${studioCardSurface}`}
      data-library-kind={libraryKind}
      data-library-id={libraryId}
      data-library-draggable="pending"
      data-library-project-id={projectId ?? undefined}
      data-library-story-id={storyId ?? undefined}
      data-library-insertable="pending"
    >
      {actions}
      <a href={href} className="block">
        {image && <div className="library-item-card-media">{image}</div>}
        <div className="px-2.5 py-2">
          <div className="flex items-start justify-between gap-2 pr-6">
            <h3 className="truncate text-sm font-medium text-[var(--foreground)]">{title}</h3>
            {meta}
          </div>
          {subtitle && (
            <p className="mt-0.5 line-clamp-1 text-[11px] text-[var(--brand-text-muted)]">
              {subtitle}
            </p>
          )}
          {relationships && <div className="mt-2">{relationships}</div>}
          {footer && <div className="mt-2">{footer}</div>}
        </div>
      </a>
    </article>
  );
}
