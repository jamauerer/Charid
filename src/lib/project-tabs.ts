/** Shared project workspace tab ids — must not live in a "use client" file (server pages import this). */

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

/** In-page section anchors (replaces ?tab= navigation). */
export const PROJECT_SECTION_IDS = {
  whatsNext: "project-whats-next",
  styleReferences: "project-style-references",
  story: "project-story",
  characters: "project-characters",
  scenes: "project-scenes",
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
      return PROJECT_SECTION_IDS.setting;
    case "relationships":
      return PROJECT_SECTION_IDS.connections;
    default:
      return null;
  }
}
