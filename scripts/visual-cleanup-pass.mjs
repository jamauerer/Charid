#!/usr/bin/env node
/** Visual cleanup pass — remove orange/amber, dark fills, excess purple */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, "..", "src");

const replacements = [
  // Dark empty fills → light studio fill
  [/bg-zinc-900/g, "bg-[var(--studio-empty-fill)]"],
  [/bg-zinc-950/g, "bg-[var(--studio-empty-fill)]"],
  [/bg-stone-900/g, "bg-[var(--studio-empty-fill)]"],
  [/bg-stone-950/g, "bg-[var(--studio-empty-fill)]"],
  [/bg-neutral-950/g, "bg-[var(--studio-empty-fill)]"],
  [/bg-slate-950/g, "bg-[var(--studio-empty-fill)]"],
  [/bg-black\/30/g, "bg-[var(--brand-surface-elevated)]"],
  [/bg-black\/20/g, "bg-[var(--brand-surface-elevated)]"],

  // Amber/orange alert blocks → info tokens
  [
    /rounded-lg border border-amber-500\/\d+ bg-amber-500\/\d+ px-[34] py-[23]\.?5? text-sm text-amber-\d+/g,
    "rounded-lg border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-3 py-2 text-sm text-[var(--status-info-text)]",
  ],
  [
    /rounded-xl border border-amber-500\/\d+ bg-amber-500\/\[0\.0\d+\] px-[45] py-[34]/g,
    "rounded-xl border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-4 py-3",
  ],
  [
    /rounded-lg border border-amber-500\/\d+ bg-amber-500\/\d+ px-3 py-2 text-sm text-amber-\d+/g,
    "rounded-lg border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-3 py-2 text-sm text-[var(--status-info-text)]",
  ],
  [/text-sm text-amber-300/g, "text-sm text-[var(--status-info-text)]"],
  [/text-sm text-amber-200/g, "text-sm text-[var(--status-info-text)]"],
  [/text-sm text-amber-100/g, "text-sm text-[var(--status-info-text)]"],
  [/text-xs text-amber-200\/80/g, "text-xs text-[var(--status-info-text)]"],
  [/text-xs text-amber-400\/90/g, "text-xs text-neutral-500"],
  [/text-amber-300\/90/g, "text-neutral-600"],
  [/text-amber-400\/90/g, "text-neutral-500"],
  [/text-amber-400\/80/g, "text-neutral-500"],
  [/text-amber-400/g, "text-neutral-500"],
  [/text-amber-300/g, "text-neutral-600"],
  [/text-amber-200/g, "text-neutral-600"],
  [/text-amber-100/g, "text-neutral-900"],
  [/text-amber-700/g, "text-neutral-700"],

  // Amber status badges
  [/bg-amber-500\/15 text-amber-300/g, "border border-[var(--status-info-border)] bg-[var(--status-info-bg)] text-[var(--status-info-text)]"],
  [/bg-amber-500\/15 text-amber-200/g, "border border-[var(--status-info-border)] bg-[var(--status-info-bg)] text-[var(--status-info-text)]"],
  [
    /border-amber-500\/\d+ bg-amber-500\/\d+ px-2 py-0\.5 text-\[10px\][^"]*text-amber-\d+/g,
    "border border-[var(--status-info-border)] bg-[var(--status-info-bg)] px-2 py-0.5 text-[10px] font-medium text-[var(--status-info-text)]",
  ],

  // Amber borders/hovers
  [/border-amber-500\/\d+/g, "border-[var(--status-info-border)]"],
  [/hover:border-amber-500\/\d+/g, "hover:border-neutral-300"],
  [/hover:shadow-amber-500\/\d+/g, ""],
  [/hover:text-amber-300\/90/g, "hover:text-neutral-900"],
  [/hover:text-amber-100/g, "hover:text-neutral-900"],

  // Orange gradients
  [/bg-gradient-to-br from-amber-500\/\d+ to-orange-500\/\d+/g, "bg-[var(--status-info-bg)]"],
  [/from-amber-500\/\[0\.1\][^"]*to-transparent/g, ""],
  [/bg-gradient-to-br from-indigo-950\/30 via-violet-950\/20 to-zinc-900/g, "bg-[var(--studio-empty-fill)]"],

  // Amber selected states in scene studios → info neutral
  [
    /border-amber-500\/50 bg-amber-500\/15 text-amber-100/g,
    "border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] text-neutral-900",
  ],
  [/border border-dashed border-amber-500\/20 bg-amber-500\/\[0\.0\d+\]/g, "border border-dashed border-[var(--brand-border)] bg-[var(--brand-surface)]"],

  // Purple on secondary elements → neutral
  [/hover:border-violet-500\/30/g, "hover:border-neutral-300"],
  [/hover:border-violet-500\/20/g, "hover:border-neutral-300"],
  [/hover:bg-violet-500\/\[0\.0\d+\]/g, "hover:bg-[var(--brand-surface-elevated)]"],
  [/border-violet-500\/30 bg-violet-500\/10[^"]*text-violet-300/g, "border-[var(--brand-border)] bg-[var(--brand-surface-elevated)] text-neutral-600"],
  [/text-violet-300/g, "text-neutral-600"],
  [/text-violet-400\/80/g, "text-neutral-500"],
  [/text-violet-400/g, "text-neutral-500"],

  // Emerald/red status → standardized
  [/bg-emerald-500\/15 text-emerald-300/g, "border border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success-text)]"],
  [/bg-red-500\/15 text-red-300/g, "border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] text-[var(--status-danger-text)]"],
  [/text-red-300/g, "text-[var(--status-danger-text)]"],
  [/border-red-500\/20 bg-red-500\/10[^"]*text-red-300/g, "border border-[var(--status-danger-border)] bg-[var(--status-danger-bg)] text-[var(--status-danger-text)]"],

  // Inline empty copy
  [/No cover image/g, "No cover yet"],
  [/No cover selected/g, "No cover yet"],
  [/"No cover"/g, '"No cover yet"'],
  [/title="No cover"/g, 'title="No cover yet"'],

  // Legacy borders
  [/border-white\/\[0\.06\]/g, "border-[var(--brand-border)]"],
  [/border-white\/10/g, "border-[var(--brand-border)]"],

  // Checkbox panels
  [/border-white\/20 bg-zinc-900 text-violet-500/g, "border-[var(--brand-border)] bg-[var(--brand-surface)] accent-[var(--brand-accent)]"],
  [/accent-violet-500/g, "accent-[var(--brand-accent)]"],

  // Auth dark mode remnants
  [/ dark:[^\s"]+/g, ""],
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(tsx|ts)$/.test(entry.name)) files.push(full);
  }
  return files;
}

let changed = 0;
for (const file of walk(SRC)) {
  if (file.includes("design-system.ts") || file.includes("design-tokens.ts")) continue;
  let content = fs.readFileSync(file, "utf8");
  const orig = content;
  for (const [pattern, replacement] of replacements) {
    content = content.replace(pattern, replacement);
  }
  if (content !== orig) {
    fs.writeFileSync(file, content);
    changed++;
  }
}
console.log(`Updated ${changed} files`);
