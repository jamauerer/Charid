/** Shared staging types — one approval architecture for all suggestion kinds. */

export const PROPOSAL_KINDS = [
  "scene_suggestion",
  "chapter_suggestion",
  "character_suggestion",
  "location_suggestion",
  "cover_suggestion",
  "comic_page_suggestion",
] as const;

export type ProposalKind = (typeof PROPOSAL_KINDS)[number];

export const PROPOSAL_BATCH_STATUSES = ["active", "dismissed"] as const;
export type ProposalBatchStatus = (typeof PROPOSAL_BATCH_STATUSES)[number];

export const PROPOSAL_ITEM_STATUSES = [
  "pending",
  "approved",
  "discarded",
] as const;

export type ProposalItemStatus = (typeof PROPOSAL_ITEM_STATUSES)[number];

export type CreativeProposalItem<TPayload = Record<string, unknown>> = {
  id: string;
  status: ProposalItemStatus;
  sort_order: number;
  payload: TPayload;
  /** Set after Approve → Commit for scene suggestions */
  committed_entity_id?: string | null;
};

export type CreativeProposalBatchRow = {
  id: string;
  user_id: string;
  proposal_kind: ProposalKind;
  story_id: string | null;
  world_id: string | null;
  scene_id: string | null;
  chapter_id: string | null;
  status: ProposalBatchStatus;
  items: CreativeProposalItem[];
  created_at: string;
  updated_at: string;
};

export type CreativeProposalBatch<TPayload = Record<string, unknown>> = Omit<
  CreativeProposalBatchRow,
  "items"
> & {
  items: CreativeProposalItem<TPayload>[];
};
