"use client";

import { useEffect, useMemo, useState } from "react";
import { addAuditLog } from "@/lib/audit";
import { getRiskScore, getSeverityFromScore, sortByRiskScore } from "@/lib/risk";
import { readAppData, seedInitialData, writeAppData } from "@/lib/storage";
import type { AppData, RiskItem, RiskMitigationStatus } from "@/lib/types";
import { Button, Card, CardHeader, FieldLabel, ProgressBar, Select, SeverityBadge, Textarea } from "@/components/ui";

const mitigationStatuses: RiskMitigationStatus[] = ["Not Started", "In Progress", "Implemented"];

export default function RiskAssessmentPage() {
  const [data, setData] = useState<AppData | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    seedInitialData();
    setData(readAppData());
  }, []);

  const risks = useMemo(() => (data ? sortByRiskScore(data.risks) : []), [data]);
  const selected = data?.risks.find((risk) => risk.id === selectedId) ?? risks[0];

  function persist(update: (risk: RiskItem) => RiskItem, action: string, details: string) {
    if (!data || !selected) return;
    const next = {
      ...data,
      risks: data.risks.map((risk) => (risk.id === selected.id ? update(risk) : risk)),
    };
    writeAppData(next);
    addAuditLog({ action, module: "Risk Assessment", importance: "Notice", details });
    setData(readAppData());
  }

  function updateStatus(status: RiskMitigationStatus) {
    if (!selected) return;
    persist(
      (risk) => ({ ...risk, status }),
      "Risk mitigation status updated",
      `${selected.id} mitigation status updated to ${status}.`,
    );
  }

  function addNote() {
    if (!selected || !note.trim()) return;
    const trimmed = note.trim();
    persist(
      (risk) => ({ ...risk, mitigationNotes: [trimmed, ...risk.mitigationNotes] }),
      "Risk mitigation note added",
      `${selected.id}: ${trimmed}`,
    );
    setNote("");
  }

  if (!data || !selected) return null;

  const highest = risks[0];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm font-medium text-slate-500">Highest Risk</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">{highest.title}</p>
          <div className="mt-3 flex items-center gap-2">
            <SeverityBadge severity={getSeverityFromScore(getRiskScore(highest))} />
            <span className="text-sm text-slate-500">Score {getRiskScore(highest)}</span>
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-medium text-slate-500">Mitigation Implemented</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">
            {data.risks.filter((risk) => risk.status === "Implemented").length}/{data.risks.length}
          </p>
          <div className="mt-4">
            <ProgressBar value={(data.risks.filter((risk) => risk.status === "Implemented").length / data.risks.length) * 100} />
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-medium text-slate-500">IAS1 Coverage</p>
          <p className="mt-2 text-lg font-semibold text-slate-950">Risk scoring, ownership, review, and audit trail</p>
          <p className="mt-2 text-sm text-slate-500">Each update records an accountable audit event.</p>
        </Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader title="Risk Register" description="Likelihood and impact are multiplied to calculate the risk score automatically." />
          <div className="overflow-x-auto p-5">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-3 pr-4">Risk</th>
                  <th className="py-3 pr-4">Category</th>
                  <th className="py-3 pr-4">L</th>
                  <th className="py-3 pr-4">I</th>
                  <th className="py-3 pr-4">Score</th>
                  <th className="py-3 pr-4">Severity</th>
                  <th className="py-3 pr-4">Owner</th>
                  <th className="py-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {risks.map((risk) => {
                  const score = getRiskScore(risk);
                  return (
                    <tr
                      key={risk.id}
                      onClick={() => setSelectedId(risk.id)}
                      className={`cursor-pointer border-b border-slate-100 transition hover:bg-slate-50 ${
                        selected.id === risk.id ? "bg-brand-50" : ""
                      }`}
                    >
                      <td className="py-4 pr-4">
                        <p className="font-medium text-slate-950">{risk.id}</p>
                        <p className="mt-1 text-slate-600">{risk.title}</p>
                      </td>
                      <td className="py-4 pr-4 text-slate-600">{risk.category}</td>
                      <td className="py-4 pr-4 text-slate-600">{risk.likelihood}</td>
                      <td className="py-4 pr-4 text-slate-600">{risk.impact}</td>
                      <td className="py-4 pr-4 font-semibold text-slate-950">{score}</td>
                      <td className="py-4 pr-4">
                        <SeverityBadge severity={getSeverityFromScore(score)} />
                      </td>
                      <td className="py-4 pr-4 text-slate-600">{risk.ownerRole}</td>
                      <td className="py-4 pr-4 text-slate-600">{risk.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="Mitigation Detail" description="Update mitigation progress and document evidence for review." />
          <div className="space-y-5 p-5">
            <div>
              <p className="text-sm font-semibold text-slate-950">
                {selected.id} · {selected.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{selected.mitigationPlan}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Info label="Category" value={selected.category} />
              <Info label="Owner" value={selected.ownerRole} />
              <Info label="Review date" value={selected.reviewDate} />
              <Info label="Risk score" value={`${getRiskScore(selected)}`} />
            </div>
            <div className="space-y-2">
              <FieldLabel>Mitigation status</FieldLabel>
              <Select value={selected.status} onChange={(event) => updateStatus(event.target.value as RiskMitigationStatus)}>
                {mitigationStatuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <FieldLabel>Mitigation note</FieldLabel>
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Record evidence, planned controls, or review notes."
              />
              <Button variant="secondary" onClick={addNote}>
                Add mitigation note
              </Button>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-950">Notes</h3>
              <div className="mt-3 space-y-2">
                {selected.mitigationNotes.length ? (
                  selected.mitigationNotes.map((item, index) => (
                    <p key={`${selected.id}-${index}`} className="rounded-md border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
                      {item}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No mitigation notes yet.</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
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
