"use client";

import { useEffect, useMemo, useState } from "react";
import { addAuditLog } from "@/lib/audit";
import { formatDateTime } from "@/lib/format";
import { readAppData, seedInitialData, writeAppData } from "@/lib/storage";
import type { AppData, Incident, IncidentStatus, RiskLevel } from "@/lib/types";
import { Button, Card, CardHeader, EmptyState, FieldLabel, Input, Select, SeverityBadge, StatusBadge, Textarea } from "@/components/ui";

const statuses: ("All" | IncidentStatus)[] = ["All", "New", "Investigating", "Mitigated", "Resolved"];
const severities: ("All" | RiskLevel)[] = ["All", "Low", "Medium", "High", "Critical"];
const severityOrder: RiskLevel[] = ["Low", "Medium", "High", "Critical"];

export default function IncidentsPage() {
  const [data, setData] = useState<AppData | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statuses)[number]>("All");
  const [severityFilter, setSeverityFilter] = useState<(typeof severities)[number]>("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    seedInitialData();
    setData(readAppData());
  }, []);

  const incidents = useMemo(() => {
    if (!data) return [];
    return data.incidents.filter((incident) => {
      const text = `${incident.id} ${incident.type} ${incident.description} ${incident.sourceDevice} ${incident.location}`.toLowerCase();
      const matchesQuery = text.includes(query.toLowerCase());
      const matchesStatus = statusFilter === "All" || incident.status === statusFilter;
      const matchesSeverity = severityFilter === "All" || incident.severity === severityFilter;
      return matchesQuery && matchesStatus && matchesSeverity;
    });
  }, [data, query, severityFilter, statusFilter]);

  const selected = data?.incidents.find((incident) => incident.id === selectedId) ?? incidents[0];

  function persist(update: (incident: Incident) => Incident, action: string, details: string) {
    if (!data || !selected) return;
    const next = {
      ...data,
      incidents: data.incidents.map((incident) => (incident.id === selected.id ? update(incident) : incident)),
    };
    writeAppData(next);
    addAuditLog({ action, module: "Incidents", importance: "Notice", details });
    setData(readAppData());
  }

  function changeStatus(status: IncidentStatus) {
    if (!selected) return;
    persist(
      (incident) => ({ ...incident, status, updatedAt: new Date().toISOString() }),
      "Incident status changed",
      `${selected.id} status changed to ${status}.`,
    );
  }

  function escalate() {
    if (!selected) return;
    const index = severityOrder.indexOf(selected.severity);
    const nextSeverity = severityOrder[Math.min(index + 1, severityOrder.length - 1)];
    persist(
      (incident) => ({ ...incident, severity: nextSeverity, updatedAt: new Date().toISOString() }),
      "Incident severity escalated",
      `${selected.id} severity escalated from ${selected.severity} to ${nextSeverity}.`,
    );
  }

  function addNote() {
    if (!selected || !note.trim()) return;
    const trimmed = note.trim();
    persist(
      (incident) => ({
        ...incident,
        mitigationNotes: [trimmed, ...incident.mitigationNotes],
        updatedAt: new Date().toISOString(),
      }),
      "Mitigation note added",
      `${selected.id}: ${trimmed}`,
    );
    setNote("");
  }

  if (!data) return null;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <Card>
        <CardHeader title="Incident Queue" description="Search and filter automatically created or manually updated incidents." />
        <div className="space-y-4 p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
            <Input placeholder="Search incidents, devices, or locations" value={query} onChange={(event) => setQuery(event.target.value)} />
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </Select>
            <Select value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value as typeof severityFilter)}>
              {severities.map((severity) => (
                <option key={severity}>{severity}</option>
              ))}
            </Select>
          </div>

          {incidents.length ? (
            <div className="space-y-3">
              {incidents.map((incident) => (
                <button
                  key={incident.id}
                  onClick={() => setSelectedId(incident.id)}
                  className={`w-full rounded-lg border p-4 text-left transition hover:bg-slate-50 ${
                    selected?.id === incident.id ? "border-brand-400 bg-brand-50" : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {incident.id} · {incident.type}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{incident.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <SeverityBadge severity={incident.severity} />
                      <StatusBadge status={incident.status} />
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    {incident.sourceDevice} · {incident.location} · {formatDateTime(incident.createdAt)}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState title="No incidents found" description="Try a different search term or filter selection." />
          )}
        </div>
      </Card>

      <Card>
        <CardHeader title="Incident Details" description="Update response status, escalation, and mitigation evidence." />
        {selected ? (
          <div className="space-y-5 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <SeverityBadge severity={selected.severity} />
              <StatusBadge status={selected.status} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-950">{selected.type}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{selected.description}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Info label="Incident ID" value={selected.id} />
              <Info label="Assigned role" value={selected.assignedRole} />
              <Info label="Source device" value={selected.sourceDevice} />
              <Info label="Location" value={selected.location} />
              <Info label="Created" value={formatDateTime(selected.createdAt)} />
              <Info label="Updated" value={formatDateTime(selected.updatedAt)} />
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Recommended action</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{selected.recommendedAction}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <FieldLabel>Status</FieldLabel>
                <Select value={selected.status} onChange={(event) => changeStatus(event.target.value as IncidentStatus)}>
                  {statuses.filter((status) => status !== "All").map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Button variant="secondary" onClick={escalate} disabled={selected.severity === "Critical"}>
                  Escalate severity
                </Button>
                <Button variant="primary" onClick={() => changeStatus("Resolved")} disabled={selected.status === "Resolved"}>
                  Mark as resolved
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <FieldLabel>Mitigation note</FieldLabel>
              <Textarea
                placeholder="Document the action taken, verification result, or next step."
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
              <Button variant="secondary" onClick={addNote}>
                Add mitigation note
              </Button>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-950">Mitigation history</h3>
              <div className="mt-3 space-y-2">
                {selected.mitigationNotes.length ? (
                  selected.mitigationNotes.map((item, index) => (
                    <p key={`${selected.id}-${index}`} className="rounded-md border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
                      {item}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No mitigation notes have been added yet.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState title="No incident selected" description="Select an incident from the queue to review details." />
          </div>
        )}
      </Card>
    </div>
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
