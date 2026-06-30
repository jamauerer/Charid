import type { AiCapability, AiJob, AiLogEntry, AiPromptTemplate, AiProviderConfig } from "@/types/ai/core";

export const PROMPT_CATEGORY_ORDER = [
  "production_intelligence",
  "production_planning",
  "characters",
  "image_generation",
  "video",
  "advertising",
] as const;

export const PROMPT_CATEGORY_LABELS: Record<string, string> = {
  production_intelligence: "Production Intelligence",
  production_planning: "Production Planning",
  characters: "Characters",
  image_generation: "Image Generation",
  video: "Video",
  advertising: "Advertising",
};

export function groupPromptTemplates(
  templates: AiPromptTemplate[]
): { category: string; label: string; templates: AiPromptTemplate[] }[] {
  const grouped = new Map<string, AiPromptTemplate[]>();
  for (const template of templates) {
    const list = grouped.get(template.category) ?? [];
    list.push(template);
    grouped.set(template.category, list);
  }

  const orderedCategories = [
    ...PROMPT_CATEGORY_ORDER.filter((id) => grouped.has(id)),
    ...[...grouped.keys()].filter((id) => !PROMPT_CATEGORY_ORDER.includes(id as (typeof PROMPT_CATEGORY_ORDER)[number])),
  ];

  return orderedCategories.map((category) => ({
    category,
    label: PROMPT_CATEGORY_LABELS[category] ?? category,
    templates: (grouped.get(category) ?? []).sort((a, b) => a.name.localeCompare(b.name)),
  }));
}

export type ModelPurpose = "Writing" | "Planning" | "Image" | "Video" | "Embedding";

export function deriveModelPurpose(capabilities: AiCapability[]): ModelPurpose {
  if (capabilities.includes("embeddings")) return "Embedding";
  if (capabilities.includes("video_generation") && !capabilities.includes("text_generation")) {
    return "Video";
  }
  if (capabilities.includes("image_generation") && !capabilities.includes("text_generation")) {
    return "Image";
  }
  if (capabilities.includes("text_generation")) return "Planning";
  return "Writing";
}

const PLANNING_TEMPLATE_IDS = new Set([
  "story_analysis",
  "scene_breakdown",
  "comic_page_planning",
  "panel_planning",
]);

const IMAGE_TEMPLATE_IDS = new Set([
  "image_prompt",
  "environment_description",
  "style_prompt",
  "character_description",
]);

const VIDEO_TEMPLATE_IDS = new Set(["video_prompt"]);

function jobDurationMs(job: AiJob): number | null {
  if (!job.startedAt || !job.completedAt) return null;
  const ms = new Date(job.completedAt).getTime() - new Date(job.startedAt).getTime();
  return ms > 0 ? ms : null;
}

function averageDurationMs(values: (number | null)[]): number | null {
  const valid = values.filter((v): v is number => v != null && v > 0);
  if (!valid.length) return null;
  return Math.round(valid.reduce((sum, v) => sum + v, 0) / valid.length);
}

export function computeOverviewMetrics(input: {
  jobs: AiJob[];
  logs: AiLogEntry[];
  providers: AiProviderConfig[];
  defaultProvider: string;
}) {
  const { jobs, logs, providers, defaultProvider } = input;
  const today = new Date().toISOString().slice(0, 10);
  const todaysJobs = jobs.filter((job) => job.createdAt.startsWith(today));
  const enabledProviders = providers.filter((p) => p.enabled);
  const activeModels = enabledProviders.reduce((sum, p) => sum + p.models.length, 0);

  const planningDurations = jobs
    .filter((job) => {
      const kind = String(job.metadata?.kind ?? job.templateId ?? "");
      return PLANNING_TEMPLATE_IDS.has(kind);
    })
    .map(jobDurationMs);

  const imageDurations = logs
    .filter((log) => log.templateId && IMAGE_TEMPLATE_IDS.has(log.templateId))
    .map((log) => log.durationMs);

  const videoDurations = logs
    .filter((log) => log.templateId && VIDEO_TEMPLATE_IDS.has(log.templateId))
    .map((log) => log.durationMs);

  return {
    providersEnabled: enabledProviders.length,
    defaultProvider,
    activeModels,
    todaysCostUsd: todaysJobs.reduce((sum, job) => sum + (job.actualCostUsd ?? 0), 0),
    avgPlanningTimeMs: averageDurationMs(planningDurations),
    avgImageTimeMs: averageDurationMs(imageDurations),
    avgVideoTimeMs: averageDurationMs(videoDurations),
  };
}

export function formatDurationMs(ms: number | null): string | null {
  if (ms == null) return null;
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

export const TEXT_PROVIDER_IDS = ["openai", "anthropic", "google"] as const;
