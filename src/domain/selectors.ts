import type { AirGuardData, AlertStatus, DeviceType, Reading, SafetyStatus } from "./models";

const rank: Record<SafetyStatus, number> = {
  good: 0,
  offline: 1,
  warning: 2,
  critical: 3,
};

export function getRooms(state: AirGuardData) {
  return state.rooms.map((room) => ({ ...room, status: getRoomSafetyStatus(state, room.id) }));
}

export function getRoomById(state: AirGuardData, roomId: string) {
  return getRooms(state).find((room) => room.id === roomId);
}

export function getDevices(state: AirGuardData) {
  return state.devices;
}

export function getDeviceById(state: AirGuardData, deviceId: string) {
  return state.devices.find((device) => device.id === deviceId);
}

export function getDevicesByRoomId(state: AirGuardData, roomId: string) {
  return state.devices.filter((device) => device.roomId === roomId);
}

export function getReadingsByRoomId(state: AirGuardData, roomId: string) {
  return state.readings.filter((reading) => reading.roomId === roomId);
}

export function getReadingsByDeviceId(state: AirGuardData, deviceId: string) {
  const device = getDeviceById(state, deviceId);
  const deviceReadings = state.readings.filter((reading) => reading.deviceId === deviceId);
  if (deviceReadings.length > 0 || !device) return deviceReadings;
  return getReadingsByRoomId(state, device.roomId);
}

export function getLatestReadingForDevice(state: AirGuardData, deviceId: string): Reading | undefined {
  const readings = getReadingsByDeviceId(state, deviceId);
  return readings.find((reading) => reading.type === "co2") ?? readings.find((reading) => reading.type === "smoke") ?? readings[0];
}

export function getActiveAlerts(state: AirGuardData) {
  return state.alerts.filter((alert) => alert.status !== "resolved");
}

export function getCriticalAlerts(state: AirGuardData) {
  return getActiveAlerts(state).filter((alert) => alert.severity === "critical");
}

export function getResolvedAlerts(state: AirGuardData) {
  return state.alerts.filter((alert) => alert.status === "resolved");
}

export function getAlertsByFilter(state: AirGuardData, filter: "All" | "Active" | "Critical" | "Resolved") {
  if (filter === "Active") return getActiveAlerts(state);
  if (filter === "Critical") return getCriticalAlerts(state);
  if (filter === "Resolved") return getResolvedAlerts(state);
  return state.alerts;
}

export function getAlertById(state: AirGuardData, alertId: string) {
  return state.alerts.find((alert) => alert.id === alertId);
}

export function getDashboardSummary(state: AirGuardData) {
  const activeAlerts = getActiveAlerts(state);
  const criticalAlerts = getCriticalAlerts(state);
  return {
    home: state.home,
    user: state.currentUser,
    rooms: getRooms(state),
    readings: getDashboardReadings(state),
    activeAlerts,
    criticalAlerts,
    status: getHomeSafetyStatus(state),
  };
}

export function getDeviceSummary(state: AirGuardData) {
  const online = state.devices.filter((device) => device.status === "online").length;
  return {
    total: state.devices.length,
    online,
    offline: state.devices.length - online,
    rooms: state.rooms.length,
  };
}

export function getRoomSafetyStatus(state: AirGuardData, roomId: string): SafetyStatus {
  const activeAlertStatus = getActiveAlerts(state)
    .filter((alert) => alert.roomId === roomId)
    .reduce<SafetyStatus>((current, alert) => highest(current, alert.severity === "critical" ? "critical" : "warning"), "good");
  const readingStatus = getReadingsByRoomId(state, roomId).reduce<SafetyStatus>((current, reading) => highest(current, reading.status), "good");
  const hasOfflineDevice = getDevicesByRoomId(state, roomId).some((device) => device.status === "offline");
  const statuses: SafetyStatus[] = [activeAlertStatus, readingStatus, hasOfflineDevice ? "offline" : "good"];
  return statuses.reduce(highest, "good");
}

export function getRecentActivity(state: AirGuardData, limit = 8) {
  return [...state.activityLogs].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, limit);
}

export function getHomeSafetyStatus(state: AirGuardData): SafetyStatus {
  const statuses: SafetyStatus[] = state.rooms.map((room) => getRoomSafetyStatus(state, room.id));
  return statuses.reduce(highest, "good");
}

export function getDeviceTypeLabel(type: DeviceType) {
  const labels: Record<DeviceType, string> = {
    "air-sensor": "Air Sensor",
    "smoke-detector": "Smoke Detector",
    "co2-sensor": "CO2 Sensor",
    "ventilation-fan": "Ventilation Fan",
    alarm: "Alarm",
  };
  return labels[type];
}

export function isSetupReady(state: AirGuardData) {
  return Boolean(state.home && state.rooms.length > 0 && state.devices.length > 0);
}

export function nextAlertStatus(status: AlertStatus): AlertStatus {
  if (status === "active") return "checking";
  if (status === "checking") return "resolved";
  return "resolved";
}

function getDashboardReadings(state: AirGuardData) {
  const deviceRoomIds = new Set(state.devices.map((device) => device.roomId));
  return state.readings.filter((reading) => deviceRoomIds.has(reading.roomId)).slice(0, 4);
}

function highest(a: SafetyStatus, b: SafetyStatus) {
  return rank[b] > rank[a] ? b : a;
}
