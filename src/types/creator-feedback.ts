export const FEEDBACK_ENTITY_TYPES = [
  "character",
  "world",
  "story",
  "generation",
] as const;

export type FeedbackEntityType = (typeof FEEDBACK_ENTITY_TYPES)[number];

export const FEEDBACK_TYPES = [
  "vision_rating",
  "generation_quality",
  "other",
] as const;

export type FeedbackType = (typeof FEEDBACK_TYPES)[number];

export type CreatorFeedback = {
  id: string;
  user_id: string;
  entity_type: FeedbackEntityType;
  entity_id: string;
  feedback_type: FeedbackType;
  rating: number | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type CreatorFeedbackRow = CreatorFeedback & {
  metadata?: Record<string, unknown> | null;
};

export function normalizeCreatorFeedback(row: CreatorFeedbackRow): CreatorFeedback {
  return {
    id: row.id,
    user_id: row.user_id,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    feedback_type: row.feedback_type,
    rating: row.rating ?? null,
    notes: row.notes ?? null,
    metadata: row.metadata ?? {},
    created_at: row.created_at,
  };
}
