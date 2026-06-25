export const LIBRARY_SECTIONS = [
  { id: "recent", label: "Continue Creating", href: "/dashboard/library/recent" },
  { id: "characters", label: "Characters", href: "/dashboard/library/characters" },
  { id: "stories", label: "Stories", href: "/dashboard/library/stories" },
  { id: "scenes", label: "Scenes", href: "/dashboard/library/scenes" },
  { id: "assets", label: "Assets", href: "/dashboard/library/assets" },
  { id: "references", label: "Reference Images", href: "/dashboard/library/references" },
] as const;

export type LibrarySectionId = (typeof LIBRARY_SECTIONS)[number]["id"];

export function libraryPath(section: LibrarySectionId = "recent"): string {
  return `/dashboard/library/${section}`;
}

export function librarySearchPath(query: string): string {
  const encoded = encodeURIComponent(query.trim());
  return `/dashboard/library/search?q=${encoded}`;
}

export function isLibrarySectionId(value: string): value is LibrarySectionId {
  return LIBRARY_SECTIONS.some((section) => section.id === value);
}
