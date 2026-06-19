import {
  RISK_CATEGORY_LABELS,
  formatRiskScore,
  type RiskCategory,
} from "@/types/moderation";

export function labelRiskCategories(categories: string[]): string {
  return categories
    .map((category) =>
      category in RISK_CATEGORY_LABELS
        ? RISK_CATEGORY_LABELS[category as RiskCategory]
        : category.replace(/_/g, " ")
    )
    .join(", ");
}

export { formatRiskScore };
