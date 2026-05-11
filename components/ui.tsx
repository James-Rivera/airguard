"use client";

import type { AirQualityStatus, DeviceStatus, IncidentStatus, RiskLevel } from "@/lib/types";

type BadgeTone = "green" | "yellow" | "orange" | "red" | "blue" | "gray" | "purple";

const badgeTones: Record<BadgeTone, string> = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-700",
  yellow: "border-amber-200 bg-amber-50 text-amber-700",
  orange: "border-orange-200 bg-orange-50 text-orange-700",
  red: "border-red-200 bg-red-50 text-red-700",
  blue: "border-sky-200 bg-sky-50 text-sky-700",
  gray: "border-slate-200 bg-slate-50 text-slate-700",
  purple: "border-violet-200 bg-violet-50 text-violet-700",
};

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Badge({ label, tone = "gray" }: { label: string; tone?: BadgeTone }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${badgeTones[tone]}`}>
      {label}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: RiskLevel }) {
  const tone: Record<RiskLevel, BadgeTone> = {
    Low: "green",
    Medium: "yellow",
    High: "orange",
    Critical: "red",
  };
  return <Badge label={severity} tone={tone[severity]} />;
}

export function StatusBadge({ status }: { status: DeviceStatus | IncidentStatus | AirQualityStatus | string }) {
  const tone =
    status === "Online" || status === "Resolved" || status === "Good" || status === "Implemented"
      ? "green"
      : status === "Warning" || status === "Investigating" || status === "Moderate" || status === "In Progress"
        ? "yellow"
        : status === "Offline" || status === "Critical" || status === "Hazardous"
          ? "red"
          : status === "Mitigated" || status === "New"
            ? "blue"
            : "gray";

  return <Badge label={status} tone={tone as BadgeTone} />;
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  const styles = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-500",
    secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-400",
    danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
    ghost: "text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-400",
  };

  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center rounded-md px-3.5 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-slate-700">{children}</label>;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className="min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      {...props}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className="min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      {...props}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="min-h-24 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      {...props}
    />
  );
}

export function MetricCard({
  label,
  value,
  detail,
  badge,
}: {
  label: string;
  value: string | number;
  detail?: string;
  badge?: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {badge}
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
      {detail ? <p className="mt-1 text-sm text-slate-500">{detail}</p> : null}
    </Card>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
      <p className="font-medium text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}
