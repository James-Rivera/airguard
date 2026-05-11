import { readAppData, writeAppData } from "./storage";
import type { AuditLog, UserRole } from "./types";

type AuditInput = Omit<AuditLog, "id" | "timestamp" | "actorRole"> & {
  actorRole?: UserRole;
};

export function createAuditLog(input: AuditInput): AuditLog {
  return {
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorRole: input.actorRole ?? getStoredRole(),
    action: input.action,
    module: input.module,
    importance: input.importance,
    details: input.details,
  };
}

export function addAuditLog(input: AuditInput) {
  const data = readAppData();
  const log = createAuditLog(input);
  writeAppData({
    ...data,
    auditLogs: [log, ...data.auditLogs],
  });
  return log;
}

export function getStoredRole(): UserRole {
  if (typeof window === "undefined") return "Administrator";
  const role = window.localStorage.getItem("airguard:role");
  if (role === "Homeowner" || role === "Safety Officer" || role === "Administrator") {
    return role;
  }
  return "Administrator";
}
