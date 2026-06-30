"use server";

import { isFounderAdmin } from "@/lib/founder-auth";
import {
  getAiJob,
  getAiSettings,
  getAiUsageSummary,
  listAiJobs,
  listAiLogs,
  updateAiSettings,
} from "@/lib/ai/job-store";
import {
  listAllModels,
  listProviders,
  setProviderEnabled,
} from "@/lib/ai/providers/registry";
import {
  listPromptTemplates,
  updatePromptTemplate,
} from "@/lib/ai/prompt-templates/store";
import { retryAiJob } from "@/lib/ai/orchestrator";
import { listProductionIntelligenceSnapshots } from "@/lib/ai/production-intelligence/store";
import type { AiProviderId, AiSettings } from "@/types/ai/core";

async function assertAdmin(): Promise<{ error?: string }> {
  if (!(await isFounderAdmin())) {
    return { error: "Admin access required." };
  }
  return {};
}

export async function getAiAdminProviders() {
  const gate = await assertAdmin();
  if (gate.error) return { providers: [], error: gate.error };
  return { providers: listProviders() };
}

export async function toggleAiProvider(providerId: AiProviderId, enabled: boolean) {
  const gate = await assertAdmin();
  if (gate.error) return { providers: listProviders(), error: gate.error };
  setProviderEnabled(providerId, enabled);
  return { providers: listProviders() };
}

export async function getAiAdminModels() {
  const gate = await assertAdmin();
  if (gate.error) return { models: [], error: gate.error };
  return { models: listAllModels() };
}

export async function getAiAdminPromptTemplates() {
  const gate = await assertAdmin();
  if (gate.error) return { templates: [], error: gate.error };
  return { templates: listPromptTemplates() };
}

export async function saveAiPromptTemplate(
  id: string,
  patch: {
    name?: string;
    description?: string;
    systemPrompt?: string;
    userPromptTemplate?: string;
  }
) {
  const gate = await assertAdmin();
  if (gate.error) return { error: gate.error };
  const template = updatePromptTemplate(id, patch);
  if (!template) return { error: "Template not found." };
  return { template };
}

export async function getAiAdminJobs(status?: string) {
  const gate = await assertAdmin();
  if (gate.error) return { jobs: [], error: gate.error };
  if (status === "queued") return { jobs: listAiJobs({ status: "queued" }) };
  if (status === "running") return { jobs: listAiJobs({ status: "running" }) };
  if (status === "completed") return { jobs: listAiJobs({ status: "completed" }) };
  if (status === "failed") return { jobs: listAiJobs({ status: "failed" }) };
  return { jobs: listAiJobs() };
}

export async function getAiAdminLogs(query?: string) {
  const gate = await assertAdmin();
  if (gate.error) return { logs: [], error: gate.error };
  return { logs: listAiLogs(query) };
}

export async function getAiAdminUsage() {
  const gate = await assertAdmin();
  if (gate.error) return { summary: null, error: gate.error };
  return { summary: getAiUsageSummary(), logs: listAiLogs().slice(0, 50) };
}

export async function getAiAdminSettings() {
  const gate = await assertAdmin();
  if (gate.error) return { settings: null, error: gate.error };
  return { settings: getAiSettings() };
}

export async function saveAiAdminSettings(patch: Partial<AiSettings>) {
  const gate = await assertAdmin();
  if (gate.error) return { error: gate.error };
  return { settings: updateAiSettings(patch) };
}

export async function adminRetryAiJob(jobId: string) {
  const gate = await assertAdmin();
  if (gate.error) return { error: gate.error };
  const job = await retryAiJob(jobId);
  if (!job) return { error: "Job not found or not retryable." };
  return { job };
}

export async function getAiAdminIntelligenceSnapshots() {
  const gate = await assertAdmin();
  if (gate.error) return { snapshots: [], error: gate.error };
  return { snapshots: listProductionIntelligenceSnapshots() };
}

export async function getAiAdminJob(jobId: string) {
  const gate = await assertAdmin();
  if (gate.error) return { job: null, error: gate.error };
  return { job: getAiJob(jobId) };
}
