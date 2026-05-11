"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, Card, CardHeader, ProgressBar, SeverityBadge, StatusBadge } from "@/components/ui";
import { formatDateTime, percent } from "@/lib/format";
import { getRiskScore, getSeverityFromScore, sortByRiskScore } from "@/lib/risk";
import { readAppData, seedInitialData } from "@/lib/storage";
import type { AppData, RiskLevel } from "@/lib/types";

export default function ReportsPage() {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    seedInitialData();
    setData(readAppData());
  }, []);

  const report = useMemo(() => {
    if (!data) return null;
    const active = data.incidents.filter((incident) => incident.status !== "Resolved");
    const resolved = data.incidents.filter((incident) => incident.status === "Resolved");
    const severityCounts = countBy(data.incidents.map((incident) => incident.severity));
    const incidentTypes = countBy(data.incidents.map((incident) => incident.type));
    const highestRisk = sortByRiskScore(data.risks)[0];
    const compliance = percent(data.complianceItems.filter((item) => item.checked).length, data.complianceItems.length);
    const recentMitigations = data.incidents
      .flatMap((incident) => incident.mitigationNotes.map((note) => ({ id: incident.id, note, type: incident.type })))
      .slice(0, 5);

    return {
      active,
      resolved,
      severityCounts,
      highestRisk,
      compliance,
      mostCommonType: mostCommon(incidentTypes),
      recentMitigations,
      recentLogs: data.auditLogs.slice(0, 6),
    };
  }, [data]);

  if (!data || !report) return null;

  return (
    <div className="space-y-6">
      <div className="no-print flex justify-end">
        <Button onClick={() => window.print()}>Print Report</Button>
      </div>

      <Card className="print-surface overflow-hidden">
        <div className="border-b border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-brand-700">AirGuard Management Report</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">Indoor Air Quality and Risk Summary</h2>
              <p className="mt-2 text-sm text-slate-500">Generated {formatDateTime(new Date())}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-500">Compliance readiness</p>
              <p className="mt-1 text-2xl font-semibold text-slate-950">{report.compliance}%</p>
            </div>
          </div>
          <p className="mt-6 max-w-4xl text-sm leading-6 text-slate-600">
            Executive summary: AirGuard is monitoring {data.devices.length} simulated smart home devices with {report.active.length} active incident(s).
            The highest current risk is "{report.highestRisk.title}" with a score of {getRiskScore(report.highestRisk)}. Compliance readiness is
            {` ${report.compliance}%`} based on the prototype checklist.
          </p>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-4">
          <Summary label="Total incidents" value={data.incidents.length} />
          <Summary label="Active incidents" value={report.active.length} />
          <Summary label="Resolved incidents" value={report.resolved.length} />
          <Summary label="Devices online" value={`${data.devices.filter((device) => device.status === "Online").length}/${data.devices.length}`} />
        </div>

        <div className="grid gap-6 border-t border-slate-100 p-6 xl:grid-cols-2">
          <section>
            <h3 className="font-semibold text-slate-950">Incidents by Severity</h3>
            <div className="mt-4 space-y-3">
              {(["Low", "Medium", "High", "Critical"] as RiskLevel[]).map((severity) => (
                <div key={severity} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                  <SeverityBadge severity={severity} />
                  <span className="text-sm font-semibold text-slate-950">{report.severityCounts[severity] ?? 0}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-slate-950">Risk and Compliance</h3>
            <div className="mt-4 rounded-lg border border-slate-100 p-4">
              <p className="text-sm font-medium text-slate-950">{report.highestRisk.title}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <SeverityBadge severity={getSeverityFromScore(getRiskScore(report.highestRisk))} />
                <span className="text-sm text-slate-500">Score {getRiskScore(report.highestRisk)}</span>
                <StatusBadge status={report.highestRisk.status} />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{report.highestRisk.mitigationPlan}</p>
            </div>
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-500">Compliance readiness</span>
                <span className="font-medium text-slate-950">{report.compliance}%</span>
              </div>
              <ProgressBar value={report.compliance} />
            </div>
          </section>
        </div>

        <div className="grid gap-6 border-t border-slate-100 p-6 xl:grid-cols-2">
          <section>
            <h3 className="font-semibold text-slate-950">Operational Findings</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>Most common incident type: <span className="font-medium text-slate-950">{report.mostCommonType || "None"}</span></p>
              <p>Recent mitigation actions are included below for response traceability.</p>
            </div>
            <div className="mt-4 space-y-2">
              {report.recentMitigations.length ? (
                report.recentMitigations.map((item, index) => (
                  <p key={`${item.id}-${index}`} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
                    {item.id} · {item.note}
                  </p>
                ))
              ) : (
                <p className="text-sm text-slate-500">No mitigation actions have been documented yet.</p>
              )}
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-slate-950">Recent Audit Events</h3>
            <div className="mt-4 space-y-2">
              {report.recentLogs.map((log) => (
                <div key={log.id} className="rounded-lg border border-slate-100 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={log.importance} />
                    <p className="text-sm font-medium text-slate-950">{log.action}</p>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{formatDateTime(log.timestamp)} · {log.actorRole} · {log.module}</p>
                  <p className="mt-2 text-sm text-slate-600">{log.details}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </Card>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function countBy(items: string[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item] = (acc[item] ?? 0) + 1;
    return acc;
  }, {});
}

function mostCommon(counts: Record<string, number>) {
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
}
