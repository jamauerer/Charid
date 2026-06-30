export const AI_JOB_STATUSES = [
  "queued",
  "running",
  "completed",
  "failed",
  "cancelled",
] as const;

export type AiJobStatus = (typeof AI_JOB_STATUSES)[number];

export const AI_CAPABILITIES = [
  "text_generation",
  "image_generation",
  "video_generation",
  "embeddings",
  "moderation",
] as const;

export type AiCapability = (typeof AI_CAPABILITIES)[number];

export const AI_PROVIDER_IDS = [
  "openai",
  "anthropic",
  "google",
  "flux",
  "ideogram",
  "kling",
  "runway",
  "luma",
] as const;

export type AiProviderId = (typeof AI_PROVIDER_IDS)[number];

export type AiModel = {
  id: string;
  label: string;
  capabilities: AiCapability[];
  costPer1kTokensUsd?: number;
  costPerImageUsd?: number;
  costPerSecondVideoUsd?: number;
};

export type AiProviderConfig = {
  id: AiProviderId;
  name: string;
  enabled: boolean;
  models: AiModel[];
  capabilities: AiCapability[];
};

export type AiCostEstimate = {
  credits: number;
  costUsd: number;
};

export type AiJobRetryEntry = {
  at: string;
  error: string;
};

export type AiJob = {
  id: string;
  status: AiJobStatus;
  providerId: AiProviderId;
  modelId: string;
  templateId: string | null;
  userId: string;
  projectId: string | null;
  storyId: string | null;
  prompt: string;
  response: string | null;
  error: string | null;
  estimatedCredits: number;
  estimatedCostUsd: number;
  actualCredits: number | null;
  actualCostUsd: number | null;
  tokensIn: number | null;
  tokensOut: number | null;
  retryCount: number;
  retryHistory: AiJobRetryEntry[];
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  metadata: Record<string, unknown>;
};

export type AiLogEntry = {
  id: string;
  jobId: string;
  providerId: AiProviderId;
  modelId: string;
  templateId: string | null;
  userId: string;
  projectId: string | null;
  prompt: string;
  response: string | null;
  tokensIn: number | null;
  tokensOut: number | null;
  credits: number | null;
  costUsd: number | null;
  status: AiJobStatus;
  error: string | null;
  retryHistory: AiJobRetryEntry[];
  durationMs: number | null;
  createdAt: string;
};

export type AiPromptTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  systemPrompt: string;
  userPromptTemplate: string;
  updatedAt: string;
};

export const AI_PROJECT_TYPE_IDS = [
  "storybook",
  "graphic_novel",
  "film",
  "advertisement",
  "general",
] as const;

export type AiProjectTypeId = (typeof AI_PROJECT_TYPE_IDS)[number];

export const AI_PROJECT_TYPE_LABELS: Record<AiProjectTypeId, string> = {
  storybook: "Storybook",
  graphic_novel: "Graphic Novel",
  film: "Film",
  advertisement: "Advertisement",
  general: "General",
};

export const AI_FEATURE_IDS = [
  "production_planning",
  "character_consistency",
  "scene_analysis",
  "dialogue_suggestions",
  "speech_bubble_suggestions",
  "automatic_bubble_generation",
  "automatic_tail_placement",
  "page_layout_suggestions",
  "panel_suggestions",
  "video_planning",
  "campaign_planning",
  "asset_consistency",
] as const;

export type AiFeatureId = (typeof AI_FEATURE_IDS)[number];

export const AI_FEATURE_LABELS: Record<AiFeatureId, string> = {
  production_planning: "Production Planning",
  character_consistency: "Character Consistency",
  scene_analysis: "Scene Analysis",
  dialogue_suggestions: "Dialogue Suggestions",
  speech_bubble_suggestions: "Speech Bubble Suggestions",
  automatic_bubble_generation: "Automatic Bubble Generation",
  automatic_tail_placement: "Automatic Tail Placement",
  page_layout_suggestions: "Page Layout Suggestions",
  panel_suggestions: "Panel Suggestions",
  video_planning: "Video Planning",
  campaign_planning: "Campaign Planning",
  asset_consistency: "Asset Consistency",
};

export type AiSettings = {
  defaultTextProvider: AiProviderId;
  defaultTextModel: string;
  defaultImageProvider: AiProviderId;
  defaultImageModel: string;
  logRetentionDays: number;
  maxRetries: number;
  simulateProviders: boolean;
  providerFallbackOrder: AiProviderId[];
  projectTypes: Record<AiProjectTypeId, boolean>;
  features: Record<AiFeatureId, boolean>;
};
