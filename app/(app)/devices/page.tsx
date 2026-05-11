"use client";

import { useEffect, useState } from "react";
import { addAuditLog } from "@/lib/audit";
import { formatDateTime } from "@/lib/format";
import { readAppData, seedInitialData, writeAppData } from "@/lib/storage";
import type { AppData, Device, DeviceStatus } from "@/lib/types";
import { Button, Card, CardHeader, EmptyState, SeverityBadge, StatusBadge } from "@/components/ui";

export default function DevicesPage() {
  const [data, setData] = useState<AppData | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    seedInitialData();
    setData(readAppData());
  }, []);

  function updateDevice(deviceId: string, status: DeviceStatus, action: string) {
    if (!data) return;
    const now = new Date().toISOString();
    const devices = data.devices.map((device) =>
      device.id === deviceId
        ? {
            ...device,
            status,
            lastChecked: now,
            riskLevel: status === "Offline" ? "High" : status === "Warning" ? "Medium" : "Low",
            latestReading: status === "Offline" ? "No signal" : status === "Warning" ? "Needs attention" : device.latestReading,
          }
        : device,
    );
    const target = data.devices.find((device) => device.id === deviceId);
    const next = { ...data, devices };
    writeAppData(next);
    addAuditLog({
      action,
      module: "Devices",
      importance: status === "Offline" ? "Warning" : "Notice",
      details: `${target?.name ?? "Device"} was set to ${status}.`,
    });
    setData(readAppData());
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Device Health"
          description="Actions are logged for accountability and update the risk state shown across the MVP."
        />
        <div className="grid gap-4 p-5 lg:grid-cols-2">
          {data.devices.length ? (
            data.devices.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                expanded={expanded === device.id}
                onExpand={() => setExpanded(expanded === device.id ? null : device.id)}
                onMarkChecked={() => updateDevice(device.id, "Online", "Device marked as checked")}
                onToggle={() => updateDevice(device.id, device.status === "Offline" ? "Online" : "Offline", "Device online state changed")}
                onWarning={() => updateDevice(device.id, "Warning", "Device set to warning")}
              />
            ))
          ) : (
            <EmptyState title="No devices yet" description="Seed the demo data to restore monitored smart home devices." />
          )}
        </div>
      </Card>
    </div>
  );
}

function DeviceCard({
  device,
  expanded,
  onExpand,
  onMarkChecked,
  onToggle,
  onWarning,
}: {
  device: Device;
  expanded: boolean;
  onExpand: () => void;
  onMarkChecked: () => void;
  onToggle: () => void;
  onWarning: () => void;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-semibold text-slate-950">{device.name}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {device.type} · {device.location}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={device.status} />
          <SeverityBadge severity={device.riskLevel} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Info label="Latest reading" value={device.latestReading} />
        <Info label="Battery / power" value={device.powerStatus} />
        <Info label="Last checked" value={formatDateTime(device.lastChecked)} />
        <Info label="Risk level" value={device.riskLevel} />
      </div>

      {expanded ? (
        <div className="mt-5 rounded-lg border border-slate-100 bg-slate-50 p-4">
          <p className="text-sm leading-6 text-slate-600">{device.description}</p>
          <p className="mt-3 text-sm text-slate-500">
            This panel represents a future device detail view where live telemetry, calibration history, and hardware diagnostics can be added.
          </p>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={onMarkChecked}>
          Mark as checked
        </Button>
        <Button variant="secondary" onClick={onToggle}>
          Toggle Online/Offline
        </Button>
        <Button variant="secondary" onClick={onWarning}>
          Set to Warning
        </Button>
        <Button variant="ghost" onClick={onExpand}>
          {expanded ? "Hide details" : "View details"}
        </Button>
      </div>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-950">{value}</p>
    </div>
  );
}
