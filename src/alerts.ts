import { createInitialData } from "./data";
import { riskRank } from "./reports";
import type { Alert, AlertStatus, AppData } from "./types";

export const actionNoteExamples = [
  "Checked kitchen area and opened windows.",
  "Turned on ventilation fan.",
  "No visible smoke after inspection.",
  "Sensor reading returned to normal.",
];

export function createActivity(
  actorName: string,
  category: AppData["activityItems"][number]["category"],
  title: string,
  description: string,
  level: AppData["activityItems"][number]["level"],
  timestamp = new Date().toISOString(),
) {
  return {
    id: `ACT-${Date.now()}-${Math.round(Math.random() * 999)}`,
    timestamp,
    actorName,
    category,
    title,
    description,
    level,
  };
}

export function updateAlertStatus(data: AppData, alertId: string, status: AlertStatus, actorName: string, text?: string): AppData {
  const target = data.alerts.find((alert) => alert.id === alertId);
  if (!target) return data;

  const updatedAt = new Date().toISOString();
  const resolvedReading = status === "Resolved" ? createResolvedReading(target, updatedAt) : undefined;
  const remainingActiveAlerts =
    status === "Resolved"
      ? data.alerts.filter((alert) => alert.id !== alertId && alert.status !== "Resolved")
      : data.alerts.filter((alert) => alert.status !== "Resolved");

  return {
    ...data,
    home: { ...data.home, lastSystemSync: updatedAt },
    reportGeneratedAt: updatedAt,
    alerts: data.alerts.map((alert) =>
      alert.id === alertId
        ? {
            ...alert,
            status,
            updatedAt,
            notes: text ? [{ id: `NOTE-${Date.now()}`, text, createdAt: updatedAt, actorName }, ...alert.notes] : alert.notes,
          }
        : alert,
    ),
    rooms:
      status === "Resolved"
        ? data.rooms.map((room) => applyActiveAlertsToRoom(room.id === target.roomId ? getSafeRoom(room) : room, remainingActiveAlerts))
        : data.rooms,
    devices:
      status === "Resolved"
        ? data.devices.map((device) => applyActiveAlertsToDevice(device.roomId === target.roomId ? getSafeDevice(device, updatedAt) : device, remainingActiveAlerts))
        : data.devices,
    readings: resolvedReading ? [resolvedReading, ...data.readings].slice(0, 30) : data.readings,
    activityItems: [
      createActivity(
        actorName,
        "Alerts",
        status === "Action Taken" ? "Action taken" : status === "Checking" ? "Alert checking started" : `Alert marked ${status}`,
        `${target.title}: ${text ?? status}`,
        status === "Resolved" ? "Good" : target.riskLevel,
        updatedAt,
      ),
      ...data.activityItems,
    ],
  };
}

export function applyActiveAlertsToRoom(room: AppData["rooms"][number], activeAlerts: Alert[]) {
  const alert = [...activeAlerts].sort((a, b) => riskRank(b.riskLevel) - riskRank(a.riskLevel)).find((item) => item.roomId === room.id);
  if (!alert) return room;
  const mainReading = alert.riskLevel === "Critical" ? "Action needed" : alert.riskLevel === "Offline" ? "Sensor offline" : "Check needed";
  return {
    ...room,
    status: alert.riskLevel,
    mainReading,
    summary: `${alert.title} remains open.`,
  };
}

export function applyActiveAlertsToDevice(device: AppData["devices"][number], activeAlerts: Alert[]) {
  const directAlert = activeAlerts.find((alert) => alert.sourceDevice === device.name);
  const kitchenSmokeOpen = activeAlerts.some((alert) => alert.roomId === "kitchen" && alert.riskLevel === "Critical" && alert.title.includes("Smoke"));

  if (directAlert?.riskLevel === "Offline") {
    return { ...device, status: "Offline" as const, latestReading: "No signal", signalStrength: "No signal" };
  }
  if (directAlert) {
    return { ...device, status: "Warning" as const, latestReading: directAlert.sourceDevice === "Smart Ventilation Fan" ? "Off" : "Needs attention" };
  }
  if (kitchenSmokeOpen && device.id === "dev-kitchen-fan") {
    return { ...device, status: "Offline" as const, latestReading: "Off", signalStrength: "No signal" };
  }
  return device;
}

function getSafeRoom(room: AppData["rooms"][number]): AppData["rooms"][number] {
  const safeRoom = createInitialData().rooms.find((item) => item.id === room.id);
  return safeRoom ? { ...safeRoom } : { ...room, status: "Good", smokeGas: "Clear" };
}

function getSafeDevice(device: AppData["devices"][number], updatedAt: string): AppData["devices"][number] {
  const safeDevice = createInitialData().devices.find((item) => item.id === device.id);
  return safeDevice ? { ...safeDevice, lastChecked: updatedAt } : { ...device, status: "Online", latestReading: "Normal", signalStrength: "Good", lastChecked: updatedAt };
}

function createResolvedReading(alert: Alert, createdAt: string): AppData["readings"][number] {
  const safeRoom = createInitialData().rooms.find((room) => room.id === alert.roomId);
  return {
    id: `READ-${Date.now()}`,
    roomId: alert.roomId,
    roomName: safeRoom?.name ?? alert.location,
    status: "Good",
    co2Ppm: safeRoom?.co2Ppm ?? 438,
    humidityPercent: safeRoom?.humidityPercent ?? 49,
    temperatureC: safeRoom?.temperatureC ?? 26.2,
    smokeUgM3: 0,
    ventilation: "Optimal",
    sourceEvent: "Resolved",
    createdAt,
  };
}
