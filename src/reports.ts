import type { Alert, AppData, ReportSummary, SafetyStatus } from "./types";

export function getActiveAlerts(data: AppData): Alert[] {
  return data.alerts.filter((alert) => alert.status !== "Resolved");
}

export function getUrgentAlert(data: AppData): Alert | undefined {
  const active = getActiveAlerts(data);
  return active.find((alert) => alert.riskLevel === "Critical") ?? active[0];
}

export function getReadiness(data: AppData) {
  if (!data.checklistItems.length) return 0;
  return Math.round((data.checklistItems.filter((item) => item.checked).length / data.checklistItems.length) * 100);
}

export function deriveReport(data: AppData): ReportSummary {
  const activeAlerts = getActiveAlerts(data);
  const resolvedAlerts = data.alerts.filter((alert) => alert.status === "Resolved");
  const highest = getHighestRisk(data);
  return {
    totalAlerts: data.alerts.length,
    activeAlerts: activeAlerts.length,
    resolvedAlerts: resolvedAlerts.length,
    highestRisk: highest.level,
    highestRiskLabel: highest.label,
    readiness: getReadiness(data),
    recentActions: data.activityItems.slice(0, 4),
    generatedAt: data.reportGeneratedAt,
  };
}

export function getHighestRisk(data: AppData): { level: SafetyStatus; label: string } {
  const rankedAlerts = [...getActiveAlerts(data)].sort((a, b) => riskRank(b.riskLevel) - riskRank(a.riskLevel));
  if (rankedAlerts[0]) {
    return { level: rankedAlerts[0].riskLevel, label: rankedAlerts[0].location };
  }

  const rankedRisks = [...data.risks].sort((a, b) => b.score - a.score);
  if (rankedRisks[0]) {
    return { level: rankedRisks[0].riskLevel, label: rankedRisks[0].title };
  }

  return { level: "Good", label: "No active alerts" };
}

export function riskRank(level: string) {
  if (level === "Critical") return 5;
  if (level === "Warning") return 4;
  if (level === "Moderate") return 3;
  if (level === "Offline") return 2;
  return 1;
}
