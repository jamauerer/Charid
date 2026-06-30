"use server";

import { revalidatePath } from "next/cache";
import { getProjectById, getProjectStories } from "@/app/actions/projects";
import { getScenesByStoryId } from "@/app/actions/scenes";
import { getStoryBibleBundle } from "@/app/actions/story-bible";
import {
  createComicIssue,
  createComicPage,
  renameComicIssue,
  renameComicPage,
} from "@/app/actions/production/comic";
import { applyComicPageTemplate } from "@/app/actions/production/page-layout";
import { consumeCredits } from "@/app/actions/credits";
import { enforceAiBillingGate } from "@/lib/billing/exempt";
import { getAiJob, setPanelPlanForPage } from "@/lib/ai/job-store";
import {
  analyzeStoryForComic,
  planComicFromStory,
  planPanelsForPage,
} from "@/lib/ai/comic-planning";
import {
  applyIntelligenceToPlan,
  mapWorkIntentToProjectType,
  runProductionIntelligence,
} from "@/lib/ai/production-intelligence";
import { enrichStoryAnalysis } from "@/lib/ai/production-intelligence/story-intelligence";
import type { ProductionIntelligenceBundle } from "@/types/ai/production-intelligence";
import type { PageLayoutTemplateId } from "@/lib/canvas/page-layout-templates";
import { comicPageStudioPath } from "@/lib/production-routes";
import { createClient } from "@/lib/supabase/server";
import { AI_CREDIT_COSTS } from "@/types/credit";
import type {
  ComicGenerationProgress,
  ComicPlanProposal,
  PagePanelPlan,
  StoryAnalysisResult,
} from "@/types/ai/comic-planning";

export async function runStoryAnalysis(input: {
  projectId: string;
  storyId: string;
}): Promise<{ analysis?: StoryAnalysisResult; jobId?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const billing = await enforceAiBillingGate(user.id);
  if (billing.error) return { error: billing.error };

  const stories = await getProjectStories(input.projectId);
  const entry = stories.entries.find((e) => e.story.id === input.storyId);
  if (!entry) return { error: "Story not found in project." };

  const [scenesResult, bibleResult, projectResult] = await Promise.all([
    getScenesByStoryId(input.storyId),
    getStoryBibleBundle(input.storyId),
    getProjectById(input.projectId),
  ]);

  const consume = await consumeCredits(user.id, AI_CREDIT_COSTS.story_analysis, "ai_usage", {
    kind: "story_analysis",
    projectId: input.projectId,
    storyId: input.storyId,
  });
  if (consume.error) return { error: consume.error };

  const synopsis = entry.story.summary ?? bibleResult.bundle?.bible.summary ?? "";
  const projectType = mapWorkIntentToProjectType(projectResult.project?.work_intent);
  const characterCount = bibleResult.bundle?.linkedCharacterIds?.length ?? 0;

  const result = await analyzeStoryForComic({
    userId: user.id,
    projectId: input.projectId,
    storyId: input.storyId,
    storyTitle: entry.story.title,
    synopsis,
    scenes: scenesResult.scenes.map((s) => ({
      id: s.id,
      title: s.title,
      summary: s.summary,
    })),
    characters: (bibleResult.bundle?.linkedCharacterIds ?? []).map((id) => ({
      id,
      name: id,
    })),
    locations: [],
  });

  const analysis = enrichStoryAnalysis(result.analysis, {
    storyTitle: entry.story.title,
    synopsis,
    sceneCount: scenesResult.scenes.length,
    characterCount,
    projectType,
  });

  return { analysis, jobId: result.jobId };
}

export async function runComicPlanning(input: {
  projectId: string;
  storyId: string;
  analysis: StoryAnalysisResult;
  pageCount?: number;
  artStyle?: string;
}): Promise<{
  plan?: ComicPlanProposal;
  analysis?: StoryAnalysisResult;
  intelligence?: ProductionIntelligenceBundle;
  jobId?: string;
  error?: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const billing = await enforceAiBillingGate(user.id);
  if (billing.error) return { error: billing.error };

  const stories = await getProjectStories(input.projectId);
  const entry = stories.entries.find((e) => e.story.id === input.storyId);
  if (!entry) return { error: "Story not found." };

  const scenesResult = await getScenesByStoryId(input.storyId);
  const [bibleResult, projectResult] = await Promise.all([
    getStoryBibleBundle(input.storyId),
    getProjectById(input.projectId),
  ]);

  const consume = await consumeCredits(user.id, AI_CREDIT_COSTS.comic_page_planning, "ai_usage", {
    kind: "comic_page_planning",
    projectId: input.projectId,
  });
  if (consume.error) return { error: consume.error };

  const result = await planComicFromStory({
    userId: user.id,
    projectId: input.projectId,
    storyId: input.storyId,
    storyTitle: entry.story.title,
    analysis: input.analysis,
    scenes: scenesResult.scenes.map((s) => ({ id: s.id, title: s.title })),
    pageCount: input.pageCount,
  });

  const projectType = mapWorkIntentToProjectType(projectResult.project?.work_intent);
  const synopsis = entry.story.summary ?? bibleResult.bundle?.bible.summary ?? "";

  const intelligence = runProductionIntelligence({
    analysis: input.analysis,
    plan: result.plan,
    scenes: scenesResult.scenes.map((s) => ({
      id: s.id,
      title: s.title,
      summary: s.summary,
    })),
    projectType,
    storyTitle: entry.story.title,
    synopsis,
    characterCount: bibleResult.bundle?.linkedCharacterIds?.length ?? 0,
    artStyle: input.artStyle,
  });

  const enriched = applyIntelligenceToPlan(input.analysis, result.plan, intelligence);

  return {
    plan: enriched.plan,
    analysis: enriched.analysis,
    intelligence,
    jobId: result.jobId,
  };
}

export async function approveComicPlan(input: {
  projectId: string;
  plan: ComicPlanProposal;
}): Promise<{ issueId?: string; pageIds?: string[]; editorHref?: string; jobId?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const issueResult = await createComicIssue(input.projectId);
  if (issueResult.error || !issueResult.issue) {
    return { error: issueResult.error ?? "Failed to create issue." };
  }

  await renameComicIssue(input.projectId, issueResult.issue.id, input.plan.issueTitle);

  const pageIds: string[] = [];
  let lastPanelJobId: string | undefined;

  for (const page of input.plan.pages) {
    const pageResult = await createComicPage(input.projectId, issueResult.issue.id);
    if (pageResult.error || !pageResult.page) {
      return { error: pageResult.error ?? `Failed to create page ${page.pageNumber}.` };
    }
    await renameComicPage(input.projectId, pageResult.page.id, page.title);
    pageIds.push(pageResult.page.id);

    const layoutResult = await applyComicPageTemplate(
      input.projectId,
      pageResult.page.id,
      panelCountToTemplate(page.panelCount)
    );
    if (layoutResult.error) {
      return { error: layoutResult.error };
    }

    const panelConsume = await consumeCredits(user.id, AI_CREDIT_COSTS.panel_planning, "ai_usage", {
      kind: "panel_planning",
      projectId: input.projectId,
      pageId: pageResult.page.id,
    });
    if (panelConsume.error) {
      return { error: panelConsume.error };
    }

    const panelResult = await planPanelsForPage({
      userId: user.id,
      projectId: input.projectId,
      pageId: pageResult.page.id,
      pageTitle: page.title,
      pageDescription: page.description,
      panelCount: page.panelCount,
      context: input.plan.issueDescription,
    });
    setPanelPlanForPage(pageResult.page.id, panelResult.plan);
    lastPanelJobId = panelResult.jobId;
  }

  revalidatePath(`/dashboard/projects/${input.projectId}`);

  return {
    issueId: issueResult.issue.id,
    pageIds,
    editorHref: pageIds[0] ? comicPageStudioPath(input.projectId, pageIds[0]) : undefined,
    jobId: lastPanelJobId,
  };
}

function panelCountToTemplate(count: number): PageLayoutTemplateId {
  if (count <= 1) return "panels-1-splash";
  if (count === 2) return "panels-2-a";
  if (count === 3) return "panels-3-a";
  if (count === 4) return "panels-4-a";
  if (count === 5) return "panels-5-a";
  if (count === 6) return "panels-6-a";
  if (count === 7) return "panels-7-a";
  return "panels-4-a";
}

export async function runPanelPlanning(input: {
  projectId: string;
  pageId: string;
  pageTitle: string;
  pageDescription: string;
  panelCount: number;
  context?: string;
}): Promise<{ plan?: PagePanelPlan; jobId?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const billing = await enforceAiBillingGate(user.id);
  if (billing.error) return { error: billing.error };

  const consume = await consumeCredits(user.id, AI_CREDIT_COSTS.panel_planning, "ai_usage", {
    kind: "panel_planning",
    projectId: input.projectId,
    pageId: input.pageId,
  });
  if (consume.error) return { error: consume.error };

  const result = await planPanelsForPage({
    userId: user.id,
    projectId: input.projectId,
    pageId: input.pageId,
    pageTitle: input.pageTitle,
    pageDescription: input.pageDescription,
    panelCount: input.panelCount,
    context: input.context ?? "",
  });

  return { plan: result.plan, jobId: result.jobId };
}

export async function getComicGenerationProgress(
  jobId: string
): Promise<{ progress?: ComicGenerationProgress; error?: string }> {
  const job = getAiJob(jobId);
  if (!job) return { error: "Job not found." };

  const kind = String(job.metadata?.kind ?? "");
  const steps = buildProgressSteps(kind, job.status);

  return {
    progress: {
      jobId: job.id,
      steps,
      currentMessage: job.error ?? (job.status === "completed" ? "Finished" : "Working…"),
      error: job.status === "failed" ? job.error : null,
    },
  };
}

function buildProgressSteps(
  kind: string,
  status: string
): ComicGenerationProgress["steps"] {
  const base: ComicGenerationProgress["steps"] = [
    { id: "story_analyzed", label: "Story analyzed", status: "pending" },
    { id: "scenes_analyzed", label: "Scenes analyzed", status: "pending" },
    { id: "characters_loaded", label: "Characters loaded", status: "pending" },
    { id: "references_loaded", label: "References loaded", status: "pending" },
    { id: "page_planning", label: "Page planning", status: "pending" },
    { id: "panel_planning", label: "Panel planning", status: "pending" },
    { id: "finished", label: "Finished", status: "pending" },
  ];

  if (kind === "story_analysis") {
    base[0]!.status = status === "completed" ? "done" : status === "failed" ? "failed" : "active";
  }
  if (kind === "comic_page_planning") {
    base.slice(0, 4).forEach((s) => { s.status = "done"; });
    base[4]!.status = status === "completed" ? "done" : status === "failed" ? "failed" : "active";
  }
  if (kind === "panel_planning") {
    base.slice(0, 5).forEach((s) => { s.status = "done"; });
    base[5]!.status = status === "completed" ? "done" : status === "failed" ? "failed" : "active";
  }
  if (status === "completed") {
    base[base.length - 1]!.status = "done";
  }

  return base;
}

