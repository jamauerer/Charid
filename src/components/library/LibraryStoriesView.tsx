"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";
import type { LibraryStoryItem } from "@/app/actions/library";
import {
  formatRelationshipList,
  LibraryCardLinks,
  LibraryCardOverflowMenu,
  LibraryOriginReserved,
  LibraryRelationshipStats,
  LibraryUsedInBlock,
} from "@/components/library/library-card-parts";
import { LibraryItemCard } from "@/components/library/LibraryItemCard";
import { LibraryNoMatches } from "@/components/library/LibraryCharactersView";
import { LibraryProjectLink } from "@/components/library/LibraryProjectLink";
import {
  formatLibraryDate,
  LibraryToolbar,
  useLibraryListFilters,
} from "@/components/library/LibraryToolbar";
import { StoryStatusBadge } from "@/components/StoryStatusBadge";
import type { StoryStatus } from "@/types/story";
import { CardCoverPlaceholder } from "@/components/studio/CardCoverPlaceholder";
import { StudioEmptyState } from "@/components/studio/StudioEmptyState";
import { dsAlertWarning } from "@/lib/design-system";

type LibraryStoriesViewProps = {
  items: LibraryStoryItem[];
  error?: string;
};

export function LibraryStoriesView({ items, error }: LibraryStoriesViewProps) {
  const searchKeys = useCallback(
    (item: LibraryStoryItem) => [
      item.title,
      item.status,
      ...item.characterNames,
      item.project?.title,
    ],
    []
  );
  const filters = useLibraryListFilters(items, searchKeys, "workedAt");

  return (
    <div>
      {error && <div className={`mb-4 ${dsAlertWarning}`}>{error}</div>}

      <LibraryToolbar
        searchPlaceholder="Search stories…"
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
          headline="No stories yet"
          description="Stories you create in projects will show up here."
        />
      ) : filters.filtered.length === 0 ? (
        <LibraryNoMatches />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filters.filtered.map((item) => (
            <LibraryItemCard
              key={item.id}
              href={item.href}
              title={item.title}
              subtitle={`Last worked on ${formatLibraryDate(item.workedAt)}`}
              libraryKind="story"
              libraryId={item.id}
              projectId={item.project?.id}
              storyId={item.id}
              actions={<LibraryCardOverflowMenu entityLabel={item.title} />}
              meta={<StoryStatusBadge status={item.status as StoryStatus} />}
              image={
                item.coverUrl ? (
                  <div className="relative aspect-video overflow-hidden bg-[var(--studio-empty-fill)]">
                    <Image src={item.coverUrl} alt="" fill className="object-cover" unoptimized />
                  </div>
                ) : (
                  <div className="aspect-video">
                    <CardCoverPlaceholder title="No cover" compact />
                  </div>
                )
              }
              relationships={
                <LibraryRelationshipStats
                  stats={[
                    { label: "characters", value: item.characterCount },
                    { label: "scenes", value: item.sceneCount },
                    { label: "assets", value: item.assetCount },
                    { label: "Status", value: item.status },
                  ]}
                />
              }
              footer={
                <div className="space-y-2">
                  {item.characterNames.length > 0 && (
                    <p className="line-clamp-2 text-[10px] text-[var(--brand-text-muted)]">
                      Characters: {formatRelationshipList(item.characterNames)}
                    </p>
                  )}
                  <LibraryProjectLink project={item.project} />
                  <LibraryUsedInBlock
                    entries={[
                      {
                        label: "Projects",
                        value: item.project ? 1 : null,
                      },
                      { label: "Scenes", value: item.sceneCount > 0 ? item.sceneCount : null },
                      { label: "Comic pages", future: true },
                      { label: "Storybooks", future: true },
                    ]}
                  />
                  <LibraryOriginReserved />
                  <LibraryCardLinks
                    openHref={item.href}
                    openLabel="Open story"
                    project={item.project}
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
