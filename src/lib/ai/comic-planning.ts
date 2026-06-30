import { randomUUID } from "crypto";
import { getAiSettings } from "@/lib/ai/job-store";
import { runTextAiJob } from "@/lib/ai/orchestrator";
import { renderPromptTemplate } from "@/lib/ai/prompt-templates/store";
import { templateIntelligentPanelPlan, enrichPanelPlan } from "@/lib/ai/production-intelligence/panel-intelligence";
import type {
  ComicPlanProposal,
  PagePanelPlan,
  PanelPlanItem,
  StoryAnalysisResult,
} from "@/types/ai/comic-planning";

function parseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function templateStoryAnalysis(input: {
  storyTitle: string;
  sceneCount: number;
  characterCount: number;
  locationCount: number;
}): StoryAnalysisResult {
  const pages = Math.max(4, Math.min(24, input.sceneCount * 2));
  const panels = pages * 4;
  return {
    storySummary: `"${input.storyTitle}" spans ${input.sceneCount} scenes with ${input.characterCount} key characters.`,
    sceneSummary: `${input.sceneCount} scenes ready for visual adaptation across ~${pages} pages.`,
    suggestedPageCount: pages,
    suggestedPanelCount: panels,
    suggestedReadingPace: "Moderate — 4–6 panels per page, scene transitions every 1–2 pages.",
    characterNotes: [`${input.characterCount} characters identified for casting.`],
    locationNotes: [`${input.locationCount} locations available for establishing shots.`],
    timelineNotes: ["Chronological scene order preserved from story layer."],
  };
}

export function templateComicPlan(input: {
  storyTitle: string;
  pageCount: number;
  scenes: { id: string; title: string }[];
}): ComicPlanProposal {
  const pages = Array.from({ length: input.pageCount }, (_, index) => {
    const scene = input.scenes[index % Math.max(1, input.scenes.length)];
    return {
      id: randomUUID(),
      pageNumber: index + 1,
      title: scene ? `Page ${index + 1}: ${scene.title}` : `Page ${index + 1}`,
      description: scene
        ? `Visual adaptation of "${scene.title}".`
        : `Story beat ${index + 1}.`,
      panelCount: 4,
      sceneIds: scene ? [scene.id] : [],
      pacing: index === 0 ? "Opening — establish world" : "Story progression",
    };
  });

  return {
    issueTitle: `${input.storyTitle} — Issue 1`,
    issueDescription: `AI-proposed first issue for "${input.storyTitle}". Review and edit before creating.`,
    pageCount: input.pageCount,
    pages,
    sceneAllocation: input.scenes.map((scene, index) => ({
      sceneId: scene.id,
      sceneTitle: scene.title,
      pageNumbers: pages.filter((p) => p.sceneIds.includes(scene.id)).map((p) => p.pageNumber),
    })),
    pacingNotes: "Balanced pacing — edit page count and panel counts before approval.",
  };
}

export function templatePanelPlan(pageTitle: string, panelCount: number): PanelPlanItem[] {
  return templateIntelligentPanelPlan(pageTitle, panelCount);
}

export async function analyzeStoryForComic(input: {
  userId: string;
  projectId: string;
  storyId: string;
  storyTitle: string;
  synopsis: string;
  scenes: { id: string; title: string; summary?: string }[];
  characters: { id: string; name: string }[];
  locations: { id: string; name: string }[];
}): Promise<{ jobId: string; analysis: StoryAnalysisResult }> {
  const settings = getAiSettings();
  const rendered = renderPromptTemplate("story_analysis", {
    storyTitle: input.storyTitle,
    synopsis: input.synopsis || "No synopsis.",
    scenes: input.scenes.map((s) => `- ${s.title}: ${s.summary ?? ""}`).join("\n"),
    characters: input.characters.map((c) => c.name).join(", "),
    locations: input.locations.map((l) => l.name).join(", "),
  });

  const fallback = templateStoryAnalysis({
    storyTitle: input.storyTitle,
    sceneCount: input.scenes.length,
    characterCount: input.characters.length,
    locationCount: input.locations.length,
  });

  if (!rendered) {
    return { jobId: "template", analysis: fallback };
  }

  const job = await runTextAiJob({
    providerId: settings.defaultTextProvider,
    modelId: settings.defaultTextModel,
    templateId: "story_analysis",
    userId: input.userId,
    projectId: input.projectId,
    storyId: input.storyId,
    systemPrompt: rendered.systemPrompt,
    userPrompt: rendered.userPrompt,
    metadata: { kind: "story_analysis" },
  });

  const parsed = parseJson<StoryAnalysisResult>(job.response);
  return {
    jobId: job.id,
    analysis: parsed ?? fallback,
  };
}

export async function planComicFromStory(input: {
  userId: string;
  projectId: string;
  storyId: string;
  storyTitle: string;
  analysis: StoryAnalysisResult;
  scenes: { id: string; title: string }[];
  pageCount?: number;
}): Promise<{ jobId: string; plan: ComicPlanProposal }> {
  const settings = getAiSettings();
  const pageCount = input.pageCount ?? input.analysis.suggestedPageCount;
  const fallback = templateComicPlan({
    storyTitle: input.storyTitle,
    pageCount,
    scenes: input.scenes,
  });

  const rendered = renderPromptTemplate("comic_page_planning", {
    storyAnalysis: JSON.stringify(input.analysis),
    pageCount: String(pageCount),
  });

  if (!rendered) {
    return { jobId: "template", plan: fallback };
  }

  const job = await runTextAiJob({
    providerId: settings.defaultTextProvider,
    modelId: settings.defaultTextModel,
    templateId: "comic_page_planning",
    userId: input.userId,
    projectId: input.projectId,
    storyId: input.storyId,
    systemPrompt: rendered.systemPrompt,
    userPrompt: rendered.userPrompt,
    metadata: { kind: "comic_page_planning" },
  });

  const parsed = parseJson<ComicPlanProposal>(job.response);
  return { jobId: job.id, plan: parsed ?? fallback };
}

export async function planPanelsForPage(input: {
  userId: string;
  projectId: string;
  pageId: string;
  pageTitle: string;
  pageDescription: string;
  panelCount: number;
  context: string;
}): Promise<{ jobId: string; plan: PagePanelPlan }> {
  const settings = getAiSettings();
  const fallbackPanels = templatePanelPlan(input.pageTitle, input.panelCount);

  const rendered = renderPromptTemplate("panel_planning", {
    panelCount: String(input.panelCount),
    pageTitle: input.pageTitle,
    pageDescription: input.pageDescription,
    context: input.context,
  });

  if (!rendered) {
    return {
      jobId: "template",
      plan: { pageId: input.pageId, pageTitle: input.pageTitle, panels: fallbackPanels },
    };
  }

  const job = await runTextAiJob({
    providerId: settings.defaultTextProvider,
    modelId: settings.defaultTextModel,
    templateId: "panel_planning",
    userId: input.userId,
    projectId: input.projectId,
    storyId: null,
    systemPrompt: rendered.systemPrompt,
    userPrompt: rendered.userPrompt,
    metadata: { kind: "panel_planning", pageId: input.pageId },
  });

  const parsed = parseJson<{ panels: PanelPlanItem[] }>(job.response);
  const panels = enrichPanelPlan(parsed?.panels ?? fallbackPanels, { pageTitle: input.pageTitle });

  return {
    jobId: job.id,
    plan: {
      pageId: input.pageId,
      pageTitle: input.pageTitle,
      panels,
    },
  };
}
