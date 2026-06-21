#!/usr/bin/env node
/**
 * One-time palette migration: replace hardcoded violet Tailwind with design tokens.
 * Does not modify design-tokens.ts or *.svg
 */
import { readFileSync, writeFileSync } from "fs";
import { globSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const replacements = [
  ["focus:border-violet-500/50", "focus:border-[color-mix(in_srgb,var(--brand-accent)_50%,var(--brand-border))]"],
  ["focus:border-violet-500/40", "focus:border-[color-mix(in_srgb,var(--brand-accent)_40%,var(--brand-border))]"],
  ["focus:ring-1 focus:ring-violet-500/30", "focus:ring-1 focus:ring-[color-mix(in_srgb,var(--brand-accent)_30%,transparent)]"],
  ["shadow-sm shadow-violet-500/15", "shadow-sm"],
  ["shadow-md shadow-violet-500/20", "shadow-md"],
  ["file:bg-violet-600/20", "file:bg-[color-mix(in_srgb,var(--brand-accent)_20%,transparent)]"],
  ["hover:file:bg-violet-600/30", "hover:file:bg-[color-mix(in_srgb,var(--brand-accent)_30%,transparent)]"],
  [
    "border border-violet-500/20 bg-violet-500/[0.06]",
    "border border-[color-mix(in_srgb,var(--brand-accent)_20%,transparent)] bg-[color-mix(in_srgb,var(--brand-accent)_6%,transparent)]",
  ],
  [
    "rounded-md border border-violet-500/20 bg-violet-500/5",
    "rounded-md border border-[color-mix(in_srgb,var(--brand-accent)_20%,transparent)] bg-[color-mix(in_srgb,var(--brand-accent)_5%,transparent)]",
  ],
  [
    "rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-200",
    "rounded-full border border-[color-mix(in_srgb,var(--brand-accent)_20%,transparent)] bg-[var(--tag-primary-bg)] px-2.5 py-1 text-xs font-medium text-[var(--tag-primary-text)]",
  ],
  [
    "rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-200",
    "rounded-lg border border-[color-mix(in_srgb,var(--brand-accent)_30%,transparent)] bg-[var(--tag-primary-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--tag-primary-text)]",
  ],
  [
    "border border-violet-500/20 bg-violet-500/10",
    "border border-[color-mix(in_srgb,var(--brand-accent)_20%,transparent)] bg-[var(--tag-primary-bg)]",
  ],
  ["bg-violet-600/20 text-violet-200", "bg-[var(--tag-primary-bg)] text-[var(--tag-primary-text)]"],
  ["hover:border-violet-400/40 hover:text-violet-200", "hover:border-[color-mix(in_srgb,var(--brand-accent)_40%,transparent)] hover:text-[var(--brand-accent)]"],
  ["hover:border-violet-400/40 hover:text-violet-100", "hover:border-[color-mix(in_srgb,var(--brand-accent)_40%,transparent)] hover:text-[var(--brand-accent)]"],
  ["border-violet-500/40 bg-violet-500/15", "border-[color-mix(in_srgb,var(--brand-accent)_40%,transparent)] bg-[color-mix(in_srgb,var(--brand-accent)_15%,transparent)]"],
  ["border-violet-500/40 bg-violet-500/10", "border-[color-mix(in_srgb,var(--brand-accent)_40%,transparent)] bg-[var(--tag-primary-bg)]"],
  ["border-violet-500 ring-2 ring-violet-500/40", "border-[var(--brand-accent)] ring-2 ring-[color-mix(in_srgb,var(--brand-accent)_40%,transparent)]"],
  ["bg-violet-400 ring-2 ring-violet-200/80", "bg-[var(--brand-secondary-accent)] ring-2 ring-[color-mix(in_srgb,var(--brand-accent)_30%,transparent)]"],
  ["bg-gradient-to-r from-violet-500 to-indigo-500", "bg-[var(--brand-accent)]"],
  [
    "bg-gradient-to-br from-violet-950/20 to-zinc-900",
    "bg-gradient-to-br from-[color-mix(in_srgb,var(--brand-accent)_15%,var(--studio-empty-fill))] to-[var(--studio-empty-fill)]",
  ],
  [
    "bg-gradient-to-br from-violet-950/30 to-zinc-900",
    "bg-gradient-to-br from-[color-mix(in_srgb,var(--brand-accent)_20%,var(--studio-empty-fill))] to-[var(--studio-empty-fill)]",
  ],
  [
    "bg-gradient-to-br from-violet-950/40 to-zinc-900",
    "bg-gradient-to-br from-[color-mix(in_srgb,var(--brand-accent)_25%,var(--studio-empty-fill))] to-[var(--studio-empty-fill)]",
  ],
  ["bg-gradient-to-r bg-[var(--brand-accent)]", "bg-[var(--brand-accent)]"],
  ["font-semibold text-white shadow-sm", "font-semibold text-[var(--brand-accent-foreground)] shadow-sm"],
  ["font-semibold text-white shadow-md", "font-semibold text-[var(--brand-accent-foreground)] shadow-md"],
  ["text-[10px] font-semibold uppercase tracking-wide text-white", "text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-accent-foreground)]"],
  ["text-[10px] font-medium text-white", "text-[10px] font-medium text-[var(--brand-accent-foreground)]"],
  ["font-semibold uppercase text-white", "font-semibold uppercase text-[var(--brand-accent-foreground)]"],
  ["text-violet-200", "text-[var(--tag-primary-text)]"],
  ["text-violet-500", "text-[var(--brand-accent)]"],
  ["text-violet-100", "text-[var(--brand-accent-foreground)]"],
  ["bg-violet-500/15 text-neutral-600", "bg-[color-mix(in_srgb,var(--brand-accent)_15%,transparent)] text-[var(--brand-text-secondary)]"],
  ["bg-violet-500/20", "bg-[color-mix(in_srgb,var(--brand-accent)_20%,transparent)]"],
  ["bg-violet-500/10", "bg-[var(--tag-primary-bg)]"],
  ["bg-violet-500/15", "bg-[color-mix(in_srgb,var(--brand-accent)_15%,transparent)]"],
  ["bg-violet-500/[0.06]", "bg-[color-mix(in_srgb,var(--brand-accent)_6%,transparent)]"],
  ["border-violet-500/30", "border-[color-mix(in_srgb,var(--brand-accent)_30%,transparent)]"],
  ["border-violet-500/40", "border-[color-mix(in_srgb,var(--brand-accent)_40%,transparent)]"],
  ["border-violet-500/50", "border-[color-mix(in_srgb,var(--brand-accent)_50%,transparent)]"],
  ["border-violet-500/60", "border-[color-mix(in_srgb,var(--brand-accent)_60%,transparent)]"],
  ["border-violet-500/20", "border-[color-mix(in_srgb,var(--brand-accent)_20%,transparent)]"],
  ["hover:bg-violet-500/10", "hover:bg-[color-mix(in_srgb,var(--brand-accent)_10%,transparent)]"],
  ["hover:bg-violet-500/20", "hover:bg-[color-mix(in_srgb,var(--brand-accent)_20%,transparent)]"],
  ["hover:border-violet-400/40", "hover:border-[color-mix(in_srgb,var(--brand-accent)_40%,transparent)]"],
  ["ring-2 ring-violet-500/40", "ring-2 ring-[color-mix(in_srgb,var(--brand-accent)_40%,transparent)]"],
  ["ring-2 ring-violet-500/30", "ring-2 ring-[color-mix(in_srgb,var(--brand-accent)_30%,transparent)]"],
  ["bg-violet-600/90", "bg-[var(--brand-accent)]"],
  ["rounded bg-violet-600 px", "rounded bg-[var(--brand-accent)] px"],
  ["bg-violet-500/60", "bg-[color-mix(in_srgb,var(--brand-accent)_60%,transparent)]"],
  ["border-violet-500", "border-[var(--brand-accent)]"],
];

const files = globSync("src/**/*.{tsx,ts}", { cwd: root, absolute: true }).filter(
  (f) => !f.endsWith(".svg") && !f.endsWith("design-tokens.ts")
);

let changed = 0;
const changedFiles = [];
for (const file of files) {
  let content = readFileSync(file, "utf8");
  const original = content;
  for (const [from, to] of replacements) {
    content = content.split(from).join(to);
  }
  if (content !== original) {
    writeFileSync(file, content, "utf8");
    changed++;
    changedFiles.push(file.replace(root + "\\", "").replace(root + "/", ""));
  }
}
console.log(`Done. ${changed} files updated.`);
for (const f of changedFiles) console.log("  ", f);
