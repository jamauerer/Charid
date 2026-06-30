import fs from "node:fs";
import path from "node:path";

const globalsPath = path.join(process.cwd(), "src/app/globals.css");
const css = fs.readFileSync(globalsPath, "utf8");

const startMarker = "/* ─── CharID Editor Spec (docs/charid_editor_layout.html) ─── */";
const start = css.indexOf(startMarker);
if (start < 0) throw new Error("Start marker not found");

const replacement = `@import "../styles/charid-editor-layout.css";

/* CharID editor root — layout integration with production routes */
.charid-editor-root {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--bg-base);
  color: var(--text-primary);
  font-size: 12px;
}

.charid-editor-root.production-comic-studio-full {
  height: 100dvh !important;
  margin: 0 !important;
  width: 100vw !important;
}

.shell {
  flex: 1;
  min-height: 0;
}

.shell-pending {
  opacity: 0.72;
  pointer-events: none;
}

.production-editor-canvas-column {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.layout-thumb.active {
  border-color: var(--teal);
}

.insp-layer-item.selected {
  background: var(--teal-dim);
}

.insp-qa-btn-danger {
  color: var(--red) !important;
}
`;

const nextSection = css.indexOf("\n", start);
// find end - file ends after bubble-library-item:hover block
const endPattern = ".bubble-library-item:hover";
const end = css.indexOf(endPattern, start);
if (end < 0) throw new Error("End pattern not found");
const endLine = css.indexOf("\n", css.indexOf("}", end));

const updated = css.slice(0, start) + replacement + css.slice(endLine + 1);
fs.writeFileSync(globalsPath, updated);
console.log("Replaced charid-editor block in globals.css");
