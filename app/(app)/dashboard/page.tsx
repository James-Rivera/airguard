"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, MetricCard, ProgressBar, SeverityBadge, StatusBadge, Button } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { runSimulation } from "@/lib/incident-engine";
import { readAppData, seedInitialData } from "@/lib/storage";
import type { AppData, RiskLevel, SimulationType } from "@/lib/types";
import { getRiskScore, getSeverityFromScore } from "@/lib/risk";

const simulations: SimulationType[] = [
  "Normal Reading",
  "High CO2",
  "Smoke Detected",
  "Poor Ventilation",
  "Sensor Offline",
  "High Humidity",
];

export default function DashboardPage() {
  const [data, setData] = useState<AppData | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    seedInitialData();
    setData(readAppData());
  }, []);

  const metrics = useMemo(() => {
    if (!data) return null;
    const latest = data.readings[0];
    const activeIncidents = data.incidents.filter((incident) => incident.status !== "Resolved");
    const countsBySeverity = countBySeverity(data.incidents);
    const openCount = data.incidents.filter((incident) => incident.status !== "Resolved").length;
    const resolvedCount = data.incidents.filter((incident) => incident.status === "Resolved").length;
    const criticalRisks = data.risks.filter((risk) => getSeverityFromScore(getRiskScore(risk)) === "Critical").length;
    const readiness = Math.round((data.complianceItems.filter((item) => item.checked).length / data.complianceItems.length) * 100);

    return {
      latest,
      activeIncidents,
      countsBySeverity,
      openCount,
      resolvedCount,
      criticalRisks,
      readiness,
      onlineDevices: data.devices.filter((device) => device.status === "Online").length,
    };
  }, [data]);

  function simulate(type: SimulationType) {
    const result = runSimulation(type);
    setData(result.data);
    setNotice(result.message);
    window.setTimeout(() => setNotice(""), 5500);
  }

  if (!data || !metrics) return null;

  return (
    <div className="space-y-6">
      {notice ? (
        <div className="rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-700">
          {notice}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Overall Air Quality Status"
          value={metrics.latest.airQualityStatus}
          detail="Based on latest simulated reading"
          badge={<StatusBadge status={metrics.latest.airQualityStatus} />}
        />
        <MetricCard label="CO2 Level" value={`${metrics.latest.co2Ppm} ppm`} detail={co2Detail(metrics.latest.co2Ppm)} />
        <MetricCard label="Temperature" value={`${metrics.latest.temperatureC.toFixed(1)} C`} detail="Indoor ambient reading" />
        <MetricCard label="Humidity" value={`${metrics.latest.humidityPercent}%`} detail="Mold risk rises above 70%" />
        <MetricCard label="Active Incidents" value={metrics.activeIncidents.length} detail="New, investigating, or mitigated" />
        <MetricCard label="Critical Risks" value={metrics.criticalRisks} detail="From risk register score" />
        <MetricCard label="Devices Online" value={`${metrics.onlineDevices}/${data.devices.length}`} detail="Current device health" />
        <MetricCard label="Compliance Readiness" value={`${metrics.readiness}%`} detail="Checklist completion" />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader
            title="Current Environment"
            description="Latest simulated readings from smart home air quality devices."
          />
          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            <Reading label="CO2" value={`${metrics.latest.co2Ppm} ppm`} />
            <Reading label="Smoke/Gas" value={metrics.latest.smokeGasStatus} />
            <Reading label="PM2.5" value={`${metrics.latest.pm25} ug/m3`} />
            <Reading label="Temperature" value={`${metrics.latest.temperatureC.toFixed(1)} C`} />
            <Reading label="Humidity" value={`${metrics.latest.humidityPercent}%`} />
            <Reading label="Ventilation" value={metrics.latest.ventilationStatus} />
            <div className="sm:col-span-2 lg:col-span-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Last updated</p>
              <p className="mt-1 text-sm font-medium text-slate-950">{formatDateTime(metrics.latest.createdAt)}</p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Risk Summary" description="Incident severity distribution and closure state." />
          <div className="space-y-5 p-5">
            {(["Low", "Medium", "High", "Critical"] as RiskLevel[]).map((severity) => (
              <div key={severity} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={severity} />
                  <span className="text-sm text-slate-500">incidents</span>
                </div>
                <span className="text-sm font-semibold text-slate-950">{metrics.countsBySeverity[severity] ?? 0}</span>
              </div>
            ))}
            <div className="border-t border-slate-100 pt-5">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-500">Open vs resolved</span>
                <span className="font-medium text-slate-950">
                  {metrics.openCount} open / {metrics.resolvedCount} resolved
                </span>
              </div>
              <ProgressBar value={(metrics.resolvedCount / Math.max(1, data.incidents.length)) * 100} />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Simulation Panel"
          description="Trigger realistic sensor events. Risky events create incidents and audit logs automatically."
        />
        <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3">
          {simulations.map((item) => (
            <Button
              key={item}
              variant={item === "Smoke Detected" ? "danger" : item === "Normal Reading" ? "secondary" : "primary"}
              onClick={() => simulate(item)}
            >
              Simulate {item}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Reading({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function countBySeverity(items: { severity: RiskLevel }[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item.severity] = (acc[item.severity] ?? 0) + 1;
    return acc;
  }, {});
}

function co2Detail(value: number) {
  if (value >= 1500) return "Ventilation action recommended";
  if (value >= 1000) return "Moderate ventilation concern";
  return "Within expected indoor range";
}
