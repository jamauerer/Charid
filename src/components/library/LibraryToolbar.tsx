"use client";

import { useMemo, useState } from "react";
import { dsInput } from "@/lib/design-system";

export type LibrarySortOption = "updated" | "name";

type LibraryToolbarProps = {
  searchPlaceholder: string;
  search: string;
  onSearchChange: (value: string) => void;
  sort: LibrarySortOption;
  onSortChange: (value: LibrarySortOption) => void;
  projectFilter?: string;
  onProjectFilterChange?: (value: string) => void;
  projectOptions?: { id: string; title: string }[];
  count: number;
  filteredCount: number;
};

export function LibraryToolbar({
  searchPlaceholder,
  search,
  onSearchChange,
  sort,
  onSortChange,
  projectFilter,
  onProjectFilterChange,
  projectOptions,
  count,
  filteredCount,
}: LibraryToolbarProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="relative min-w-[12rem] flex-1 sm:max-w-xs">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--brand-text-muted)]"
          aria-hidden
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
            clipRule="evenodd"
          />
        </svg>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className={`${dsInput} w-full py-2 pl-9`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {projectOptions && onProjectFilterChange && (
          <select
            value={projectFilter ?? "all"}
            onChange={(event) => onProjectFilterChange(event.target.value)}
            className={`${dsInput} py-2 text-sm`}
            aria-label="Filter by project"
          >
            <option value="all">All projects</option>
            {projectOptions.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        )}
        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value as LibrarySortOption)}
          className={`${dsInput} py-2 text-sm`}
          aria-label="Sort"
        >
          <option value="updated">Last worked on</option>
          <option value="name">Name</option>
        </select>
        <span className="text-xs tabular-nums text-[var(--brand-text-muted)]">
          {filteredCount === count ? count : `${filteredCount} of ${count}`}
        </span>
      </div>
    </div>
  );
}

export function useLibraryListFilters<
  T extends {
    name?: string;
    title?: string;
    updatedAt: string;
    workedAt?: string;
    project?: { id: string; title?: string } | null;
  },
>(
  items: T[],
  searchKeys: (item: T) => (string | null | undefined)[],
  sortDateField: "updatedAt" | "workedAt" = "updatedAt"
) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<LibrarySortOption>("updated");
  const [projectFilter, setProjectFilter] = useState("all");

  const projectOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of items) {
      if (item.project?.id && item.project.title) {
        map.set(item.project.id, item.project.title);
      }
    }
    return [...map.entries()].map(([id, title]) => ({ id, title }));
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let next = items;
    if (q) {
      next = next.filter((item) =>
        searchKeys(item).some((value) => value?.toLowerCase().includes(q))
      );
    }
    if (projectFilter !== "all") {
      next = next.filter((item) => item.project?.id === projectFilter);
    }
    next = [...next].sort((a, b) => {
      if (sort === "name") {
        const aName = (a.name ?? a.title ?? "").toLowerCase();
        const bName = (b.name ?? b.title ?? "").toLowerCase();
        return aName.localeCompare(bName);
      }
      const aDate = (sortDateField === "workedAt" ? a.workedAt : undefined) ?? a.updatedAt;
      const bDate = (sortDateField === "workedAt" ? b.workedAt : undefined) ?? b.updatedAt;
      return bDate.localeCompare(aDate);
    });
    return next;
  }, [items, projectFilter, search, searchKeys, sort, sortDateField]);

  return {
    search,
    setSearch,
    sort,
    setSort,
    projectFilter,
    setProjectFilter,
    projectOptions,
    filtered,
  };
}

export function formatLibraryDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
