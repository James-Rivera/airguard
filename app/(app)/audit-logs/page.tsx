"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardHeader, EmptyState, Select, StatusBadge } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { readAppData, seedInitialData } from "@/lib/storage";
import type { AppData } from "@/lib/types";

export default function AuditLogsPage() {
  const [data, setData] = useState<AppData | null>(null);
  const [moduleFilter, setModuleFilter] = useState("All");
  const [actionFilter, setActionFilter] = useState("All");

  useEffect(() => {
    seedInitialData();
    setData(readAppData());
  }, []);

  const modules = useMemo(() => ["All", ...Array.from(new Set((data?.auditLogs ?? []).map((log) => log.module)))], [data]);
  const actionTypes = useMemo(() => ["All", ...Array.from(new Set((data?.auditLogs ?? []).map((log) => log.action)))], [data]);

  const logs = useMemo(() => {
    if (!data) return [];
    return data.auditLogs
      .filter((log) => moduleFilter === "All" || log.module === moduleFilter)
      .filter((log) => actionFilter === "All" || log.action === actionFilter)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [actionFilter, data, moduleFilter]);

  if (!data) return null;

  return (
    <Card>
      <CardHeader title="Traceability Log" description="Newest actions appear first. Filter by module or action type for defense walkthroughs." />
      <div className="space-y-4 p-5">
        <div className="grid gap-3 md:grid-cols-2">
          <Select value={moduleFilter} onChange={(event) => setModuleFilter(event.target.value)}>
            {modules.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </Select>
          <Select value={actionFilter} onChange={(event) => setActionFilter(event.target.value)}>
            {actionTypes.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </Select>
        </div>

        {logs.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-3 pr-4">Timestamp</th>
                  <th className="py-3 pr-4">Actor role</th>
                  <th className="py-3 pr-4">Action</th>
                  <th className="py-3 pr-4">Module</th>
                  <th className="py-3 pr-4">Importance</th>
                  <th className="py-3 pr-4">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100">
                    <td className="py-4 pr-4 text-slate-600">{formatDateTime(log.timestamp)}</td>
                    <td className="py-4 pr-4 font-medium text-slate-950">{log.actorRole}</td>
                    <td className="py-4 pr-4 text-slate-700">{log.action}</td>
                    <td className="py-4 pr-4 text-slate-600">{log.module}</td>
                    <td className="py-4 pr-4">
                      <StatusBadge status={log.importance} />
                    </td>
                    <td className="py-4 pr-4 text-slate-600">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No logs match the filters" description="Clear one of the filters to show more audit events." />
        )}
      </div>
    </Card>
  );
}
