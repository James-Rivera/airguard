"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { addAuditLog } from "@/lib/audit";
import { ROLE_KEY, resetData, seedInitialData } from "@/lib/storage";
import type { UserRole } from "@/lib/types";
import { Button, StatusBadge } from "./ui";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/devices", label: "Devices" },
  { href: "/incidents", label: "Incidents" },
  { href: "/risk-assessment", label: "Risk Assessment" },
  { href: "/audit-logs", label: "Audit Logs" },
  { href: "/compliance", label: "Compliance" },
  { href: "/reports", label: "Reports" },
];

const pageCopy: Record<string, { title: string; description: string }> = {
  "/dashboard": {
    title: "Operational Dashboard",
    description: "Monitor current air quality, risk posture, and simulated smart home events.",
  },
  "/devices": {
    title: "Monitored Devices",
    description: "Track smart home sensors, ventilation devices, power state, and device risk.",
  },
  "/incidents": {
    title: "Incident Management",
    description: "Investigate air quality incidents, document mitigation, and resolve issues.",
  },
  "/risk-assessment": {
    title: "Risk Assessment",
    description: "Maintain the IAS1 risk register with likelihood, impact, owners, and mitigation status.",
  },
  "/audit-logs": {
    title: "Audit Logs",
    description: "Review traceable actions across monitoring, response, risk, and compliance workflows.",
  },
  "/compliance": {
    title: "Compliance Readiness",
    description: "Track security, privacy, incident response, and governance checklist items.",
  },
  "/reports": {
    title: "Management Report",
    description: "Generate a print-friendly summary for presentation and review.",
  },
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const copy = pageCopy[pathname] ?? pageCopy["/dashboard"];

  useEffect(() => {
    seedInitialData();
    const storedRole = window.localStorage.getItem(ROLE_KEY) as UserRole | null;
    if (!storedRole) {
      router.replace("/login");
      return;
    }
    setRole(storedRole);
  }, [router]);

  const activeClass = useMemo(
    () => "bg-brand-50 text-brand-700 ring-1 ring-brand-100",
    [],
  );

  function logout() {
    addAuditLog({
      actorRole: role ?? "Administrator",
      action: "Logged out",
      module: "Auth",
      importance: "Info",
      details: `${role ?? "User"} ended the prototype session.`,
    });
    window.localStorage.removeItem(ROLE_KEY);
    router.replace("/login");
  }

  function resetDemo() {
    resetData();
    addAuditLog({
      actorRole: role ?? "Administrator",
      action: "Demo data reset",
      module: "System",
      importance: "Notice",
      details: "Demo dataset was reset to the initial AirGuard state.",
    });
    window.location.reload();
  }

  if (!role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Loading AirGuard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="no-print fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white px-4 py-5 lg:block">
        <Link href="/dashboard" className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
            AG
          </div>
          <div>
            <p className="font-semibold text-slate-950">AirGuard</p>
            <p className="text-xs text-slate-500">Smart air risk response</p>
          </div>
        </Link>
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition hover:bg-slate-100 ${
                pathname === item.href ? activeClass : "text-slate-600"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-5 left-4 right-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Prototype role</p>
          <p className="mt-1 text-sm font-semibold text-slate-950">{role}</p>
          <Button variant="secondary" className="mt-3 w-full" onClick={resetDemo}>
            Reset demo data
          </Button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="no-print sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-20 flex-col gap-4 px-4 py-4 sm:px-6 xl:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 lg:hidden">
                <Button variant="secondary" onClick={() => setMobileOpen((open) => !open)}>
                  Menu
                </Button>
                <p className="font-semibold text-slate-950">AirGuard</p>
              </div>
              <div className="hidden lg:block">
                <h1 className="text-2xl font-semibold text-slate-950">{copy.title}</h1>
                <p className="mt-1 text-sm text-slate-500">{copy.description}</p>
              </div>
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <StatusBadge status="Online" />
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{role}</span>
                <Button variant="secondary" onClick={logout}>
                  Logout
                </Button>
              </div>
            </div>
            <div className="lg:hidden">
              <h1 className="text-xl font-semibold text-slate-950">{copy.title}</h1>
              <p className="mt-1 text-sm text-slate-500">{copy.description}</p>
            </div>
            {mobileOpen ? (
              <nav className="grid gap-1 sm:grid-cols-2 lg:hidden">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                      pathname === item.href ? activeClass : "bg-slate-50 text-slate-600"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            ) : null}
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 xl:px-8">{children}</main>
      </div>
    </div>
  );
}
