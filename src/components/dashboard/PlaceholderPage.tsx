type PlaceholderPageProps = {
  title: string;
  description: string;
};

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-white/[0.06] bg-[#0f0f11] px-6 py-10 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet-400/80">
          Coming Soon
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-100">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-500">
          {description}
        </p>
      </div>
    </div>
  );
}
