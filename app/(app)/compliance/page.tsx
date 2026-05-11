"use client";

import { useEffect, useMemo, useState } from "react";
import { addAuditLog } from "@/lib/audit";
import { percent } from "@/lib/format";
import { readAppData, seedInitialData, writeAppData } from "@/lib/storage";
import type { AppData, ComplianceItem } from "@/lib/types";
import { Card, CardHeader, ProgressBar } from "@/components/ui";

const categories: ComplianceItem["category"][] = [
  "Data Privacy and Access Control",
  "Incident Response",
  "Risk Management",
  "Cybersecurity Governance",
];

export default function CompliancePage() {
  const [data, setData] = useState<AppData | null>(null);

  useEffect(() => {
    seedInitialData();
    setData(readAppData());
  }, []);

  const readiness = useMemo(() => {
    if (!data) return 0;
    return percent(data.complianceItems.filter((item) => item.checked).length, data.complianceItems.length);
  }, [data]);

  function toggle(item: ComplianceItem) {
    if (!data) return;
    const nextChecked = !item.checked;
    const next = {
      ...data,
      complianceItems: data.complianceItems.map((entry) => (entry.id === item.id ? { ...entry, checked: nextChecked } : entry)),
    };
    writeAppData(next);
    addAuditLog({
      action: "Compliance item checked",
      module: "Compliance",
      importance: "Notice",
      details: `${item.label} was marked ${nextChecked ? "ready" : "not ready"}.`,
    });
    setData(readAppData());
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-brand-700">Security and privacy readiness</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">{readiness}% ready</h2>
            <p className="mt-2 text-sm text-slate-500">
              Checklist progress is saved locally and reflected in the management report.
            </p>
          </div>
          <div className="w-full md:w-80">
            <ProgressBar value={readiness} />
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        {categories.map((category) => {
          const items = data.complianceItems.filter((item) => item.category === category);
          const categoryProgress = percent(items.filter((item) => item.checked).length, items.length);
          return (
            <Card key={category}>
              <CardHeader title={category} description={`${categoryProgress}% complete`} />
              <div className="space-y-4 p-5">
                <ProgressBar value={categoryProgress} />
                <div className="space-y-2">
                  {items.map((item) => (
                    <label
                      key={item.id}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 transition hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => toggle(item)}
                        className="mt-1 h-4 w-4 rounded border-slate-300"
                      />
                      <span>
                        <span className="block text-sm font-medium text-slate-950">{item.label}</span>
                        <span className="mt-1 block text-xs text-slate-500">
                          {item.checked ? "Ready for prototype review" : "Needs follow-up before production readiness"}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
