export type StoryBible = {
  story_id: string;
  user_id: string;
  summary: string | null;
  themes: string | null;
  tone: string | null;
  timeline: string | null;
  major_events: string | null;
  key_characters: string | null;
  key_locations: string | null;
  notes: string | null;
  version_label: string;
  is_current: boolean;
  created_at: string;
  updated_at: string;
};

export type StoryBibleRow = StoryBible;

export function emptyStoryBible(
  storyId: string,
  userId: string,
  summary: string | null = null
): StoryBible {
  const now = new Date().toISOString();
  return {
    story_id: storyId,
    user_id: userId,
    summary,
    themes: null,
    tone: null,
    timeline: null,
    major_events: null,
    key_characters: null,
    key_locations: null,
    notes: null,
    version_label: "Current",
    is_current: true,
    created_at: now,
    updated_at: now,
  };
}

export function normalizeStoryBible(row: StoryBibleRow): StoryBible {
  return {
    story_id: row.story_id,
    user_id: row.user_id,
    summary: row.summary ?? null,
    themes: row.themes ?? null,
    tone: row.tone ?? null,
    timeline: row.timeline ?? null,
    major_events: row.major_events ?? null,
    key_characters: row.key_characters ?? null,
    key_locations: row.key_locations ?? null,
    notes: row.notes ?? null,
    version_label: row.version_label ?? "Current",
    is_current: row.is_current ?? true,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
