import { randomUUID } from "crypto";
import type { AiJob, AiJobStatus, AiLogEntry, AiSettings } from "@/types/ai/core";
import type { PagePanelPlan } from "@/types/ai/comic-planning";

type AiStore = {
  jobs: Map<string, AiJob>;
  logs: Map<string, AiLogEntry>;
  settings: AiSettings;
  panelPlans: Map<string, PagePanelPlan>;
};

const DEFAULT_SETTINGS: AiSettings = {
  defaultTextProvider: "openai",
  defaultTextModel: "gpt-4o-mini",
  defaultImageProvider: "flux",
  defaultImageModel: "flux-dev",
  logRetentionDays: 30,
  maxRetries: 2,
  simulateProviders: true,
  providerFallbackOrder: ["openai", "anthropic", "google"],
  projectTypes: {
    storybook: true,
    graphic_novel: true,
    film: true,
    advertisement: true,
    general: true,
  },
  features: {
    production_planning: true,
    character_consistency: true,
    scene_analysis: true,
    dialogue_suggestions: true,
    speech_bubble_suggestions: true,
    automatic_bubble_generation: false,
    automatic_tail_placement: false,
    page_layout_suggestions: true,
    panel_suggestions: true,
    video_planning: false,
    campaign_planning: false,
    asset_consistency: true,
  },
};

const globalForAi = globalThis as unknown as { aiStore?: AiStore };

function getStore(): AiStore {
  if (!globalForAi.aiStore) {
    globalForAi.aiStore = {
      jobs: new Map(),
      logs: new Map(),
      settings: { ...DEFAULT_SETTINGS },
      panelPlans: new Map(),
    };
  }
  return globalForAi.aiStore;
}

export function getAiSettings(): AiSettings {
  const stored = getStore().settings;
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    projectTypes: { ...DEFAULT_SETTINGS.projectTypes, ...stored.projectTypes },
    features: { ...DEFAULT_SETTINGS.features, ...stored.features },
    providerFallbackOrder:
      stored.providerFallbackOrder?.length > 0
        ? stored.providerFallbackOrder
        : DEFAULT_SETTINGS.providerFallbackOrder,
  };
}

export function updateAiSettings(patch: Partial<AiSettings>): AiSettings {
  const store = getStore();
  store.settings = { ...store.settings, ...patch };
  return { ...store.settings };
}

export function createAiJob(
  input: Omit<
    AiJob,
    | "id"
    | "status"
    | "response"
    | "error"
    | "actualCredits"
    | "actualCostUsd"
    | "tokensIn"
    | "tokensOut"
    | "retryCount"
    | "retryHistory"
    | "createdAt"
    | "startedAt"
    | "completedAt"
  >
): AiJob {
  const job: AiJob = {
    ...input,
    id: randomUUID(),
    status: "queued",
    response: null,
    error: null,
    actualCredits: null,
    actualCostUsd: null,
    tokensIn: null,
    tokensOut: null,
    retryCount: 0,
    retryHistory: [],
    createdAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
  };
  getStore().jobs.set(job.id, job);
  return job;
}

export function updateAiJob(id: string, patch: Partial<AiJob>): AiJob | null {
  const store = getStore();
  const existing = store.jobs.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...patch };
  store.jobs.set(id, updated);
  return updated;
}

export function getAiJob(id: string): AiJob | null {
  return getStore().jobs.get(id) ?? null;
}

export function listAiJobs(filter?: { status?: AiJobStatus | AiJobStatus[] }): AiJob[] {
  let jobs = [...getStore().jobs.values()];
  if (filter?.status) {
    const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
    jobs = jobs.filter((job) => statuses.includes(job.status));
  }
  return jobs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function appendAiLog(entry: Omit<AiLogEntry, "id" | "createdAt">): AiLogEntry {
  const log: AiLogEntry = {
    ...entry,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  getStore().logs.set(log.id, log);
  return log;
}

export function listAiLogs(query?: string): AiLogEntry[] {
  let logs = [...getStore().logs.values()].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
  if (query?.trim()) {
    const q = query.toLowerCase();
    logs = logs.filter(
      (log) =>
        log.prompt.toLowerCase().includes(q) ||
        (log.response?.toLowerCase().includes(q) ?? false) ||
        log.providerId.includes(q) ||
        log.modelId.includes(q) ||
        log.jobId.includes(q)
    );
  }
  return logs;
}

export function getAiUsageSummary(): {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  totalCredits: number;
  totalCostUsd: number;
} {
  const jobs = listAiJobs();
  return {
    totalJobs: jobs.length,
    completedJobs: jobs.filter((j) => j.status === "completed").length,
    failedJobs: jobs.filter((j) => j.status === "failed").length,
    totalCredits: jobs.reduce((sum, j) => sum + (j.actualCredits ?? 0), 0),
    totalCostUsd: jobs.reduce((sum, j) => sum + (j.actualCostUsd ?? 0), 0),
  };
}

export function setPanelPlanForPage(pageId: string, plan: PagePanelPlan): void {
  getStore().panelPlans.set(pageId, plan);
}

export function getPanelPlanForPage(pageId: string): PagePanelPlan | null {
  return getStore().panelPlans.get(pageId) ?? null;
}
