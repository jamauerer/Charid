#!/usr/bin/env node
/**
 * Strict palette correction — approved colors only; strip color-mix except a11y overlays.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "src");

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (/\.(tsx|ts|css)$/.test(name)) acc.push(p);
  }
  return acc;
}

const replacements = [
  // Focus
  [
    "focus:border-[color-mix(in_srgb,var(--brand-accent)_50%,var(--brand-border))]",
    "focus:border-[var(--brand-accent)]",
  ],
  [
    "focus:border-[color-mix(in_srgb,var(--brand-accent)_40%,var(--brand-border))]",
    "focus:border-[var(--brand-accent)]",
  ],
  [
    "focus:ring-1 focus:ring-[color-mix(in_srgb,var(--brand-accent)_30%,transparent)]",
    "focus:ring-1 focus:ring-[var(--brand-accent)]",
  ],
  [
    "focus:ring-1 focus:ring-[color-mix(in_srgb,var(--brand-accent)_20%,transparent)]",
    "focus:ring-1 focus:ring-[var(--brand-accent)]",
  ],
  // File inputs
  [
    "file:bg-[color-mix(in_srgb,var(--brand-accent)_20%,transparent)]",
    "file:bg-[var(--tag-primary-bg)]",
  ],
  [
    "hover:file:bg-[color-mix(in_srgb,var(--brand-accent)_30%,transparent)]",
    "hover:file:bg-[var(--tag-primary-bg)]",
  ],
  [
    "file:bg-[color-mix(in_srgb,var(--brand-accent)_12%,var(--brand-surface))]",
    "file:bg-[var(--tag-primary-bg)]",
  ],
  // Panels / guides
  [
    "border border-[color-mix(in_srgb,var(--brand-accent)_20%,transparent)] bg-[color-mix(in_srgb,var(--brand-accent)_5%,transparent)]",
    "border border-[var(--brand-border)] bg-[var(--tag-primary-bg)]",
  ],
  [
    "border border-[color-mix(in_srgb,var(--brand-accent)_20%,transparent)] bg-[color-mix(in_srgb,var(--brand-accent)_6%,transparent)]",
    "border border-[var(--brand-border)] bg-[var(--tag-primary-bg)]",
  ],
  [
    "rounded-full border border-[color-mix(in_srgb,var(--brand-accent)_20%,transparent)] bg-[var(--tag-primary-bg)]",
    "rounded-full border border-[var(--brand-border)] bg-[var(--tag-primary-bg)]",
  ],
  [
    "rounded-lg border border-[color-mix(in_srgb,var(--brand-accent)_30%,transparent)] bg-[var(--tag-primary-bg)]",
    "rounded-lg border border-[var(--brand-border)] bg-[var(--tag-primary-bg)]",
  ],
  // Borders / rings / backgrounds
  ["border-[color-mix(in_srgb,var(--brand-accent)_60%,transparent)]", "border-[var(--brand-accent)]"],
  ["border-[color-mix(in_srgb,var(--brand-accent)_50%,transparent)]", "border-[var(--brand-accent)]"],
  ["border-[color-mix(in_srgb,var(--brand-accent)_40%,transparent)]", "border-[var(--brand-accent)]"],
  ["border-[color-mix(in_srgb,var(--brand-accent)_30%,transparent)]", "border-[var(--brand-border)]"],
  ["border-[color-mix(in_srgb,var(--brand-accent)_20%,transparent)]", "border-[var(--brand-border)]"],
  ["ring-2 ring-[color-mix(in_srgb,var(--brand-accent)_40%,transparent)]", "ring-2 ring-[var(--brand-accent)]"],
  ["ring-2 ring-[color-mix(in_srgb,var(--brand-accent)_30%,transparent)]", "ring-2 ring-[var(--brand-accent)]"],
  ["bg-[color-mix(in_srgb,var(--brand-accent)_60%,transparent)]", "bg-[var(--tag-primary-bg)]"],
  ["bg-[color-mix(in_srgb,var(--brand-accent)_20%,transparent)]", "bg-[var(--tag-primary-bg)]"],
  ["bg-[color-mix(in_srgb,var(--brand-accent)_15%,transparent)]", "bg-[var(--tag-primary-bg)]"],
  ["bg-[color-mix(in_srgb,var(--brand-accent)_6%,transparent)]", "bg-[var(--tag-primary-bg)]"],
  ["hover:border-[color-mix(in_srgb,var(--brand-accent)_40%,transparent)]", "hover:border-[var(--brand-accent)]"],
  ["hover:bg-[color-mix(in_srgb,var(--brand-accent)_20%,transparent)]", "hover:bg-[var(--tag-primary-bg)]"],
  ["hover:bg-[color-mix(in_srgb,var(--brand-accent)_10%,transparent)]", "hover:bg-[var(--tag-primary-bg)]"],
  [
    "border-[color-mix(in_srgb,var(--brand-accent)_20%,var(--brand-border))]",
    "border-[var(--brand-border)]",
  ],
  [
    "hover:border-[color-mix(in_srgb,var(--brand-accent)_25%,var(--brand-border))]",
    "hover:border-[var(--brand-accent)]",
  ],
  // Status banner mixes → flat status tokens
  [
    "border border-[color-mix(in_srgb,var(--brand-warning)_25%,var(--brand-border))] bg-[color-mix(in_srgb,var(--brand-warning)_8%,var(--brand-surface))]",
    "border border-[var(--status-info-border)] bg-[var(--status-info-bg)]",
  ],
  [
    "bg-[color-mix(in_srgb,var(--brand-success)_12%,var(--brand-surface))]",
    "bg-[var(--status-success-bg)]",
  ],
  [
    "bg-[color-mix(in_srgb,var(--brand-danger)_12%,var(--brand-surface))]",
    "bg-[var(--status-danger-bg)]",
  ],
  [
    "bg-[color-mix(in_srgb,var(--brand-accent)_12%,var(--brand-surface))]",
    "bg-[var(--tag-primary-bg)]",
  ],
  [
    "border-[color-mix(in_srgb,var(--brand-accent)_40%,transparent)] bg-[color-mix(in_srgb,var(--brand-accent)_15%,transparent)]",
    "border-[var(--brand-border)] bg-[var(--tag-primary-bg)]",
  ],
  // Accent-derived empty gradients → flat placeholder
  [
    /bg-gradient-to-br from-\[color-mix\(in_srgb,var\(--brand-accent\)_\d+%,var\(--studio-empty-fill\)\)\] to-\[var\(--studio-empty-fill\)\]/g,
    "bg-[var(--studio-empty-fill)]",
  ],
  // Legacy zinc empty covers → placeholder
  [
    "bg-gradient-to-br from-zinc-900 via-zinc-950 to-black",
    "bg-[var(--studio-empty-fill)]",
  ],
  // Scene cover gradient → placeholder
  [
    "bg-gradient-to-br from-[var(--studio-empty-fill)] via-[var(--brand-surface-elevated)] to-[var(--brand-surface)]",
    "bg-[var(--studio-empty-fill)]",
  ],
  // Broken empty gradient headers
  ["bg-gradient-to-br  px-5 py-4", "bg-[var(--brand-surface)] px-5 py-4"],
  // Hover accent (now same as base)
  ["hover:bg-[var(--brand-accent-hover)]", "hover:bg-[var(--brand-accent)]"],
  // Portfolio card hover
  ["hover:bg-[#111113]", "hover:bg-[var(--brand-sidebar)]"],
  // Legacy violet atmospheric wash → remove (flat page shows through)
  [
    'className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_-10%,rgba(120,119,198,0.08),transparent)]"',
    'className="pointer-events-none fixed inset-0"',
  ],
];

const files = walk(src);
let changed = 0;
for (const file of files) {
  let content = readFileSync(file, "utf8");
  const original = content;
  for (const [from, to] of replacements) {
    if (from instanceof RegExp) content = content.replace(from, to);
    else content = content.split(from).join(to);
  }
  if (content !== original) {
    writeFileSync(file, content, "utf8");
    changed++;
  }
}
console.log(`Updated ${changed} files.`);
