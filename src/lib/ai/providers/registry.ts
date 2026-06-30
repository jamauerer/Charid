import type {
  AiCapability,
  AiCostEstimate,
  AiProviderConfig,
  AiProviderId,
} from "@/types/ai/core";

export const AI_PROVIDER_IDS = [
  "openai",
  "anthropic",
  "google",
  "flux",
  "ideogram",
  "kling",
  "runway",
  "luma",
] as const satisfies readonly AiProviderId[];

function textModel(id: string, label: string, cost = 0.002): AiProviderConfig["models"][0] {
  return {
    id,
    label,
    capabilities: ["text_generation"],
    costPer1kTokensUsd: cost,
  };
}

function imageModel(id: string, label: string, cost = 0.04): AiProviderConfig["models"][0] {
  return {
    id,
    label,
    capabilities: ["image_generation"],
    costPerImageUsd: cost,
  };
}

function videoModel(id: string, label: string, cost = 0.15): AiProviderConfig["models"][0] {
  return {
    id,
    label,
    capabilities: ["video_generation"],
    costPerSecondVideoUsd: cost,
  };
}

const PROVIDER_DEFS: Record<AiProviderId, Omit<AiProviderConfig, "enabled">> = {
  openai: {
    id: "openai",
    name: "OpenAI",
    capabilities: ["text_generation", "image_generation", "embeddings", "moderation"],
    models: [
      textModel("gpt-4o-mini", "GPT-4o Mini"),
      textModel("gpt-4o", "GPT-4o", 0.005),
      imageModel("gpt-image-1", "GPT Image"),
    ],
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic",
    capabilities: ["text_generation"],
    models: [textModel("claude-3-5-sonnet", "Claude 3.5 Sonnet", 0.003)],
  },
  google: {
    id: "google",
    name: "Google",
    capabilities: ["text_generation", "image_generation"],
    models: [
      textModel("gemini-2.0-flash", "Gemini 2.0 Flash", 0.001),
      imageModel("imagen-3", "Imagen 3", 0.03),
    ],
  },
  flux: {
    id: "flux",
    name: "Flux",
    capabilities: ["image_generation"],
    models: [imageModel("flux-dev", "Flux Dev"), imageModel("flux-pro", "Flux Pro", 0.055)],
  },
  ideogram: {
    id: "ideogram",
    name: "Ideogram",
    capabilities: ["image_generation"],
    models: [imageModel("ideogram-v2", "Ideogram v2")],
  },
  kling: {
    id: "kling",
    name: "Kling",
    capabilities: ["video_generation"],
    models: [videoModel("kling-v1", "Kling v1")],
  },
  runway: {
    id: "runway",
    name: "Runway",
    capabilities: ["video_generation", "image_generation"],
    models: [videoModel("gen-3", "Gen-3 Alpha"), imageModel("runway-image", "Runway Image")],
  },
  luma: {
    id: "luma",
    name: "Luma",
    capabilities: ["video_generation"],
    models: [videoModel("dream-machine", "Dream Machine")],
  },
};

type ProviderRuntimeState = {
  enabled: Record<AiProviderId, boolean>;
};

const globalForAi = globalThis as unknown as {
  aiProviderState?: ProviderRuntimeState;
};

function getState(): ProviderRuntimeState {
  if (!globalForAi.aiProviderState) {
    globalForAi.aiProviderState = {
      enabled: {
        openai: true,
        anthropic: false,
        google: false,
        flux: false,
        ideogram: false,
        kling: false,
        runway: false,
        luma: false,
      },
    };
  }
  return globalForAi.aiProviderState;
}

export function listProviders(): AiProviderConfig[] {
  const state = getState();
  return AI_PROVIDER_IDS.map((id) => ({
    ...PROVIDER_DEFS[id],
    enabled: state.enabled[id] ?? false,
  }));
}

export function getProvider(id: AiProviderId): AiProviderConfig | null {
  const provider = listProviders().find((p) => p.id === id);
  return provider ?? null;
}

export function setProviderEnabled(id: AiProviderId, enabled: boolean): void {
  getState().enabled[id] = enabled;
}

export function listAllModels(): { providerId: AiProviderId; providerName: string; model: AiProviderConfig["models"][0] }[] {
  return listProviders().flatMap((provider) =>
    provider.models.map((model) => ({
      providerId: provider.id,
      providerName: provider.name,
      model,
    }))
  );
}

export function estimateProviderCost(
  providerId: AiProviderId,
  modelId: string,
  options: { tokens?: number; images?: number; videoSeconds?: number }
): AiCostEstimate {
  const provider = PROVIDER_DEFS[providerId];
  const model = provider?.models.find((m) => m.id === modelId);
  if (!model) return { credits: 1, costUsd: 0.01 };

  let costUsd = 0;
  if (options.tokens && model.costPer1kTokensUsd) {
    costUsd += (options.tokens / 1000) * model.costPer1kTokensUsd;
  }
  if (options.images && model.costPerImageUsd) {
    costUsd += options.images * model.costPerImageUsd;
  }
  if (options.videoSeconds && model.costPerSecondVideoUsd) {
    costUsd += options.videoSeconds * model.costPerSecondVideoUsd;
  }

  const credits = Math.max(1, Math.ceil(costUsd * 100));
  return { credits, costUsd: Math.round(costUsd * 10000) / 10000 };
}
