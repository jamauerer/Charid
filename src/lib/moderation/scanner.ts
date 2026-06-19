import type { ContentScanResult, RiskCategory } from "@/types/moderation";

export type ImageScanInput = {
  storageBucket: string;
  storagePath: string;
  mimeType?: string;
  signedUrl?: string | null;
};

export type TextScanInput = {
  fields: Record<string, string | null | undefined>;
};

export type ContentScanner = {
  name: string;
  scanImage(input: ImageScanInput): Promise<ContentScanResult>;
  scanText(input: TextScanInput): Promise<ContentScanResult>;
};

const FLAG_THRESHOLD = 0.65;

function buildResult(
  scanner: string,
  outcome: ContentScanResult["outcome"],
  riskScore: number,
  riskCategories: RiskCategory[],
  details?: Record<string, unknown>
): ContentScanResult {
  return {
    outcome,
    riskScore,
    riskCategories,
    scanner,
    scannedAt: new Date().toISOString(),
    details,
  };
}

/**
 * Default V1 scanner — advisory only, never blocks uploads.
 * Replace with a production provider (e.g. OpenAI Moderation, AWS Rekognition)
 * by setting MODERATION_SCANNER=custom and implementing getContentScanner().
 */
class StubContentScanner implements ContentScanner {
  name = "stub";

  async scanImage(_input: ImageScanInput): Promise<ContentScanResult> {
    return buildResult(this.name, "safe", 0, []);
  }

  async scanText(_input: TextScanInput): Promise<ContentScanResult> {
    return buildResult(this.name, "safe", 0, []);
  }
}

/**
 * Optional keyword heuristic for local/dev testing when MODERATION_SCANNER=heuristic.
 * Not a production safety system — demonstrates flag → queue flow only.
 */
class HeuristicContentScanner implements ContentScanner {
  name = "heuristic";

  async scanImage(_input: ImageScanInput): Promise<ContentScanResult> {
    return buildResult(this.name, "safe", 0, []);
  }

  async scanText(input: TextScanInput): Promise<ContentScanResult> {
    const combined = Object.values(input.fields)
      .filter(Boolean)
      .join("\n")
      .toLowerCase();

    const categories: RiskCategory[] = [];
    let riskScore = 0;

    if (combined.includes("__moderation_flag_test__")) {
      categories.push("platform_policy");
      riskScore = 0.92;
    }

    const outcome =
      riskScore >= FLAG_THRESHOLD && categories.length > 0 ? "flagged" : "safe";

    return buildResult(this.name, outcome, riskScore, categories, {
      fieldCount: Object.keys(input.fields).length,
    });
  }
}

let cachedScanner: ContentScanner | null = null;

export function getContentScanner(): ContentScanner {
  if (cachedScanner) return cachedScanner;

  const provider = process.env.MODERATION_SCANNER ?? "stub";
  cachedScanner =
    provider === "heuristic"
      ? new HeuristicContentScanner()
      : new StubContentScanner();

  return cachedScanner;
}

export function isFlagged(result: ContentScanResult): boolean {
  return result.outcome === "flagged" || result.riskScore >= FLAG_THRESHOLD;
}

export function previewText(
  fields: Record<string, string | null | undefined>,
  maxLength = 280
): string {
  const combined = Object.entries(fields)
    .filter(([, value]) => value?.trim())
    .map(([key, value]) => `${key}: ${value?.trim()}`)
    .join("\n");

  if (combined.length <= maxLength) return combined;
  return `${combined.slice(0, maxLength - 1)}…`;
}
