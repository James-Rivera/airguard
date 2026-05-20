import type { AlertSeverity, Reading } from "./models";

export type DemoScenarioType =
  | "normal-reading"
  | "high-co2"
  | "smoke-detected"
  | "sensor-offline"
  | "humidity-temperature-warning"
  | "reset-to-normal";

export type ScenarioPreviewReading = {
  label: string;
  type: Reading["type"];
  value: number;
  unit: string;
  statusLabel: string;
};

export type DemoScenarioMeta = {
  type: DemoScenarioType;
  title: string;
  summary: string;
  severity: AlertSeverity | "good" | "offline";
  preview: ScenarioPreviewReading[];
};

export type ScenarioTargetInput = {
  roomId?: string;
  deviceId?: string;
};

export type ScenarioRecordsAffected = {
  rooms: number;
  devices: number;
  readings: number;
  alerts: number;
  resolvedAlerts: number;
  activityLogs: number;
};

export type ScenarioRunResult = {
  scenarioType: DemoScenarioType;
  title: string;
  homeId: string;
  roomId?: string;
  roomName?: string;
  deviceId?: string;
  deviceName?: string;
  appliedAt: string;
  recordsAffected: ScenarioRecordsAffected;
};

export const demoScenarios: DemoScenarioMeta[] = [
  {
    type: "normal-reading",
    title: "Normal Reading",
    summary: "Writes healthy readings across monitored rooms.",
    severity: "good",
    preview: [
      { label: "CO2", type: "co2", value: 430, unit: "ppm", statusLabel: "Good" },
      { label: "Humidity", type: "humidity", value: 49, unit: "%", statusLabel: "Normal" },
      { label: "Temperature", type: "temperature", value: 24, unit: "C", statusLabel: "Comfortable" },
    ],
  },
  {
    type: "high-co2",
    title: "High CO2 / Poor Ventilation",
    summary: "Raises CO2 in a living space and creates a ventilation warning.",
    severity: "warning",
    preview: [{ label: "CO2", type: "co2", value: 1180, unit: "ppm", statusLabel: "High" }],
  },
  {
    type: "smoke-detected",
    title: "Smoke Detected",
    summary: "Creates a critical smoke reading and urgent room alert.",
    severity: "critical",
    preview: [
      { label: "Smoke", type: "smoke", value: 286, unit: "ug/m3", statusLabel: "Critical" },
      { label: "CO2", type: "co2", value: 1180, unit: "ppm", statusLabel: "High" },
    ],
  },
  {
    type: "sensor-offline",
    title: "Sensor Offline",
    summary: "Marks a room sensor offline and creates a device attention alert.",
    severity: "offline",
    preview: [{ label: "CO2", type: "co2", value: 0, unit: "ppm", statusLabel: "Offline" }],
  },
  {
    type: "humidity-temperature-warning",
    title: "Humidity or Temperature Warning",
    summary: "Writes comfort-risk readings and creates a room warning.",
    severity: "warning",
    preview: [
      { label: "Humidity", type: "humidity", value: 72, unit: "%", statusLabel: "High" },
      { label: "Temperature", type: "temperature", value: 33, unit: "C", statusLabel: "Warm" },
    ],
  },
  {
    type: "reset-to-normal",
    title: "Reset to Normal",
    summary: "Restores normal readings, online devices, and resolves active alerts.",
    severity: "good",
    preview: [
      { label: "CO2", type: "co2", value: 430, unit: "ppm", statusLabel: "Good" },
      { label: "Smoke", type: "smoke", value: 0, unit: "ug/m3", statusLabel: "Clear" },
    ],
  },
];

export function getDemoScenarioMeta(type: DemoScenarioType) {
  return demoScenarios.find((scenario) => scenario.type === type) ?? demoScenarios[0];
}
