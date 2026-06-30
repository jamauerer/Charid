import type { AiPromptTemplate } from "@/types/ai/core";
import { DEFAULT_PROMPT_TEMPLATES } from "@/lib/ai/prompt-templates/defaults";

const globalForAi = globalThis as unknown as {
  aiPromptTemplates?: Map<string, AiPromptTemplate>;
};

function getStore(): Map<string, AiPromptTemplate> {
  if (!globalForAi.aiPromptTemplates) {
    globalForAi.aiPromptTemplates = new Map(
      DEFAULT_PROMPT_TEMPLATES.map((template) => [template.id, template])
    );
  } else {
    for (const template of DEFAULT_PROMPT_TEMPLATES) {
      if (!globalForAi.aiPromptTemplates.has(template.id)) {
        globalForAi.aiPromptTemplates.set(template.id, template);
      }
    }
  }
  return globalForAi.aiPromptTemplates;
}

export function listPromptTemplates(): AiPromptTemplate[] {
  return [...getStore().values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function getPromptTemplate(id: string): AiPromptTemplate | null {
  return getStore().get(id) ?? null;
}

export function updatePromptTemplate(
  id: string,
  patch: Partial<Pick<AiPromptTemplate, "name" | "description" | "systemPrompt" | "userPromptTemplate">>
): AiPromptTemplate | null {
  const existing = getStore().get(id);
  if (!existing) return null;
  const updated: AiPromptTemplate = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  getStore().set(id, updated);
  return updated;
}

export function renderPromptTemplate(
  templateId: string,
  variables: Record<string, string>
): { systemPrompt: string; userPrompt: string } | null {
  const template = getPromptTemplate(templateId);
  if (!template) return null;

  let userPrompt = template.userPromptTemplate;
  for (const [key, value] of Object.entries(variables)) {
    userPrompt = userPrompt.replaceAll(`{{${key}}}`, value);
  }
  return { systemPrompt: template.systemPrompt, userPrompt };
}
