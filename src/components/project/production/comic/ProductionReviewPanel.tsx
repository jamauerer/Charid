"use client";

import type { ComicPlanProposal, StoryAnalysisResult } from "@/types/ai/comic-planning";
import type { ProductionIntelligenceBundle } from "@/types/ai/production-intelligence";
import { AI_PROJECT_TYPE_LABELS } from "@/types/ai/core";

type ProductionReviewPanelProps = {
  analysis: StoryAnalysisResult;
  plan: ComicPlanProposal;
  intelligence: ProductionIntelligenceBundle | null;
  artStyle: string;
  onPlanChange: (plan: ComicPlanProposal) => void;
  onPageCountChange: (count: number) => void;
};

export function ProductionReviewPanel({
  analysis,
  plan,
  intelligence,
  artStyle,
  onPlanChange,
  onPageCountChange,
}: ProductionReviewPanelProps) {
  const summary = intelligence?.summary;
  const storyIntel = analysis.intelligence ?? intelligence?.story;
  const totalPanels = plan.pages.reduce((sum, page) => sum + page.panelCount, 0);

  function updatePagePanelCount(pageId: string, panelCount: number) {
    onPlanChange({
      ...plan,
      pages: plan.pages.map((page) =>
        page.id === pageId ? { ...page, panelCount: Math.max(1, Math.min(6, panelCount)) } : page
      ),
    });
  }

  function adjustPageCount(delta: number) {
    const next = Math.max(1, Math.min(48, plan.pageCount + delta));
    onPageCountChange(next);
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] p-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
          Story summary
        </h3>
        <p className="mt-1.5 text-sm text-[var(--brand-text-secondary)]">{analysis.storySummary}</p>
      </section>

      {summary && (
        <section className="rounded-lg border border-[var(--brand-border)] p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
            Production summary
          </h3>
          <p className="mt-1.5 text-sm text-[var(--brand-text-secondary)]">{summary.productionSummary}</p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <dt className="text-[var(--brand-text-muted)]">Pages</dt>
              <dd className="font-medium tabular-nums">{summary.estimatedPages}</dd>
            </div>
            <div>
              <dt className="text-[var(--brand-text-muted)]">Panels</dt>
              <dd className="font-medium tabular-nums">{summary.estimatedPanels}</dd>
            </div>
            <div>
              <dt className="text-[var(--brand-text-muted)]">Est. credits</dt>
              <dd className="font-medium tabular-nums">{summary.estimatedCredits}</dd>
            </div>
            <div>
              <dt className="text-[var(--brand-text-muted)]">Project type</dt>
              <dd className="font-medium">{AI_PROJECT_TYPE_LABELS[summary.projectType]}</dd>
            </div>
          </dl>
        </section>
      )}

      {storyIntel && (
        <section className="rounded-lg border border-[var(--brand-border)] p-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
            Story intelligence
          </h3>
          <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
            <div>
              <dt className="text-[var(--brand-text-muted)]">Type</dt>
              <dd>{storyIntel.storyType}</dd>
            </div>
            <div>
              <dt className="text-[var(--brand-text-muted)]">Pacing</dt>
              <dd>{storyIntel.pacing}</dd>
            </div>
            <div>
              <dt className="text-[var(--brand-text-muted)]">Dialogue</dt>
              <dd>{storyIntel.dialogueDensity}</dd>
            </div>
            <div>
              <dt className="text-[var(--brand-text-muted)]">Action</dt>
              <dd>{storyIntel.actionDensity}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-[var(--brand-text-muted)]">Recommended style</dt>
              <dd>{artStyle || storyIntel.recommendedStyle}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-[var(--brand-text-muted)]">Reading pace</dt>
              <dd>{analysis.suggestedReadingPace}</dd>
            </div>
          </dl>
          {storyIntel.recommendations.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-[var(--brand-text-muted)]">
              {storyIntel.recommendations.map((rec, i) => (
                <li key={i}>• {rec.explanation}</li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-text-secondary)]">
            Pages ({plan.pageCount}) · {totalPanels} panels
          </h3>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => adjustPageCount(-1)}
              className="rounded border border-[var(--brand-border)] px-2 py-0.5 text-xs"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => adjustPageCount(1)}
              className="rounded border border-[var(--brand-border)] px-2 py-0.5 text-xs"
            >
              +
            </button>
          </div>
        </div>
        <ul className="max-h-44 space-y-1.5 overflow-y-auto text-xs">
          {plan.pages.map((page) => (
            <li key={page.id} className="rounded-lg border border-[var(--brand-border)] px-2.5 py-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium">{page.title}</p>
                  {page.intelligence && (
                    <p className="mt-0.5 text-[var(--brand-text-muted)]">
                      {page.intelligence.layoutStyle}
                    </p>
                  )}
                </div>
                <label className="flex shrink-0 items-center gap-1 text-[var(--brand-text-muted)]">
                  Panels
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={page.panelCount}
                    onChange={(e) => updatePagePanelCount(page.id, Number(e.target.value))}
                    className="production-editor-input w-12 px-1 py-0.5 text-center"
                  />
                </label>
              </div>
              {page.intelligence?.recommendations[0] && (
                <p className="mt-1 text-[var(--brand-text-muted)]">
                  {page.intelligence.recommendations[0].explanation}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      {intelligence && intelligence.scenes.length > 0 && (
        <details className="rounded-lg border border-[var(--brand-border)] px-3 py-2">
          <summary className="cursor-pointer text-xs font-semibold text-[var(--brand-text-secondary)]">
            Scene analysis ({intelligence.scenes.length})
          </summary>
          <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto text-xs">
            {intelligence.scenes.map((scene) => (
              <li key={scene.sceneId} className="text-[var(--brand-text-muted)]">
                <span className="font-medium text-[var(--brand-text-secondary)]">{scene.sceneTitle}</span>
                {" — "}
                {scene.purpose}, ~{scene.estimatedPanels} panels
              </li>
            ))}
          </ul>
        </details>
      )}

      <label className="block text-xs text-[var(--brand-text-muted)]">
        Volume title
        <input
          value={plan.issueTitle}
          onChange={(e) => onPlanChange({ ...plan, issueTitle: e.target.value })}
          className="production-editor-input mt-1 w-full"
        />
      </label>
    </div>
  );
}
