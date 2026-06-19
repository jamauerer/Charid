import type { CreativeProposalItem } from "@/types/creative-proposal";

/** Staging payload for a proposed scene — not canon until Approve. */
export type SceneSuggestionPayload = {
  title: string;
  summary: string;
  character_ids: string[];
  world_location_id: string | null;
  location_label: string | null;
};

export type SceneSuggestionItem = CreativeProposalItem<SceneSuggestionPayload>;

export type SceneSuggestionItemView = SceneSuggestionItem & {
  character_names: string[];
  location_display: string | null;
};

export type SceneSuggestionBatchView = {
  id: string;
  story_id: string;
  world_id: string | null;
  chapter_id: string | null;
  status: "active" | "dismissed";
  items: SceneSuggestionItemView[];
  created_at: string;
  updated_at: string;
};

/** Raw LLM output shape before ID resolution */
export type SceneSuggestionDraft = {
  title: string;
  summary: string;
  character_names?: string[];
  location_name?: string | null;
};

export type SceneSuggestionGenerationResult = {
  suggestions: SceneSuggestionDraft[];
  source: "openai" | "template";
};
