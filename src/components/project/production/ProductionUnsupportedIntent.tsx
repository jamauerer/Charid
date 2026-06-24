import {
  PROJECT_WORK_INTENT_LABELS,
  type ProjectWorkIntent,
} from "@/types/project";

type ProductionUnsupportedIntentProps = {
  workIntent: ProjectWorkIntent | null;
};

export function ProductionUnsupportedIntent({
  workIntent,
}: ProductionUnsupportedIntentProps) {
  const label = workIntent
    ? PROJECT_WORK_INTENT_LABELS[workIntent]
    : "Not set";

  return (
    <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-6">
      <h3 className="text-sm font-semibold text-[var(--foreground)]">
        Production not available
      </h3>
      <p className="mt-2 text-sm text-[var(--brand-text-secondary)]">
        Production structures are format-specific. This project is set to{" "}
        <span className="font-medium text-[var(--foreground)]">{label}</span>.
      </p>
      <p className="mt-2 text-sm text-[var(--brand-text-muted)]">
        Set your project format to Novel, Graphic Novel, Picture Book, or
        Screenplay to organize a production structure. Your Story Layer —
        stories, scenes, and characters — remains your working spine.
      </p>
    </div>
  );
}
