import { alerts, demoHome, demoUser, devices, readings, rooms } from "./seed";

export function getUser() {
  return demoUser;
}

export function getHome() {
  return demoHome;
}

export function getRooms() {
  return rooms;
}

export function getRoomById(roomId: string) {
  return rooms.find((room) => room.id === roomId);
}

export function getDevicesByRoomId(roomId: string) {
  return devices.filter((device) => device.roomId === roomId);
}

export function getReadingsByRoomId(roomId: string) {
  return readings.filter((reading) => reading.roomId === roomId);
}

export function getActiveAlerts() {
  return alerts.filter((alert) => alert.severity !== "resolved");
}

export function getCriticalAlerts() {
  return alerts.filter((alert) => alert.severity === "critical");
}

export function getDashboardSummary() {
  return {
    home: demoHome,
    user: demoUser,
    rooms,
    readings: getReadingsByRoomId("living-room"),
    activeAlerts: getActiveAlerts(),
    criticalAlerts: getCriticalAlerts(),
    status: (getCriticalAlerts().length ? "critical" : "good") as "critical" | "good",
  };
}

export function getDeviceSummary() {
  const online = devices.filter((device) => device.status === "online").length;
  return {
    total: devices.length,
    online,
    offline: devices.length - online,
    rooms: rooms.length,
  };
}

export function getRoomSafetyStatus(roomId: string) {
  return getRoomById(roomId)?.status ?? "offline";
}

export function getRoomName(roomId: string) {
  return getRoomById(roomId)?.name ?? "Unknown Room";
}

export function getAlertById(alertId: string) {
  return alerts.find((alert) => alert.id === alertId);
}

export function getDevices() {
  return devices;
}

export function getAlerts() {
  return alerts;
}
