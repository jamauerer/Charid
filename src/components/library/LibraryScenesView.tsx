"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { LibrarySceneItem } from "@/app/actions/library";
import {
  formatRelationshipList,
  LibraryCardLinks,
  LibraryCardOverflowMenu,
  LibraryOriginReserved,
  LibraryRelationshipStats,
  LibraryStoryLink,
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

type LibraryScenesViewProps = {
  items: LibrarySceneItem[];
  error?: string;
};

export function LibraryScenesView({ items, error }: LibraryScenesViewProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<LibrarySortOption>("updated");
  const [projectFilter, setProjectFilter] = useState("all");
  const [storyFilter, setStoryFilter] = useState("all");

  const projectOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of items) {
      if (item.project) map.set(item.project.id, item.project.title);
    }
    return [...map.entries()].map(([id, title]) => ({ id, title }));
  }, [items]);

  const storyOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of items) {
      map.set(item.storyId, item.storyTitle);
    }
    return [...map.entries()].map(([id, title]) => ({ id, title }));
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let next = items;
    if (q) {
      next = next.filter((item) =>
        [item.title, item.storyTitle, ...item.characterNames, item.project?.title].some(
          (value) => value?.toLowerCase().includes(q)
        )
      );
    }
    if (projectFilter !== "all") {
      next = next.filter((item) => item.project?.id === projectFilter);
    }
    if (storyFilter !== "all") {
      next = next.filter((item) => item.storyId === storyFilter);
    }
    return [...next].sort((a, b) => {
      if (sort === "name") return a.title.localeCompare(b.title);
      return b.workedAt.localeCompare(a.workedAt);
    });
  }, [items, projectFilter, search, sort, storyFilter]);

  return (
    <div>
      {error && <div className={`mb-4 ${dsAlertWarning}`}>{error}</div>}

      <LibraryToolbar
        searchPlaceholder="Search scenes…"
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

      {storyOptions.length > 1 && (
        <div className="mb-4">
          <select
            value={storyFilter}
            onChange={(event) => setStoryFilter(event.target.value)}
            className={`${dsInput} py-2 text-sm`}
            aria-label="Filter by story"
          >
            <option value="all">All stories</option>
            {storyOptions.map((story) => (
              <option key={story.id} value={story.id}>
                {story.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {items.length === 0 ? (
        <StudioEmptyState
          headline="No scenes yet"
          description="Scenes from your stories will appear here as you build your timeline."
        />
      ) : filtered.length === 0 ? (
        <LibraryNoMatches />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <LibraryItemCard
              key={item.id}
              href={item.href}
              title={item.title}
              subtitle={`${item.storyTitle} · Last worked on ${formatLibraryDate(item.workedAt)}`}
              libraryKind="scene"
              libraryId={item.id}
              projectId={item.project?.id}
              storyId={item.storyId}
              actions={<LibraryCardOverflowMenu entityLabel={item.title} />}
              meta={
                <span className="shrink-0 rounded bg-[var(--brand-surface-elevated)] px-1.5 py-0.5 text-[10px] text-[var(--brand-text-muted)]">
                  #{item.timelinePosition}
                </span>
              }
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
                    { label: "Timeline", value: `#${item.timelinePosition}` },
                    {
                      label: "characters",
                      value: item.characterNames.length,
                    },
                  ]}
                />
              }
              footer={
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-1 text-[10px]">
                    <span className="text-[var(--brand-text-muted)]">Story:</span>
                    <LibraryStoryLink story={item.story} />
                  </div>
                  {item.characterNames.length > 0 && (
                    <p className="line-clamp-2 text-[10px] text-[var(--brand-text-muted)]">
                      Characters: {formatRelationshipList(item.characterNames)}
                    </p>
                  )}
                  <LibraryProjectLink project={item.project} />
                  <LibraryUsedInBlock
                    entries={[
                      { label: "Story", value: item.storyTitle },
                      { label: "Project", value: item.project?.title ?? null },
                      { label: "Comic pages", future: true },
                    ]}
                  />
                  <LibraryOriginReserved />
                  <LibraryCardLinks
                    openHref={item.href}
                    openLabel="Open scene"
                    project={item.project}
                    story={item.story}
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
