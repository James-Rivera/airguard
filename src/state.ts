import { accounts } from "./data";
import type { Account, AccountRole, MainTab, RolePermissions, ScreenName, Session } from "./types";

export function authenticateDemoAccount(email: string, password: string): Account | null {
  const normalizedEmail = email.trim().toLowerCase();
  return accounts.find((account) => account.email.toLowerCase() === normalizedEmail && account.password === password) ?? null;
}

export function createSession(account: Account, loginAt = new Date().toISOString()): Session {
  return {
    userId: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    homeName: account.homeName,
    loginAt,
    isDemo: true,
  };
}

export function getPermissions(role?: AccountRole): RolePermissions {
  const elevated = role === "Safety Officer" || role === "Administrator";
  return {
    canManageAlerts: elevated,
    canUseSimulationTools: elevated,
    canResetDemo: role === "Administrator",
    canViewSafetyTools: elevated,
  };
}

export function getInitialScreen(session: Session | null): ScreenName {
  return session ? "Home" : "Splash";
}

export function getActiveTab(screen: ScreenName): MainTab {
  if (screen === "Rooms" || screen === "Kitchen") return "Rooms";
  if (screen === "Alerts" || screen === "AlertDetail") return "Alerts";
  if (screen === "Devices") return "Devices";
  if (screen === "More" || screen === "Risks" || screen === "Activity" || screen === "Checklist" || screen === "Reports" || screen === "DemoControls" || screen === "Settings") {
    return "More";
  }
  return "Home";
}

export function firstName(name?: string) {
  return name?.split(" ")[0] ?? "Carlo";
}

export function initials(name?: string) {
  if (!name) return "AG";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
