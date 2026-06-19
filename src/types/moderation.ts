export const MODERATION_CONTENT_TYPES = ["image", "text"] as const;
export type ModerationContentType = (typeof MODERATION_CONTENT_TYPES)[number];

export const MODERATION_STATUSES = [
  "pending",
  "approved",
  "removed",
  "escalated",
] as const;
export type ModerationStatus = (typeof MODERATION_STATUSES)[number];

export const RISK_CATEGORIES = [
  "csam_indicators",
  "sexualized_minors",
  "explicit_sexual_content",
  "graphic_gore",
  "extremist_content",
  "illegal_content",
  "platform_policy",
] as const;
export type RiskCategory = (typeof RISK_CATEGORIES)[number];

export const RISK_CATEGORY_LABELS: Record<RiskCategory, string> = {
  csam_indicators: "CSAM indicators",
  sexualized_minors: "Sexualized minors",
  explicit_sexual_content: "Explicit sexual content",
  graphic_gore: "Graphic gore",
  extremist_content: "Extremist content",
  illegal_content: "Illegal content",
  platform_policy: "Platform policy violation",
};

export type ModerationEntityType =
  | "character_image"
  | "story_image"
  | "character_photo"
  | "avatar"
  | "world_cover"
  | "support_screenshot"
  | "character"
  | "character_bible"
  | "story_bible"
  | "world"
  | "project"
  | "story"
  | "chapter"
  | "scene"
  | "profile"
  | "image_caption"
  | "creator_feedback"
  | "support_ticket";

export type ScanOutcome = "safe" | "flagged";

export type ContentScanResult = {
  outcome: ScanOutcome;
  riskScore: number;
  riskCategories: RiskCategory[];
  scanner: string;
  scannedAt: string;
  details?: Record<string, unknown>;
};

export type ModerationQueueItem = {
  id: string;
  user_id: string;
  content_type: ModerationContentType;
  entity_type: string;
  entity_id: string | null;
  field_name: string | null;
  storage_bucket: string | null;
  storage_path: string | null;
  content_preview: string | null;
  status: ModerationStatus;
  risk_score: number;
  risk_categories: string[];
  scanner_result: Record<string, unknown>;
  reviewer_id: string | null;
  reviewer_note: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type ModerationQueueRow = ModerationQueueItem;

export function normalizeModerationQueueItem(
  row: ModerationQueueRow
): ModerationQueueItem {
  return {
    id: row.id,
    user_id: row.user_id,
    content_type: row.content_type,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    field_name: row.field_name,
    storage_bucket: row.storage_bucket,
    storage_path: row.storage_path,
    content_preview: row.content_preview,
    status: row.status,
    risk_score: Number(row.risk_score),
    risk_categories: row.risk_categories ?? [],
    scanner_result: (row.scanner_result as Record<string, unknown>) ?? {},
    reviewer_id: row.reviewer_id,
    reviewer_note: row.reviewer_note,
    reviewed_at: row.reviewed_at,
    created_at: row.created_at,
  };
}

export function formatRiskScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}
