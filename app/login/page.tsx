"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { addAuditLog } from "@/lib/audit";
import { ROLE_KEY, seedInitialData } from "@/lib/storage";
import type { UserRole } from "@/lib/types";
import { Button, Card } from "@/components/ui";

const roles: UserRole[] = ["Homeowner", "Safety Officer", "Administrator"];

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("Administrator");

  useEffect(() => {
    seedInitialData();
  }, []);

  function login() {
    window.localStorage.setItem(ROLE_KEY, role);
    addAuditLog({
      actorRole: role,
      action: "Logged in",
      module: "Auth",
      importance: "Info",
      details: `${role} entered the AirGuard prototype using mock role selection.`,
    });
    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <Card className="w-full max-w-5xl overflow-hidden">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <section className="bg-slate-950 p-8 text-white sm:p-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold">
                AG
              </div>
              <div>
                <p className="text-lg font-semibold">AirGuard</p>
                <p className="text-sm text-slate-300">Smart home air operations</p>
              </div>
            </div>
            <div className="mt-16 max-w-md">
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                Smart indoor air monitoring with structured risk response.
              </h1>
              <p className="mt-5 text-base leading-7 text-slate-300">
                Monitor simulated air quality devices, create incidents automatically, assess risks, and show a complete audit trail for academic demonstration.
              </p>
            </div>
            <div className="mt-12 grid gap-3 sm:grid-cols-3">
              {["Sensors", "Incidents", "Risk"].map((item) => (
                <div key={item} className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-medium">{item}</p>
                  <p className="mt-1 text-xs text-slate-400">Demo-ready workflow</p>
                </div>
              ))}
            </div>
          </section>

          <section className="p-8 sm:p-10">
            <p className="text-sm font-medium uppercase tracking-wide text-brand-700">Prototype login</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950">Select a mock role</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              This MVP does not use real authentication. Your selected role is stored locally for the demo session.
            </p>

            <div className="mt-8 space-y-3">
              {roles.map((item) => (
                <label
                  key={item}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                    role === item ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={item}
                    checked={role === item}
                    onChange={() => setRole(item)}
                    className="mt-1"
                  />
                  <span>
                    <span className="block font-medium text-slate-950">{item}</span>
                    <span className="mt-1 block text-sm text-slate-500">
                      {item === "Administrator"
                        ? "Best for showing the complete defense demo flow."
                        : item === "Safety Officer"
                          ? "Focused on incident response and mitigation."
                          : "Focused on household monitoring and device checks."}
                    </span>
                  </span>
                </label>
              ))}
            </div>

            <Button className="mt-8 w-full" onClick={login}>
              Enter AirGuard
            </Button>
            <p className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
              Demo note: localStorage is used for role, readings, incidents, risk register, checklist, and audit log persistence.
            </p>
          </section>
        </div>
      </Card>
    </main>
  );
}
