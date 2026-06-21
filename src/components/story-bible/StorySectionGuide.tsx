import { CREATOR_STORY } from "@/lib/creator-vocabulary";

type StorySectionGuideProps = {
  title: string;
  why: string;
  consistency: string;
  creativeImpact: string;
};

export function StorySectionGuide({
  title,
  why,
  consistency,
  creativeImpact,
}: StorySectionGuideProps) {
  return (
    <div className="rounded-lg border border-[var(--brand-border)] bg-[var(--tag-primary-bg)] p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
        Why {title} matters
      </p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--brand-text-secondary)]">{why}</p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-[10px] font-medium uppercase tracking-wide text-[var(--brand-text-secondary)]">
            Consistency
          </dt>
          <dd className="mt-1 text-sm leading-relaxed text-[var(--brand-text-secondary)]">
            {consistency}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-medium uppercase tracking-wide text-[var(--brand-text-secondary)]">
            {CREATOR_STORY.guideImpactLabel}
          </dt>
          <dd className="mt-1 text-sm leading-relaxed text-[var(--brand-text-secondary)]">
            {creativeImpact}
          </dd>
        </div>
      </dl>
    </div>
  );
}
