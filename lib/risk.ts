import type { RiskLevel, RiskItem } from "./types";

export function getRiskScore(risk: Pick<RiskItem, "likelihood" | "impact">) {
  return risk.likelihood * risk.impact;
}

export function getSeverityFromScore(score: number): RiskLevel {
  if (score >= 20) return "Critical";
  if (score >= 12) return "High";
  if (score >= 6) return "Medium";
  return "Low";
}

export function sortByRiskScore(risks: RiskItem[]) {
  return [...risks].sort((a, b) => getRiskScore(b) - getRiskScore(a));
}
