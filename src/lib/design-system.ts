/**
 * CharID unified design system — Tailwind class strings.
 * @see src/lib/design-tokens.ts
 * @see docs/DESIGN_SYSTEM_AUDIT.md
 */

/* ── Typography ── */

export const dsPageTitle =
  "text-xl font-semibold tracking-tight text-neutral-900";

export const dsPageSubtitle =
  "mt-1 text-sm text-neutral-600";

export const dsSectionLabel =
  "text-[11px] font-medium uppercase tracking-wide text-neutral-500";

export const dsEyebrow = dsSectionLabel;

export const dsBody =
  "text-sm leading-relaxed text-neutral-600";

export const dsMarketingHeadline =
  "text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl";

export const dsMarketingSectionTitle =
  "text-lg font-semibold tracking-tight text-[var(--foreground)]";

/* ── Buttons ── */

export const dsBtnPrimary =
  "inline-flex items-center justify-center rounded-lg bg-[var(--brand-accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--brand-accent-hover)] disabled:cursor-not-allowed disabled:opacity-50";

export const dsBtnPrimarySm =
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[var(--brand-accent)] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[var(--brand-accent-hover)]";

export const dsBtnSecondary =
  "inline-flex items-center justify-center rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--brand-surface-elevated)]";

export const dsBtnGhost =
  "inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--brand-text-secondary)] transition hover:bg-[var(--brand-surface-elevated)] hover:text-[var(--foreground)]";

/* ── Surfaces ── */

export const dsPanel =
  "rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5";

export const dsSection =
  "mb-6 scroll-mt-4 rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-5";

export const dsCard =
  "overflow-hidden rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] transition hover:border-neutral-300";

export const dsCardInteractive = `group/card block ${dsCard}`;

export const dsCardLink =
  "group rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-3.5 transition hover:bg-[var(--brand-surface-elevated)]";

export const dsEmptyArt =
  "flex h-full min-h-[8rem] items-center justify-center bg-[var(--studio-empty-fill)] text-xs text-neutral-500";

export const dsEmptyCover =
  "flex h-full min-h-[8rem] flex-col items-center justify-center gap-1 bg-[var(--studio-empty-fill)] px-4 py-6 text-center";

export const dsEmptyCoverCompact =
  "flex h-full min-h-[5rem] flex-col items-center justify-center gap-0.5 bg-[var(--studio-empty-fill)] px-3 py-4 text-center";

export const dsInput =
  "w-full rounded-lg border border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--brand-text-muted)] outline-none transition focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[color-mix(in_srgb,var(--brand-accent)_20%,transparent)]";

/* ── Alerts & status (informational — no orange) ── */

export const dsAlertInfo =
  "rounded-lg border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-3 py-2 text-sm text-[var(--status-info-text)]";

/** @deprecated Use dsAlertInfo — warnings are informational, not orange */
export const dsAlertWarning = dsAlertInfo;

export const dsAlertError =
  "rounded-lg border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] px-3 py-2 text-sm text-[var(--status-danger-text)]";

export const dsAlertSuccess =
  "rounded-lg border border-[var(--status-success-border)] bg-[var(--status-success-bg)] px-3 py-2 text-sm text-[var(--status-success-text)]";

export const dsStatusSuccess =
  "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide border border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success-text)]";

export const dsStatusInfo =
  "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide border border-[var(--status-info-border)] bg-[var(--status-info-bg)] text-[var(--status-info-text)]";

export const dsStatusDanger =
  "rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] text-[var(--status-danger-text)]";

/* ── Layout ── */

export const dsPageStack = "space-y-6";

export const dsProgressFill =
  "h-full rounded-full bg-[var(--brand-accent)] transition-all";

export const dsChip =
  "rounded-md border border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] px-2 py-0.5 text-[11px] font-medium text-neutral-600";

/* ── Modals ── */

export const dsModalBackdrop = "fixed inset-0 bg-black/40 backdrop-blur-[2px]";

export const dsModalPanel =
  "relative z-10 flex w-full max-w-lg max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-xl border border-[var(--brand-border)] bg-[var(--brand-surface)] shadow-lg";

export const dsModalHeader =
  "shrink-0 flex items-center justify-between border-b border-[var(--brand-border)] px-5 py-4";

/* ── Nav (see DashboardNavItem) ── */

export const dsNavInactive =
  "text-[var(--brand-text-secondary)] hover:bg-[var(--brand-surface-elevated)] hover:text-[var(--foreground)]";

export const dsNavActive =
  "font-semibold text-[var(--foreground)] bg-[var(--brand-surface-elevated)]";

export const dsNavIndicator =
  "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[var(--brand-accent)]";

/* ── Marketing ── */

export const dsPipelineArrow =
  "hidden text-[var(--brand-text-muted)] sm:inline text-sm select-none";

export const dsPipelineStep = "flex flex-col items-center gap-1 text-center";

export const dsShowcaseFrame =
  "relative overflow-hidden rounded-xl border border-[var(--brand-border)] bg-[var(--studio-empty-fill)] aspect-video";

// Re-export legacy names used across codebase (visual-identity compatibility)
export {
  dsBtnPrimary as studioBtnPrimary,
  dsBtnPrimarySm as studioBtnPrimarySm,
  dsBtnSecondary as studioBtnSecondary,
  dsEyebrow as studioEyebrow,
  dsSectionLabel as studioSectionLabel,
  dsPanel as studioPanel,
  dsSection as studioSection,
  dsCardLink as studioCardLink,
  dsPanel as studioInspirePanel,
  dsEmptyArt as studioEmptyArt,
  dsProgressFill as studioProgressFill,
  dsChip as studioWarmChip,
  dsPanel as studioHeroWash,
  dsPanel as studioAdminCard,
  dsSectionLabel as studioAdminSectionTitle,
  dsCardInteractive as studioCardSurface,
  dsEmptyCover as studioCreativeEmptyCover,
  dsMarketingHeadline as studioMarketingHeadline,
  dsMarketingSectionTitle as studioMarketingSectionTitle,
  dsBody as studioMarketingBody,
  dsShowcaseFrame as studioShowcaseFrame,
  dsPipelineStep as studioPipelineStep,
  dsPipelineArrow as studioPipelineArrow,
  dsPageStack as studioPageStack,
  dsPageTitle as studioSectionHeading,
  dsBody as studioSectionSub,
};
