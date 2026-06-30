"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { ProjectStoryEntry } from "@/app/actions/projects";
import {
  approveComicPlan,
  getComicGenerationProgress,
  runComicPlanning,
  runStoryAnalysis,
} from "@/app/actions/ai/comic-generation";
import { ProductionReviewPanel } from "@/components/project/production/comic/ProductionReviewPanel";
import { GenerationProgressWindow } from "@/components/project/production/comic/GenerationProgressWindow";
import { AI_CREDIT_COSTS } from "@/types/credit";
import type { ComicPlanProposal, StoryAnalysisResult } from "@/types/ai/comic-planning";
import type { ProductionIntelligenceBundle } from "@/types/ai/production-intelligence";
import { studioBtnPrimarySm, studioBtnSecondary } from "@/lib/visual-identity";

function isTrackableJobId(jobId?: string | null): jobId is string {
  return Boolean(jobId && jobId !== "template");
}

type GenerateComicWizardProps = {
  projectId: string;
  stories: ProjectStoryEntry[];
  artStyle?: string;
  onClose: () => void;
};

type WizardStep = "story" | "style" | "model" | "analyze" | "review" | "progress";

export function GenerateComicWizard({
  projectId,
  stories,
  artStyle = "Comic / graphic novel",
  onClose,
}: GenerateComicWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>("story");
  const [storyId, setStoryId] = useState(stories[0]?.story.id ?? "");
  const [style, setStyle] = useState(artStyle);
  const [modelKey, setModelKey] = useState("openai — GPT-4o Mini");
  const [analysis, setAnalysis] = useState<StoryAnalysisResult | null>(null);
  const [plan, setPlan] = useState<ComicPlanProposal | null>(null);
  const [intelligence, setIntelligence] = useState<ProductionIntelligenceBundle | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [editorHref, setEditorHref] = useState<string | null>(null);
  const [progressPhase, setProgressPhase] = useState<"analyze" | "approve">("analyze");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleAnalyze() {
    startTransition(async () => {
      setError(null);
      setProgressPhase("analyze");
      setStep("progress");
      const result = await runStoryAnalysis({ projectId, storyId });
      if (result.error) {
        setError(result.error);
        setStep("analyze");
        return;
      }
      setAnalysis(result.analysis ?? null);
      setJobId(isTrackableJobId(result.jobId) ? result.jobId : null);

      const planResult = await runComicPlanning({
        projectId,
        storyId,
        analysis: result.analysis!,
        artStyle: style,
      });
      if (planResult.error) {
        setError(planResult.error);
        setStep("analyze");
        return;
      }
      setPlan(planResult.plan ?? null);
      setAnalysis(planResult.analysis ?? result.analysis ?? null);
      setIntelligence(planResult.intelligence ?? null);
      setJobId(isTrackableJobId(planResult.jobId) ? planResult.jobId : null);
      setStep(isTrackableJobId(planResult.jobId) ? "progress" : "review");
    });
  }

  function handleApprove() {
    if (!plan) return;
    startTransition(async () => {
      setError(null);
      setProgressPhase("approve");
      setStep("progress");
      const result = await approveComicPlan({ projectId, plan });
      if (result.error) {
        setError(result.error);
        setStep("review");
        return;
      }
      if (result.editorHref) setEditorHref(result.editorHref);
      if (isTrackableJobId(result.jobId)) {
        setJobId(result.jobId);
        return;
      }
      if (result.editorHref) {
        router.push(result.editorHref);
        router.refresh();
      }
      onClose();
    });
  }

  function handlePageCountChange(targetCount: number) {
    setPlan((prev) => {
      if (!prev || targetCount === prev.pageCount) return prev;
      if (targetCount < prev.pageCount) {
        const pages = prev.pages.slice(0, targetCount).map((page, index) => ({
          ...page,
          pageNumber: index + 1,
        }));
        return { ...prev, pageCount: targetCount, pages };
      }
      const pages = [...prev.pages];
      while (pages.length < targetCount) {
        const n = pages.length + 1;
        const template = prev.pages[prev.pages.length - 1];
        pages.push({
          id: crypto.randomUUID(),
          pageNumber: n,
          title: `Page ${n}`,
          description: template?.description ?? `Story beat ${n}.`,
          panelCount: template?.panelCount ?? 4,
          sceneIds: template?.sceneIds ?? [],
          pacing: "Story progression",
        });
      }
      return { ...prev, pageCount: targetCount, pages };
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className={`max-h-[90vh] w-full overflow-y-auto rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5 shadow-xl ${
          step === "review" ? "max-w-2xl" : "max-w-lg"
        }`}
      >
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Generate Comic</h2>
            <p className="text-xs text-[var(--brand-text-muted)]">
              Analyze → Review → Edit → Approve. Nothing is created until you approve.
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-sm text-[var(--brand-text-muted)]">
            ✕
          </button>
        </div>

        {error && (
          <p className="mb-3 rounded-lg border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] px-3 py-2 text-sm text-[var(--status-danger-text)]">
            {error}
          </p>
        )}

        {step === "story" && (
          <div className="space-y-3">
            <label className="block text-xs text-[var(--brand-text-muted)]">
              Choose story
              <select
                value={storyId}
                onChange={(e) => setStoryId(e.target.value)}
                className="production-editor-select mt-1 w-full"
              >
                {stories.map((entry) => (
                  <option key={entry.story.id} value={entry.story.id}>
                    {entry.story.title}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" onClick={() => setStep("style")} className={studioBtnPrimarySm}>
              Continue
            </button>
          </div>
        )}

        {step === "style" && (
          <div className="space-y-3">
            <label className="block text-xs text-[var(--brand-text-muted)]">
              Art style
              <input
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="production-editor-input mt-1 w-full"
              />
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setStep("story")} className={studioBtnSecondary}>
                Back
              </button>
              <button type="button" onClick={() => setStep("model")} className={studioBtnPrimarySm}>
                Continue
              </button>
            </div>
          </div>
        )}

        {step === "model" && (
          <div className="space-y-3">
            <label className="block text-xs text-[var(--brand-text-muted)]">
              AI model (planning)
              <select
                value={modelKey}
                onChange={(e) => setModelKey(e.target.value)}
                className="production-editor-select mt-1 w-full"
              >
                <option value="openai — GPT-4o Mini">OpenAI — GPT-4o Mini</option>
                <option value="anthropic — Claude 3.5 Sonnet">Anthropic — Claude 3.5 Sonnet</option>
                <option value="google — Gemini 2.0 Flash">Google — Gemini 2.0 Flash</option>
              </select>
            </label>
            <p className="text-xs text-[var(--brand-text-muted)]">
              Est. credits: {AI_CREDIT_COSTS.story_analysis + AI_CREDIT_COSTS.comic_page_planning} for
              analysis + page plan
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setStep("style")} className={studioBtnSecondary}>
                Back
              </button>
              <button type="button" onClick={() => setStep("analyze")} className={studioBtnPrimarySm}>
                Continue
              </button>
            </div>
          </div>
        )}

        {step === "analyze" && (
          <div className="space-y-3">
            <p className="text-sm text-[var(--brand-text-secondary)]">
              Production Intelligence will analyze your story, scenes, and pacing — then propose a
              plan you can edit before anything is created.
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setStep("model")} className={studioBtnSecondary}>
                Back
              </button>
              <button type="button" disabled={pending} onClick={handleAnalyze} className={studioBtnPrimarySm}>
                Analyze story
              </button>
            </div>
          </div>
        )}

        {step === "progress" && jobId && (
          <GenerationProgressWindow
            jobId={jobId}
            onComplete={() => {
              if (progressPhase === "analyze") {
                setStep("review");
                return;
              }
              if (editorHref) {
                router.push(editorHref);
                router.refresh();
              }
              onClose();
            }}
            onRetry={progressPhase === "approve" ? handleApprove : handleAnalyze}
          />
        )}

        {step === "progress" && !jobId && (
          <p className="text-sm text-[var(--brand-text-muted)]">Finishing…</p>
        )}

        {step === "review" && plan && analysis && (
          <div className="space-y-4">
            <ProductionReviewPanel
              analysis={analysis}
              plan={plan}
              intelligence={intelligence}
              artStyle={style}
              onPlanChange={setPlan}
              onPageCountChange={handlePageCountChange}
            />
            <div className="flex gap-2 border-t border-[var(--brand-border)] pt-3">
              <button type="button" onClick={() => setStep("analyze")} className={studioBtnSecondary}>
                Back
              </button>
              <button type="button" disabled={pending} onClick={handleApprove} className={studioBtnPrimarySm}>
                Approve & open CharID Studio
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
