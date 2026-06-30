import fs from "node:fs";
import path from "node:path";

const htmlPath = path.join(process.cwd(), "docs/charid_editor_layout.html");
const outPath = path.join(process.cwd(), "src/styles/charid-editor-layout.css");

const html = fs.readFileSync(htmlPath, "utf8");
const match = html.match(/<style>([\s\S]*?)<\/style>/);
if (!match) throw new Error("No <style> block found");

let css = match[1].trim();

css = css.replace(
  /:root \{([\s\S]*?)\}/,
  ".charid-editor-root, .shell {$1}"
);
css = css.replace(
  /html, body \{[^}]+\}/,
  ".charid-editor-root { height: 100%; overflow: hidden; background: var(--bg-base); color: var(--text-primary); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 12px; }"
);
css = css.replace(
  /\/\* ─── SHELL GRID ─── \*\/\s*\.shell \{[\s\S]*?width: 100vw;\s*\}/,
  `/* ─── SHELL GRID ─── */
.shell {
  display: grid;
  grid-template-rows: var(--topbar-height) 1fr;
  grid-template-columns: var(--iconrail-width) var(--sidebar-width) 1fr var(--inspector-width);
  flex: 1;
  min-height: 0;
  height: 100%;
  width: 100%;
}`
);

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, css);
console.log(`Wrote ${css.length} bytes to ${outPath}`);
