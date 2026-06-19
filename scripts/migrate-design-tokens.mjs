#!/usr/bin/env node
/** One-off migration script — bulk replace legacy Tailwind color classes */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, "..", "src");

const replacements = [
  [/text-zinc-\d+/g, "text-[var(--brand-text-secondary)]"],
  [/placeholder:text-zinc-\d+/g, "placeholder:text-[var(--brand-text-muted)]"],
  [/text-stone-\d+/g, "text-[var(--brand-text-secondary)]"],
  [
    /border border-amber-500\/\d+ bg-amber-500\/\d+ px-3 py-2\.5 text-sm text-amber-\d+/g,
    "rounded-lg border border-[color-mix(in_srgb,var(--brand-warning)_25%,var(--brand-border))] bg-[color-mix(in_srgb,var(--brand-warning)_8%,var(--brand-surface))] px-3 py-2.5 text-sm text-[var(--foreground)]",
  ],
  [/border-white\/\[0\.0[48]\]/g, "border-[var(--brand-border)]"],
  [/border-white\/10/g, "border-[var(--brand-border)]"],
  [/bg-white\/\[0\.0[234]\]/g, "bg-[var(--brand-surface)]"],
  [/hover:bg-white\/\[0\.0[246]\]/g, "hover:bg-[var(--brand-surface-elevated)]"],
  [/bg-black\/70 backdrop-blur-sm/g, "bg-black/40 backdrop-blur-[2px]"],
  [/bg-\[#141416\]/g, "bg-[var(--brand-surface)]"],
  [/bg-\[#0f0f11\]/g, "bg-[var(--brand-surface)]"],
  [/bg-\[#121214\]/g, "bg-[var(--brand-surface)]"],
  [/bg-\[#1a1614\]/g, "bg-[var(--brand-surface)]"],
  [/shadow-2xl/g, "shadow-lg"],
  [
    /focus:border-violet-500\/\d+ focus:ring-1 focus:ring-violet-500\/\d+/g,
    "focus:border-[var(--brand-accent)] focus:ring-1 focus:ring-[color-mix(in_srgb,var(--brand-accent)_20%,transparent)]",
  ],
  [
    /focus:border-amber-500\/\d+ focus:outline-none focus:ring-1 focus:ring-amber-500\/\d+/g,
    "focus:border-[var(--brand-accent)] focus:outline-none focus:ring-1 focus:ring-[color-mix(in_srgb,var(--brand-accent)_20%,transparent)]",
  ],
  [/from-violet-600 to-indigo-600/g, "bg-[var(--brand-accent)]"],
  [/hover:from-violet-500 hover:to-indigo-500/g, "hover:bg-[var(--brand-accent-hover)]"],
  [/from-amber-600 to-orange-600/g, "bg-[var(--brand-accent)]"],
  [/bg-black\/20/g, "bg-[var(--brand-surface-elevated)]"],
  [/border-stone-500\/\d+/g, "border-[var(--brand-border)]"],
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
