"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { LibraryAssetItem } from "@/app/actions/library";
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
import { formatLibraryDate, LibraryToolbar } from "@/components/library/LibraryToolbar";
import { CardCoverPlaceholder } from "@/components/studio/CardCoverPlaceholder";
import { StudioEmptyState } from "@/components/studio/StudioEmptyState";
import { dsAlertWarning, dsInput } from "@/lib/design-system";
import type { LibrarySortOption } from "@/components/library/LibraryToolbar";

type LibraryAssetsViewProps = {
  items: LibraryAssetItem[];
  error?: string;
};

export function LibraryAssetsView({ items, error }: LibraryAssetsViewProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<LibrarySortOption>("updated");
  const [projectFilter, setProjectFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const projectOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of items) {
      if (item.project) map.set(item.project.id, item.project.title);
    }
    return [...map.entries()].map(([id, title]) => ({ id, title }));
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let next = items;
    if (q) {
      next = next.filter((item) =>
        [item.name, item.assetType, ...item.storyTitles, item.project?.title].some((value) =>
          value?.toLowerCase().includes(q)
        )
      );
    }
    if (projectFilter !== "all") {
      next = next.filter((item) => item.project?.id === projectFilter);
    }
    if (typeFilter !== "all") {
      next = next.filter((item) => item.assetType === typeFilter);
    }
    return [...next].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      return b.workedAt.localeCompare(a.workedAt);
    });
  }, [items, projectFilter, search, sort, typeFilter]);

  return (
    <div>
      {error && <div className={`mb-4 ${dsAlertWarning}`}>{error}</div>}

      <LibraryToolbar
        searchPlaceholder="Search assets…"
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
        projectFilter={projectFilter}
        onProjectFilterChange={setProjectFilter}
        projectOptions={projectOptions}
        count={items.length}
        filteredCount={filtered.length}
      />

      <div className="mb-4">
        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
          className={`${dsInput} py-2 text-sm`}
          aria-label="Filter by type"
        >
          <option value="all">All types</option>
          <option value="Character">Character</option>
          <option value="Setting">Setting</option>
          <option value="Story">Story</option>
        </select>
      </div>

      {items.length === 0 ? (
        <StudioEmptyState
          headline="No assets yet"
          description="Gallery images from characters, settings, and stories will appear here."
        />
      ) : filtered.length === 0 ? (
        <LibraryNoMatches />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((item) => (
            <LibraryItemCard
              key={`${item.assetType}-${item.id}`}
              href={item.href}
              title={item.name}
              subtitle={`${item.assetType} · Last worked on ${formatLibraryDate(item.workedAt)}`}
              libraryKind="asset"
              libraryId={item.id}
              projectId={item.project?.id}
              actions={<LibraryCardOverflowMenu entityLabel={item.name} />}
              image={
                item.thumbnailUrl ? (
                  <div className="relative aspect-square overflow-hidden bg-[var(--studio-empty-fill)]">
                    <Image src={item.thumbnailUrl} alt="" fill className="object-cover" unoptimized />
                  </div>
                ) : (
                  <div className="aspect-square">
                    <CardCoverPlaceholder title="No preview" compact />
                  </div>
                )
              }
              relationships={
                <LibraryRelationshipStats
                  stats={[
                    { label: "Type", value: item.assetType },
                    { label: "stories", value: item.storyCount },
                    { label: "projects", value: item.project ? 1 : 0 },
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
                        label: "Stories",
                        value: item.storyCount > 0 ? item.storyCount : null,
                      },
                      { label: "Projects", value: item.project ? 1 : null },
                      { label: "Pages", future: true },
                    ]}
                  />
                  <LibraryOriginReserved />
                  <LibraryCardLinks
                    openHref={item.href}
                    openLabel="Open asset"
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
