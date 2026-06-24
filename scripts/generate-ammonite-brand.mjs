#!/usr/bin/env node
/**
 * Generates CharID ammonite brand SVGs and deploys to public/ + app icons.
 * Run: node scripts/generate-ammonite-brand.mjs [--deploy]
 */
import { mkdirSync, writeFileSync, copyFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "assets", "brand-ammonite-draft");
const previewDir = join(outDir, "previews");
const deploy = process.argv.includes("--deploy");

/** Create button / --brand-accent (globals.css) */
const BRAND_ACCENT = "#4e7470";
const PLATE = "#111111";

mkdirSync(outDir, { recursive: true });
mkdirSync(previewDir, { recursive: true });

function polar(cx, cy, r, theta) {
  return [cx + r * Math.cos(theta), cy + r * Math.sin(theta)];
}

function buildChamberPoints(opts) {
  const {
    cx,
    cy,
    chambers,
    rStar,
    rMax,
    startAngle = Math.PI * 0.72,
    sweep = Math.PI * 1.82,
  } = opts;

  const points = [];
  for (let i = 0; i < chambers; i++) {
    const t0 = i / chambers;
    const t1 = (i + 1) / chambers;
    const theta0 = startAngle + sweep * t0;
    const theta1 = startAngle + sweep * t1;
    const rInner =
      i === 0 ? rStar * 1.05 : rStar + (rMax - rStar) * Math.pow(t0, 1.08);
    const rOuter = rStar + (rMax - rStar) * Math.pow(t1, 1.08);

    points.push({
      inner0: polar(cx, cy, rInner, theta0),
      outer0: polar(cx, cy, rOuter, theta0),
      outer1: polar(cx, cy, rOuter, theta1),
      inner1: polar(cx, cy, rInner, theta1),
    });
  }
  return points;
}

function fmt(n) {
  return Number(n.toFixed(3)).toString();
}

function ammoniteStrokePaths(points, cx, cy) {
  const paths = [];
  for (const p of points) {
    paths.push(
      `M ${fmt(cx)} ${fmt(cy)} L ${fmt(p.outer0[0])} ${fmt(p.outer0[1])}`
    );
    paths.push(
      `M ${fmt(p.outer0[0])} ${fmt(p.outer0[1])} L ${fmt(p.outer1[0])} ${fmt(p.outer1[1])}`
    );
  }
  const last = points[points.length - 1];
  if (last) {
    paths.push(
      `M ${fmt(last.inner1[0])} ${fmt(last.inner1[1])} L ${fmt(cx)} ${fmt(cy)}`
    );
  }
  return paths;
}

function strokeGroup(paths, strokeColor, strokeWidth) {
  const lines = paths
    .map((d) => `    <path d="${d}"/>`)
    .join("\n");
  return `<g aria-hidden="true" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" fill="none">\n${lines}\n  </g>`;
}

function logoMarkSvg(strokeColor = BRAND_ACCENT) {
  const points = buildChamberPoints({
    cx: 32,
    cy: 32,
    chambers: 7,
    rStar: 4.2,
    rMax: 28,
  });
  const paths = ammoniteStrokePaths(points, 32, 32);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" role="img" aria-label="CharID">
${strokeGroup(paths, strokeColor, 2.25)}
</svg>
`;
}

function faviconSvg(strokeColor = BRAND_ACCENT) {
  const points = buildChamberPoints({
    cx: 16,
    cy: 16,
    chambers: 3,
    rStar: 3.8,
    rMax: 14.2,
    sweep: Math.PI * 1.62,
  });
  const paths = ammoniteStrokePaths(points, 16, 16);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" role="img" aria-label="CharID">
${strokeGroup(paths, strokeColor, 2)}
</svg>
`;
}

function appleIconSvg() {
  const points = buildChamberPoints({
    cx: 90,
    cy: 90,
    chambers: 5,
    rStar: 11,
    rMax: 72,
  });
  const paths = ammoniteStrokePaths(points, 90, 90);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" fill="none" role="img" aria-label="CharID">
  <rect width="180" height="180" rx="40" fill="${PLATE}"/>
${strokeGroup(paths, BRAND_ACCENT, 5.5)}
</svg>
`;
}

function wordmarkPaths() {
  const y = 0;
  return `<g fill="${BRAND_ACCENT}" aria-label="CharID">
    <path d="M 18 ${y + 8} C 8 ${y + 8} 4 ${y + 18} 4 ${y + 28} C 4 ${y + 38} 8 ${y + 48} 18 ${y + 48} L 18 ${y + 42} C 12 ${y + 42} 10 ${y + 36} 10 ${y + 28} C 10 ${y + 20} 12 ${y + 14} 18 ${y + 14} Z"/>
    <path d="M 28 ${y + 8} L 28 ${y + 48} L 34 ${y + 48} L 34 ${y + 30} C 34 ${y + 24} 38 ${y + 22} 42 ${y + 22} L 42 ${y + 16} C 36 ${y + 16} 34 ${y + 20} 34 ${y + 24} L 34 ${y + 8} Z"/>
    <path d="M 58 ${y + 22} C 52 ${y + 22} 48 ${y + 26} 48 ${y + 32} L 48 ${y + 48} L 54 ${y + 48} L 54 ${y + 34} C 54 ${y + 30} 56 ${y + 28} 58 ${y + 28} C 60 ${y + 28} 62 ${y + 30} 62 ${y + 34} L 62 ${y + 48} L 68 ${y + 48} L 68 ${y + 32} C 68 ${y + 24} 64 ${y + 22} 58 ${y + 22} Z M 58 ${y + 16} C 62 ${y + 16} 66 ${y + 18} 68 ${y + 22} L 68 ${y + 16} C 66 ${y + 14} 62 ${y + 12} 58 ${y + 12} C 52 ${y + 12} 48 ${y + 16} 48 ${y + 22} L 54 ${y + 22} C 54 ${y + 18} 56 ${y + 16} 58 ${y + 16} Z"/>
    <path d="M 74 ${y + 22} L 74 ${y + 48} L 80 ${y + 48} L 80 ${y + 34} C 80 ${y + 28} 82 ${y + 26} 86 ${y + 26} L 86 ${y + 22} C 80 ${y + 22} 78 ${y + 24} 76 ${y + 28} L 76 ${y + 22} Z"/>
    <path d="M 94 ${y + 8} L 94 ${y + 48} L 100 ${y + 48} L 100 ${y + 8} Z"/>
    <path d="M 108 ${y + 8} C 98 ${y + 8} 92 ${y + 16} 92 ${y + 28} C 92 ${y + 40} 98 ${y + 48} 108 ${y + 48} L 118 ${y + 48} L 118 ${y + 8} Z M 108 ${y + 14} L 112 ${y + 14} L 112 ${y + 42} L 108 ${y + 42} C 102 ${y + 42} 98 ${y + 36} 98 ${y + 28} C 98 ${y + 20} 102 ${y + 14} 108 ${y + 14} Z"/>
  </g>`;
}

function logoSvg() {
  const markScale = 1.55;
  const cx = 64;
  const cy = 52;
  const points = buildChamberPoints({
    cx,
    cy,
    chambers: 7,
    rStar: 4.2 * markScale,
    rMax: 28 * markScale,
  });
  const paths = ammoniteStrokePaths(points, cx, cy);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 168" fill="none" role="img" aria-label="CharID">
  <g transform="translate(0 0)">
${strokeGroup(paths, BRAND_ACCENT, 3.5).replace(/^/gm, "    ").trim()}
  </g>
  <g transform="translate(4 118) scale(0.82)">
    ${wordmarkPaths()}
  </g>
</svg>
`;
}

const files = {
  "logo-mark.svg": logoMarkSvg(),
  "logo.svg": logoSvg(),
  "favicon.svg": faviconSvg(),
  "apple-icon.svg": appleIconSvg(),
};

for (const [name, content] of Object.entries(files)) {
  writeFileSync(join(outDir, name), content, "utf8");
  console.log(`Wrote ${join(outDir, name)}`);
}

if (deploy) {
  const publicBrand = join(root, "public", "brand");
  mkdirSync(publicBrand, { recursive: true });
  for (const name of ["logo-mark.svg", "logo.svg", "favicon.svg"]) {
    writeFileSync(join(publicBrand, name), files[name], "utf8");
    console.log(`Deployed public/brand/${name}`);
  }
  writeFileSync(join(publicBrand, "logo.svg"), files["logo-mark.svg"], "utf8");
  console.log("Deployed public/brand/logo.svg (mark alias)");
  writeFileSync(join(root, "src", "app", "icon.svg"), files["favicon.svg"], "utf8");
  writeFileSync(join(root, "src", "app", "apple-icon.svg"), files["apple-icon.svg"], "utf8");
  console.log("Deployed src/app/icon.svg and apple-icon.svg");
}

async function renderPreviews() {
  const previews = [
    { file: "logo-mark.svg", sizes: [32, 64, 512], bg: ["#FAF8F5", "#111111"] },
    { file: "favicon.svg", sizes: [16, 32, 64], bg: ["#FAF8F5", "#111111"] },
    { file: "apple-icon.svg", sizes: [180, 512], bg: null },
  ];

  for (const { file, sizes, bg } of previews) {
    const svgBuffer = Buffer.from(files[file]);

    for (const size of sizes) {
      if (bg) {
        for (const background of bg) {
          const label = background === "#111111" ? "dark" : "light";
          const out = join(
            previewDir,
            `${file.replace(".svg", "")}-${size}-${label}.png`
          );
          const composite = await sharp({
            create: {
              width: size,
              height: size,
              channels: 4,
              background,
            },
          })
            .composite([
              {
                input: await sharp(svgBuffer).resize(size, size).png().toBuffer(),
                gravity: "center",
              },
            ])
            .png()
            .toBuffer();
          writeFileSync(out, composite);
          console.log(`Wrote ${out}`);
        }
      } else {
        const out = join(previewDir, `${file.replace(".svg", "")}-${size}.png`);
        await sharp(svgBuffer).resize(size, size).png().toFile(out);
        console.log(`Wrote ${out}`);
      }
    }
  }
}

await renderPreviews();
console.log(deploy ? "Deployed production brand assets." : "Draft only — pass --deploy to update public/brand.");
console.log("Done.");
