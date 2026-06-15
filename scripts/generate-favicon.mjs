#!/usr/bin/env node
/**
 * Generates public/favicon.ico from public/brand/favicon.svg
 * Run: node scripts/generate-favicon.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import toIco from "to-ico";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const svgPath = join(root, "public", "brand", "favicon.svg");
const outPath = join(root, "public", "favicon.ico");

const svg = readFileSync(svgPath);
const sizes = [16, 32, 48];

const pngBuffers = await Promise.all(
  sizes.map((size) =>
    sharp(svg, { density: 300 })
      .resize(size, size)
      .png()
      .toBuffer()
  )
);

const ico = await toIco(pngBuffers);
writeFileSync(outPath, ico);
console.log(`Wrote ${outPath}`);
