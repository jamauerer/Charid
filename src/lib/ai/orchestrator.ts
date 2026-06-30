import { openAIChatCompletion } from "@/lib/ai/openai-chat";
import {
  appendAiLog,
  createAiJob,
  getAiJob,
  updateAiJob,
} from "@/lib/ai/job-store";
import { estimateProviderCost, getProvider } from "@/lib/ai/providers/registry";
import type { AiJob, AiProviderId } from "@/types/ai/core";

export type RunTextJobInput = {
  providerId: AiProviderId;
  modelId: string;
  templateId: string | null;
  userId: string;
  projectId?: string | null;
  storyId?: string | null;
  systemPrompt: string;
  userPrompt: string;
  metadata?: Record<string, unknown>;
};

export async function runTextAiJob(input: RunTextJobInput): Promise<AiJob> {
  const estimate = estimateProviderCost(input.providerId, input.modelId, { tokens: 2000 });
  const provider = getProvider(input.providerId);

  const job = createAiJob({
    providerId: input.providerId,
    modelId: input.modelId,
    templateId: input.templateId,
    userId: input.userId,
    projectId: input.projectId ?? null,
    storyId: input.storyId ?? null,
    prompt: `[system]\n${input.systemPrompt}\n\n[user]\n${input.userPrompt}`,
    estimatedCredits: estimate.credits,
    estimatedCostUsd: estimate.costUsd,
    metadata: input.metadata ?? {},
  });

  updateAiJob(job.id, { status: "running", startedAt: new Date().toISOString() });
  const start = Date.now();

  try {
    let response: string;
    let tokensIn: number | null = null;
    let tokensOut: number | null = null;

    if (input.providerId === "openai" && provider?.enabled) {
      const result = await openAIChatCompletion(
        [
          { role: "system", content: input.systemPrompt },
          { role: "user", content: input.userPrompt },
        ],
        { jsonMode: true, temperature: 0.7 }
      );
      if (result.error || !result.content) {
        throw new Error(result.error ?? "Empty response from OpenAI.");
      }
      response = result.content;
      tokensIn = Math.ceil(input.systemPrompt.length / 4 + input.userPrompt.length / 4);
      tokensOut = Math.ceil(response.length / 4);
    } else {
      await delay(400);
      response = JSON.stringify({
        simulated: true,
        provider: input.providerId,
        model: input.modelId,
        message: "Simulated response — enable provider or configure API keys for live output.",
      });
      tokensIn = 100;
      tokensOut = 200;
    }

    const actual = estimateProviderCost(input.providerId, input.modelId, {
      tokens: (tokensIn ?? 0) + (tokensOut ?? 0),
    });

    const completed = updateAiJob(job.id, {
      status: "completed",
      response,
      actualCredits: actual.credits,
      actualCostUsd: actual.costUsd,
      tokensIn,
      tokensOut,
      completedAt: new Date().toISOString(),
    })!;

    appendAiLog({
      jobId: job.id,
      providerId: input.providerId,
      modelId: input.modelId,
      templateId: input.templateId,
      userId: input.userId,
      projectId: input.projectId ?? null,
      prompt: job.prompt,
      response,
      tokensIn,
      tokensOut,
      credits: actual.credits,
      costUsd: actual.costUsd,
      status: "completed",
      error: null,
      retryHistory: [],
      durationMs: Date.now() - start,
    });

    return completed;
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI job failed.";
    const failed = updateAiJob(job.id, {
      status: "failed",
      error: message,
      completedAt: new Date().toISOString(),
      retryHistory: [{ at: new Date().toISOString(), error: message }],
      retryCount: 1,
    })!;

    appendAiLog({
      jobId: job.id,
      providerId: input.providerId,
      modelId: input.modelId,
      templateId: input.templateId,
      userId: input.userId,
      projectId: input.projectId ?? null,
      prompt: job.prompt,
      response: null,
      tokensIn: null,
      tokensOut: null,
      credits: null,
      costUsd: null,
      status: "failed",
      error: message,
      retryHistory: failed.retryHistory,
      durationMs: Date.now() - start,
    });

    return failed;
  }
}

export async function retryAiJob(jobId: string): Promise<AiJob | null> {
  const existing = getAiJob(jobId);
  if (!existing || existing.status !== "failed") return null;

  const parts = existing.prompt.split("\n\n[user]\n");
  const systemPrompt = parts[0]?.replace("[system]\n", "") ?? "";
  const userPrompt = parts[1] ?? existing.prompt;

  updateAiJob(jobId, {
    status: "queued",
    error: null,
    retryCount: existing.retryCount + 1,
  });

  return runTextAiJob({
    providerId: existing.providerId,
    modelId: existing.modelId,
    templateId: existing.templateId,
    userId: existing.userId,
    projectId: existing.projectId,
    storyId: existing.storyId,
    systemPrompt,
    userPrompt,
    metadata: existing.metadata,
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
