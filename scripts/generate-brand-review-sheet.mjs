#!/usr/bin/env node
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "assets", "brand-ammonite-draft", "previews");

const layout = [
  {
    title: "1. Logo mark (64px native, 2× display)",
    items: [
      { file: "logo-mark-64-light.png", scale: 2, caption: "light" },
      { file: "logo-mark-64-dark.png", scale: 2, caption: "dark" },
    ],
  },
  {
    title: "2. Logo lockup (256px wide)",
    items: [
      { file: "logo-lockup-256-light.png", scale: 1, caption: "light" },
      { file: "logo-lockup-256-dark.png", scale: 1, caption: "dark" },
    ],
  },
  {
    title: "3. Favicon (native px, nearest-neighbor upscale)",
    items: [
      { file: "favicon-16-light.png", scale: 8, caption: "16px" },
      { file: "favicon-32-light.png", scale: 4, caption: "32px" },
      { file: "favicon-64-light.png", scale: 2, caption: "64px" },
    ],
  },
  {
    title: "4. Apple icon (180px)",
    items: [{ file: "apple-icon-180.png", scale: 1, caption: "180px" }],
  },
];

async function loadScaled(file, scale) {
  const buf = readFileSync(join(root, file));
  const meta = await sharp(buf).metadata();
  return sharp(buf)
    .resize(meta.width * scale, meta.height * scale, {
      kernel: scale >= 4 ? sharp.kernel.nearest : sharp.kernel.lanczos3,
    })
    .png()
    .toBuffer();
}

const colW = 300;
const rowTitleH = 32;
const captionH = 24;
const pad = 24;
const maxCols = Math.max(...layout.map((r) => r.items.length));
const rowBodyH = 340;
const W = maxCols * colW + pad * 2;
const H = layout.length * (rowTitleH + rowBodyH + captionH) + pad * 2;

const composites = [];
let y = pad;

for (const row of layout) {
  y += rowTitleH;
  for (let i = 0; i < row.items.length; i++) {
    const item = row.items[i];
    const img = await loadScaled(item.file, item.scale);
    const meta = await sharp(img).metadata();
    const x = pad + i * colW + Math.floor((colW - meta.width) / 2);
    const top = y + Math.floor((rowBodyH - meta.height) / 2);
    composites.push({ input: img, left: x, top });
  }
  y += rowBodyH + captionH;
}

await sharp({
  create: { width: W, height: H, channels: 4, background: "#52525b" },
})
  .composite(composites)
  .png()
  .toFile(join(root, "FOUNDER-REVIEW-SHEET.png"));

console.log(`Wrote ${join(root, "FOUNDER-REVIEW-SHEET.png")} (${W}x${H})`);
