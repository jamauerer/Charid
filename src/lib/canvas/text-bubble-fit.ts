/** Text-in-bubble fitting: wrap → grow → shrink font → overflow flag. */

export type TextBubbleFitInput = {
  content: string;
  fontSize: number;
  fontFamily: string;
  fontStyle?: string;
  padding: number;
  lineHeight: number;
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  minFontSize?: number;
};

export type TextBubbleFitResult = {
  width: number;
  height: number;
  fontSize: number;
  overflow: boolean;
};

function measureCanvas(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  return canvas.getContext("2d");
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  content: string,
  maxLineWidth: number
): string[] {
  const paragraphs = content.split("\n");
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push("");
      continue;
    }
    let current = words[0];
    for (let i = 1; i < words.length; i++) {
      const next = `${current} ${words[i]}`;
      if (ctx.measureText(next).width <= maxLineWidth) {
        current = next;
      } else {
        lines.push(current);
        current = words[i];
      }
    }
    lines.push(current);
  }
  return lines;
}

function measureBlock(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  fontSize: number,
  lineHeight: number,
  padding: number
): { width: number; height: number } {
  const linePx = fontSize * lineHeight;
  let maxLine = 0;
  for (const line of lines) {
    maxLine = Math.max(maxLine, ctx.measureText(line || " ").width);
  }
  return {
    width: maxLine + padding * 2,
    height: lines.length * linePx + padding * 2,
  };
}

export function fitTextToBubble(input: TextBubbleFitInput): TextBubbleFitResult {
  const {
    content,
    fontFamily,
    fontStyle = "normal",
    padding,
    lineHeight,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    minFontSize = 9,
  } = input;

  const ctx = measureCanvas();
  if (!ctx) {
    return {
      width: Math.min(maxWidth, Math.max(minWidth, input.fontSize * 8)),
      height: Math.min(maxHeight, Math.max(minHeight, input.fontSize * 2.5)),
      fontSize: input.fontSize,
      overflow: false,
    };
  }

  let fontSize = input.fontSize;

  for (let attempt = 0; attempt < 24; attempt++) {
    ctx.font = `${fontStyle} ${fontSize}px ${fontFamily}`;
    const innerMax = maxWidth - padding * 2;
    const lines = wrapLines(ctx, content, Math.max(40, innerMax));
    let { width, height } = measureBlock(ctx, lines, fontSize, lineHeight, padding);

    width = Math.max(minWidth, Math.min(maxWidth, width));
    height = Math.max(minHeight, Math.min(maxHeight, height));

    const innerW = width - padding * 2;
    const refitLines = wrapLines(ctx, content, Math.max(40, innerW));
    const refit = measureBlock(ctx, refitLines, fontSize, lineHeight, padding);

    if (refit.width <= width && refit.height <= height) {
      return { width, height, fontSize, overflow: false };
    }

    if (width < maxWidth || height < maxHeight) {
      width = Math.min(maxWidth, Math.max(width, refit.width));
      height = Math.min(maxHeight, Math.max(height, refit.height));
      const innerW2 = width - padding * 2;
      const lines2 = wrapLines(ctx, content, Math.max(40, innerW2));
      const refit2 = measureBlock(ctx, lines2, fontSize, lineHeight, padding);
      if (refit2.width <= width && refit2.height <= height) {
        return { width, height, fontSize, overflow: false };
      }
    }

    if (fontSize > minFontSize) {
      fontSize = Math.max(minFontSize, fontSize - 0.5);
      continue;
    }

    return {
      width: Math.min(maxWidth, Math.max(minWidth, refit.width)),
      height: Math.min(maxHeight, Math.max(minHeight, refit.height)),
      fontSize,
      overflow: true,
    };
  }

  return {
    width: minWidth,
    height: minHeight,
    fontSize: minFontSize,
    overflow: true,
  };
}

export function estimateBubbleSizeForContent(
  content: string,
  kind: "speech" | "thought" | "caption" | "narration" | "sfx" | "free",
  panelWidth: number,
  panelHeight: number
): { width: number; height: number; fontSize: number } {
  const padding = kind === "caption" || kind === "narration" ? 10 : 12;
  const fontSize = kind === "caption" ? 12 : kind === "speech" ? 13 : 14;
  const fontFamily =
    kind === "caption" || kind === "narration"
      ? "Georgia, serif"
      : "Comic Sans MS, cursive";
  const maxW = Math.min(panelWidth - 16, kind === "speech" ? 220 : 280);
  const maxH = Math.min(panelHeight - 16, kind === "caption" ? 80 : 120);
  const minW = kind === "speech" ? 72 : kind === "caption" ? 100 : 80;
  const minH = kind === "speech" ? 40 : 32;

  const fit = fitTextToBubble({
    content,
    fontSize,
    fontFamily,
    padding,
    lineHeight: 1.25,
    minWidth: minW,
    minHeight: minH,
    maxWidth: maxW,
    maxHeight: maxH,
    minFontSize: 10,
  });

  return { width: fit.width, height: fit.height, fontSize: fit.fontSize };
}
