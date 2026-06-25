"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo } from "react";
import type { LibraryReferenceItem } from "@/app/actions/library";
import {
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
import { CardCoverPlaceholder } from "@/components/studio/CardCoverPlaceholder";
import { StudioEmptyState } from "@/components/studio/StudioEmptyState";
import { dsAlertWarning } from "@/lib/design-system";

type LibraryReferencesViewProps = {
  items: LibraryReferenceItem[];
  error?: string;
};

export function LibraryReferencesView({ items, error }: LibraryReferencesViewProps) {
  const withLabels = useMemo(
    () => items.map((item) => ({ ...item, name: item.characterName, title: item.characterName })),
    [items]
  );
  const searchKeys = useCallback(
    (item: LibraryReferenceItem & { name: string }) =>
      [item.characterName, ...item.tags, item.project?.title],
    []
  );
  const filters = useLibraryListFilters(withLabels, searchKeys, "workedAt");

  return (
    <div>
      {error && <div className={`mb-4 ${dsAlertWarning}`}>{error}</div>}

      <LibraryToolbar
        searchPlaceholder="Search reference images…"
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
          headline="No reference images yet"
          description="Assign reference or main portrait roles in character galleries — they'll show up here."
        />
      ) : filters.filtered.length === 0 ? (
        <LibraryNoMatches />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filters.filtered.map((item) => (
            <LibraryItemCard
              key={item.id}
              href={item.href}
              title={item.characterName}
              subtitle={`Reference · Last worked on ${formatLibraryDate(item.workedAt)}`}
              libraryKind="reference"
              libraryId={item.id}
              projectId={item.project?.id}
              actions={<LibraryCardOverflowMenu entityLabel={item.characterName} />}
              image={
                item.imageUrl ? (
                  <div className="relative aspect-square overflow-hidden bg-[var(--studio-empty-fill)]">
                    <Image src={item.imageUrl} alt="" fill className="object-cover" unoptimized />
                  </div>
                ) : (
                  <div className="aspect-square">
                    <CardCoverPlaceholder title="No image" compact />
                  </div>
                )
              }
              relationships={
                <LibraryRelationshipStats
                  stats={[
                    {
                      label: "Character",
                      value: item.characterName,
                    },
                  ]}
                />
              }
              footer={
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-1 text-[10px]">
                    <span className="text-[var(--brand-text-muted)]">Character:</span>
                    <Link
                      href={item.characterHref}
                      className="font-medium text-[var(--brand-text-secondary)] hover:text-[var(--foreground)]"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {item.characterName}
                    </Link>
                  </div>
                  <LibraryProjectLink project={item.project} />
                  <LibraryUsedInBlock
                    entries={[
                      { label: "Character", value: item.characterName },
                      { label: "Project", value: item.project?.title ?? null },
                      { label: "Comic panels", future: true },
                    ]}
                  />
                  <LibraryOriginReserved />
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-[var(--brand-surface-elevated)] px-1.5 py-0.5 text-[10px] capitalize text-[var(--brand-text-muted)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <LibraryCardLinks
                    openHref={item.characterHref}
                    openLabel="Open character"
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
