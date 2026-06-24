/** CharID ammonite mark geometry — matches scripts/generate-ammonite-brand.mjs */

export const BRAND_ACCENT_HEX = "#4e7470";

type ChamberPoint = {
  inner0: [number, number];
  outer0: [number, number];
  outer1: [number, number];
  inner1: [number, number];
};

function polar(cx: number, cy: number, r: number, theta: number): [number, number] {
  return [cx + r * Math.cos(theta), cy + r * Math.sin(theta)];
}

function fmt(n: number): string {
  return Number(n.toFixed(3)).toString();
}

export function buildChamberPoints(opts: {
  cx: number;
  cy: number;
  chambers: number;
  rStar: number;
  rMax: number;
  startAngle?: number;
  sweep?: number;
}): ChamberPoint[] {
  const {
    cx,
    cy,
    chambers,
    rStar,
    rMax,
    startAngle = Math.PI * 0.72,
    sweep = Math.PI * 1.82,
  } = opts;

  const points: ChamberPoint[] = [];
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

/** Line-art ammonite: radial septa + outer spiral (no fill). */
export function ammoniteStrokePaths(
  points: ChamberPoint[],
  cx: number,
  cy: number
): string[] {
  const paths: string[] = [];

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

export const MARK_CHAMBERS = buildChamberPoints({
  cx: 32,
  cy: 32,
  chambers: 7,
  rStar: 4.2,
  rMax: 28,
});

export const MARK_STROKE_PATHS = ammoniteStrokePaths(MARK_CHAMBERS, 32, 32);

export const FAVICON_CHAMBERS = buildChamberPoints({
  cx: 16,
  cy: 16,
  chambers: 3,
  rStar: 3.8,
  rMax: 14.2,
  sweep: Math.PI * 1.62,
});

export const FAVICON_STROKE_PATHS = ammoniteStrokePaths(FAVICON_CHAMBERS, 16, 16);
