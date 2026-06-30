"use client";

import { useEffect, useState } from "react";
import { getComicGenerationProgress } from "@/app/actions/ai/comic-generation";
import type { ComicGenerationProgress } from "@/types/ai/comic-planning";

type GenerationProgressWindowProps = {
  jobId: string;
  onComplete?: () => void;
  onRetry?: () => void;
};

export function GenerationProgressWindow({
  jobId,
  onComplete,
  onRetry,
}: GenerationProgressWindowProps) {
  const [progress, setProgress] = useState<ComicGenerationProgress | null>(null);

  useEffect(() => {
    let active = true;
    async function poll() {
      const result = await getComicGenerationProgress(jobId);
      if (!active || !result.progress) return;
      setProgress(result.progress);
      const allDone = result.progress.steps.every(
        (s) => s.status === "done" || s.status === "failed"
      );
      if (allDone && !result.progress.error) {
        onComplete?.();
      }
    }
    void poll();
    const interval = setInterval(poll, 800);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [jobId, onComplete]);

  if (!progress) {
    return <p className="text-sm text-[var(--brand-text-muted)]">Starting…</p>;
  }

  return (
    <div className="space-y-2">
      <ul className="space-y-1 text-sm">
        {progress.steps.map((step) => (
          <li key={step.id} className="flex items-center gap-2">
            <span aria-hidden>
              {step.status === "done" && "✓"}
              {step.status === "active" && "…"}
              {step.status === "failed" && "✗"}
              {step.status === "pending" && "○"}
            </span>
            <span
              className={
                step.status === "active"
                  ? "font-medium text-[var(--foreground)]"
                  : "text-[var(--brand-text-secondary)]"
              }
            >
              {step.label}
            </span>
          </li>
        ))}
      </ul>
      {progress.error && (
        <div className="space-y-2">
          <p className="text-sm text-[var(--status-danger-text)]">{progress.error}</p>
          {onRetry && (
            <button type="button" onClick={onRetry} className="text-sm underline">
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}
