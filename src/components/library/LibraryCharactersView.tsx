"use client";

import Link from "next/link";
import { useCallback } from "react";
import type { LibraryCharacterItem } from "@/app/actions/library";
import { CharacterPortraitImage } from "@/components/character-bible/CharacterPortraitImage";
import {
  formatRelationshipList,
  LibraryCardLinks,
  LibraryCardOverflowMenu,
  LibraryOriginReserved,
  LibraryRelationshipStats,
  LibraryUsedInBlock,
} from "@/components/library/library-card-parts";
import { LibraryItemCard } from "@/components/library/LibraryItemCard";
import { LibraryProjectLink } from "@/components/library/LibraryProjectLink";
import {
  formatLibraryDate,
  LibraryToolbar,
  useLibraryListFilters,
} from "@/components/library/LibraryToolbar";
import { CardCoverPlaceholder } from "@/components/studio/CardCoverPlaceholder";
import { StudioEmptyState } from "@/components/studio/StudioEmptyState";
import { dsAlertWarning } from "@/lib/design-system";

type LibraryCharactersViewProps = {
  items: LibraryCharacterItem[];
  error?: string;
};

export function LibraryCharactersView({ items, error }: LibraryCharactersViewProps) {
  const searchKeys = useCallback(
    (item: LibraryCharacterItem) => [
      item.name,
      ...item.tags,
      ...item.storyTitles,
      item.project?.title,
      ...item.projects.map((project) => project.title),
    ],
    []
  );
  const filters = useLibraryListFilters(items, searchKeys, "workedAt");

  return (
    <div>
      {error && <div className={`mb-4 ${dsAlertWarning}`}>{error}</div>}

      <LibraryToolbar
        searchPlaceholder="Search characters…"
        search={filters.search}
        onSearchChange={filters.setSearch}
        sort={filters.sort}
        onSortChange={filters.setSort}
        projectFilter={filters.projectFilter}
        onProjectFilterChange={filters.setProjectFilter}
        projectOptions={filters.projectOptions}
        count={items.length}
        filteredCount={filters.filtered.length}
      />

      {items.length === 0 ? (
        <StudioEmptyState
          headline="No characters yet"
          description="Create characters inside a project — they'll appear here for easy reuse."
        />
      ) : filters.filtered.length === 0 ? (
        <LibraryNoMatches />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filters.filtered.map((item) => (
            <LibraryItemCard
              key={item.id}
              href={item.href}
              title={item.name}
              subtitle={`Last worked on ${formatLibraryDate(item.workedAt)}`}
              libraryKind="character"
              libraryId={item.id}
              projectId={item.project?.id}
              actions={<LibraryCardOverflowMenu entityLabel={item.name} />}
              image={
                <div className="relative aspect-[4/5] overflow-hidden bg-[var(--studio-empty-fill)]">
                  {item.photoUrl ? (
                    <CharacterPortraitImage
                      photoUrl={item.photoUrl}
                      alt={item.name}
                      focalY={item.portraitFocalY}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <CardCoverPlaceholder title="No portrait" compact />
                  )}
                </div>
              }
              relationships={
                <LibraryRelationshipStats
                  stats={[
                    { label: "stories", value: item.storyCount },
                    { label: "projects", value: item.projects.length },
                    { label: "scenes", value: item.sceneCount },
                    { label: "references", value: item.referenceImageCount },
                    { label: "assets", value: item.assetCount },
                  ]}
                />
              }
              footer={
                <div className="space-y-2">
                  {item.storyTitles.length > 0 && (
                    <p className="line-clamp-2 text-[10px] text-[var(--brand-text-muted)]">
                      Stories: {formatRelationshipList(item.storyTitles)}
                    </p>
                  )}
                  <LibraryProjectLink project={item.project} />
                  <LibraryUsedInBlock
                    entries={[
                      {
                        label: "Projects",
                        value: item.projects.length > 0 ? item.projects.length : null,
                      },
                      {
                        label: "Stories",
                        value: item.storyCount > 0 ? item.storyCount : null,
                      },
                      { label: "Comic pages", future: true },
                      { label: "Storybooks", future: true },
                    ]}
                  />
                  <LibraryOriginReserved />
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-[var(--brand-surface-elevated)] px-1.5 py-0.5 text-[10px] text-[var(--brand-text-muted)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <LibraryCardLinks
                    openHref={item.href}
                    openLabel="Open character"
                    project={item.project}
                    story={item.stories[0] ?? null}
                  />
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LibraryNoMatches() {
  return (
    <div className="rounded-xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 py-8 text-center">
      <p className="text-sm font-medium text-[var(--foreground)]">No matches found</p>
      <p className="mt-1 text-xs text-[var(--brand-text-muted)]">Try a different search or filter.</p>
    </div>
  );
}

export { LibraryNoMatches };
