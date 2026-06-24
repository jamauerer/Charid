/** Shared project workspace section ids — must not live in a "use client" file (server pages import this). */

export const PROJECT_TABS = [
  "overview",
  "stories",
  "characters",
  "worlds",
  "relationships",
] as const;

export type ProjectTab = (typeof PROJECT_TABS)[number];

export const PROJECT_TAB_LABELS: Record<ProjectTab, string> = {
  overview: "Overview",
  stories: "Stories",
  characters: "Characters",
  worlds: "Setting",
  relationships: "Relationships",
};

export function isProjectTab(value: string): value is ProjectTab {
  return (PROJECT_TABS as readonly string[]).includes(value);
}

/** Canonical project workspace navigation sections. */
export const PROJECT_WORKSPACE_SECTIONS = [
  { id: "characters", sectionId: "project-characters", label: "Characters" },
  { id: "locations", sectionId: "project-locations", label: "Locations" },
  { id: "stories", sectionId: "project-stories", label: "Stories" },
  { id: "scenes", sectionId: "project-scenes", label: "Scenes" },
  { id: "timeline", sectionId: "project-timeline", label: "Timeline" },
  { id: "assets", sectionId: "project-assets", label: "Assets" },
  { id: "organizations", sectionId: "project-organizations", label: "Organizations" },
  { id: "production", sectionId: "project-production", label: "Production" },
] as const;

export type ProjectWorkspaceSection =
  (typeof PROJECT_WORKSPACE_SECTIONS)[number]["id"];

export function isProjectWorkspaceSection(
  value: string
): value is ProjectWorkspaceSection {
  return PROJECT_WORKSPACE_SECTIONS.some((section) => section.id === value);
}

export function projectWorkspaceSectionToHash(
  section: ProjectWorkspaceSection
): string {
  return (
    PROJECT_WORKSPACE_SECTIONS.find((entry) => entry.id === section)?.sectionId ??
    ""
  );
}

/** In-page section ids (includes legacy + secondary sections). */
export const PROJECT_SECTION_IDS = {
  whatsNext: "project-whats-next",
  styleReferences: "project-style-references",
  story: "project-stories",
  characters: "project-characters",
  locations: "project-locations",
  scenes: "project-scenes",
  timeline: "project-timeline",
  assets: "project-assets",
  organizations: "project-organizations",
  production: "project-production",
  setting: "project-setting",
  connections: "project-connections",
  notes: "project-notes",
} as const;

/** Maps legacy ?tab= query values to section hashes for deep-link compatibility. */
export function projectTabToSectionHash(tab: ProjectTab): string | null {
  switch (tab) {
    case "overview":
      return null;
    case "stories":
      return PROJECT_SECTION_IDS.story;
    case "characters":
      return PROJECT_SECTION_IDS.characters;
    case "worlds":
      return PROJECT_SECTION_IDS.locations;
    case "relationships":
      return PROJECT_SECTION_IDS.connections;
    default:
      return null;
  }
}

export function resolveProjectScrollSection(input: {
  tab?: string | null;
  section?: string | null;
}): string | null {
  if (input.section && isProjectWorkspaceSection(input.section)) {
    return projectWorkspaceSectionToHash(input.section);
  }
  if (input.tab && isProjectTab(input.tab)) {
    return projectTabToSectionHash(input.tab);
  }
  return null;
}
