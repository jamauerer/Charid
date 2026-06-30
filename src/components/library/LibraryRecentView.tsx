"use client";

import Image from "next/image";
import Link from "next/link";
import type { LibraryContinueItem } from "@/app/actions/library";
import { CharacterPortraitImage } from "@/components/character-bible/CharacterPortraitImage";
import { LibraryCardLinks } from "@/components/library/library-card-parts";
import { LibraryProjectLink } from "@/components/library/LibraryProjectLink";
import { formatLibraryDate } from "@/components/library/LibraryToolbar";
import { CardCoverPlaceholder } from "@/components/studio/CardCoverPlaceholder";
import { StudioEmptyState } from "@/components/studio/StudioEmptyState";
import { studioCardSurface } from "@/lib/visual-identity";
import { dsAlertWarning } from "@/lib/design-system";

const KIND_LABELS: Record<LibraryContinueItem["kind"], string> = {
  character: "Character",
  story: "Story",
  scene: "Scene",
  asset: "Asset",
  project: "Project",
};

const OPEN_LABELS: Record<LibraryContinueItem["kind"], string> = {
  character: "Open character",
  story: "Open story",
  scene: "Open scene",
  asset: "Open asset",
  project: "Open project",
};

type LibraryContinueCreatingViewProps = {
  items: LibraryContinueItem[];
  error?: string;
};

export function LibraryContinueCreatingView({ items, error }: LibraryContinueCreatingViewProps) {
  return (
    <div>
      {error && <div className={`mb-4 ${dsAlertWarning}`}>{error}</div>}

      <p className="mb-4 text-sm text-[var(--brand-text-secondary)]">
        Pick up where you left off — sorted by what you worked on most recently.
      </p>

      {items.length === 0 ? (
        <StudioEmptyState
          headline="Nothing to continue yet"
          description="Your latest creative work will appear here as you build in projects."
        />
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={`${item.kind}-${item.id}`}>
              <article
                className={`flex flex-col gap-2 sm:flex-row sm:items-center ${studioCardSurface} px-3 py-2.5`}
                data-library-kind={item.kind}
                data-library-id={item.id}
                data-library-draggable="pending"
                data-library-insertable="pending"
                data-library-project-id={item.project?.id}
                data-library-story-id={item.story?.id}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                <Link
                  href={item.href}
                  className="flex min-w-0 flex-1 items-center gap-3 transition hover:opacity-90"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-[var(--studio-empty-fill)]">
                    {item.imageUrl ? (
                      item.kind === "character" ? (
                        <CharacterPortraitImage
                          photoUrl={item.imageUrl}
                          alt=""
                          focalY={item.portraitFocalY ?? 50}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Image src={item.imageUrl} alt="" fill className="object-cover" unoptimized />
                      )
                    ) : (
                      <CardCoverPlaceholder title="" compact />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-medium text-[var(--foreground)]">
                        {item.title}
                      </span>
                      <span className="rounded bg-[var(--brand-surface-elevated)] px-1.5 py-0.5 text-[10px] text-[var(--brand-text-muted)]">
                        {KIND_LABELS[item.kind]}
                      </span>
                    </div>
                    {item.subtitle && (
                      <p className="mt-0.5 truncate text-xs text-[var(--brand-text-muted)]">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </Link>
                <div className="flex flex-wrap items-center gap-2 pl-[3.75rem] sm:pl-0">
                  <LibraryProjectLink project={item.project} />
                  <span className="text-[10px] text-[var(--brand-text-muted)]">
                    · Last worked on {formatLibraryDate(item.workedAt)}
                  </span>
                </div>
                </div>
                <div className="shrink-0 sm:pl-0 pl-[3.75rem]">
                  <LibraryCardLinks
                    openHref={item.href}
                    openLabel={OPEN_LABELS[item.kind]}
                    project={item.project}
                    story={item.story}
                  />
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** @deprecated Use LibraryContinueCreatingView */
export const LibraryRecentView = LibraryContinueCreatingView;
