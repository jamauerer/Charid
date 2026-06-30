/**
 * Vector paths for the two canonical comic bubbles.
 * Classic rounded speech oval + tail, and scalloped thought cloud + three dots.
 */

export type TailTip = { x: number; y: number };

export const DEFAULT_SPEECH_TAIL_TIP: TailTip = { x: 0.18, y: 1.28 };
export const DEFAULT_THOUGHT_DOT_TIP: TailTip = { x: 0.22, y: 1.32 };

export function speechBubbleBodyPath(width: number, height: number): string {
  const pad = 2;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const x = pad;
  const y = pad;
  const rx = w / 2;
  const ry = h / 2;
  const cx = x + rx;
  const cy = y + ry;
  return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
}

export function speechBubbleTailPath(width: number, height: number, tip: TailTip): string {
  const tipX = tip.x * width;
  const tipY = tip.y * height;
  const baseLeftX = width * 0.22;
  const baseRightX = width * 0.42;
  const baseY = height * 0.88;
  return `M ${baseLeftX} ${baseY} Q ${(baseLeftX + tipX) / 2} ${tipY} ${tipX} ${tipY} Q ${(baseRightX + tipX) / 2} ${(baseY + tipY) / 2} ${baseRightX} ${baseY} Z`;
}

export function thoughtCloudBodyPath(width: number, height: number): string {
  const w = width;
  const h = height * 0.88;
  const bumps = 8;
  let d = "";
  for (let i = 0; i <= bumps; i++) {
    const t = i / bumps;
    const angle = Math.PI + t * Math.PI;
    const bump = i % 2 === 0 ? 1 : 0.88;
    const cx = w / 2 + Math.cos(angle) * (w / 2 - 4) * bump;
    const cy = h / 2 + Math.sin(angle) * (h / 2 - 4) * bump;
    d += i === 0 ? `M ${cx} ${cy}` : ` L ${cx} ${cy}`;
  }
  return `${d} Z`;
}

export type ThoughtDotLayout = { x: number; y: number; r: number };

export function thoughtDotsLayout(width: number, height: number, tip: TailTip): ThoughtDotLayout[] {
  const anchorX = width * 0.28;
  const anchorY = height * 0.82;
  const tipX = tip.x * width;
  const tipY = tip.y * height;
  return [
    { x: anchorX + (tipX - anchorX) * 0.45, y: anchorY + (tipY - anchorY) * 0.45, r: 7 },
    { x: anchorX + (tipX - anchorX) * 0.72, y: anchorY + (tipY - anchorY) * 0.72, r: 5 },
    { x: tipX, y: tipY, r: 3.5 },
  ];
}
