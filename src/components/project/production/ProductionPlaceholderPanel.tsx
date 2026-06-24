"use client";

type ProductionPlaceholderPanelProps = {
  kind: "compile" | "download";
  productLabel: string;
};

const COMPILE_COPY =
  "Compile will assemble your production structure into a finished work inside CharID — a compiled novel, graphic novel, storybook, or screenplay you can review before exporting.";

const DOWNLOAD_COPY =
  "Download will export your compiled work to external formats such as PDF, DOCX, EPUB, CBZ, or FDX.";

export function ProductionPlaceholderPanel({
  kind,
  productLabel,
}: ProductionPlaceholderPanelProps) {
  const title = kind === "compile" ? "Compile" : "Download";
  const body = kind === "compile" ? COMPILE_COPY : DOWNLOAD_COPY;

  return (
    <div className="rounded-xl border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-6">
      <h3 className="text-sm font-semibold text-[var(--foreground)]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--brand-text-secondary)]">
        {body}
      </p>
      <p className="mt-4 text-xs text-[var(--brand-text-muted)]">
        Coming in a future milestone — no {title.toLowerCase()} functionality in
        Production MVP v2. Your {productLabel} structure can still be organized
        in the tabs above.
      </p>
    </div>
  );
}
