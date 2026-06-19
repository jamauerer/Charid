type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-6 py-10 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
          Coming Soon
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--brand-text-secondary)]">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--brand-text-secondary)]">
          {description}
        </p>
      </div>
    </div>
  );
}
