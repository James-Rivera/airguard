import type { ActivityLog, Alert, Device, DeviceType, Home, Reading, Room, SafetyStatus, User } from "@/domain/models";

export type ProfileRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
};

export type HomeRow = {
  id: string;
  name: string;
  address_label: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type RoomRow = {
  id: string;
  home_id: string;
  name: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type DeviceRow = {
  id: string;
  home_id: string;
  room_id: string | null;
  name: string;
  type: string;
  connection_status: string;
  safety_status: string;
  battery_level: number | null;
  power_connected: boolean | null;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ReadingRow = {
  id: string;
  home_id: string;
  room_id: string;
  device_id: string | null;
  type: string;
  value: number | string;
  unit: string;
  status: string;
  status_label: string | null;
  created_at: string;
};

export type AlertRow = {
  id: string;
  home_id: string;
  room_id: string;
  device_id: string | null;
  title: string;
  message: string;
  severity: string;
  status: string;
  recommended_action: string | null;
  created_at: string;
  resolved_at: string | null;
};

export type ActivityRow = {
  id: string;
  home_id: string;
  user_id: string | null;
  type: string;
  title: string;
  message: string | null;
  created_at: string;
};

export function mapProfile(row: ProfileRow): User & { onboardingComplete: boolean } {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role === "administrator" || row.role === "member" ? row.role : "homeowner",
    onboardingComplete: row.onboarding_complete,
  };
}

export function mapHome(row: HomeRow): Home {
  return {
    id: row.id,
    name: row.name,
    address: row.address_label ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapRoom(row: RoomRow): Room {
  return {
    id: row.id,
    name: row.name,
    icon: normalizeRoomIcon(row.type),
    status: normalizeSafetyStatus(row.status),
    createdAt: row.created_at,
  };
}

export function mapDevice(row: DeviceRow): Device {
  return {
    id: row.id,
    roomId: row.room_id ?? "",
    name: row.name,
    type: normalizeDeviceType(row.type),
    status: row.connection_status === "offline" ? "offline" : "online",
    batteryLevel: row.battery_level ?? undefined,
    powerConnected: row.power_connected ?? false,
    lastUpdatedMinutesAgo: minutesSince(row.last_seen_at ?? row.updated_at),
  };
}

export function mapReading(row: ReadingRow): Reading {
  return {
    id: row.id,
    roomId: row.room_id,
    deviceId: row.device_id ?? undefined,
    label: readingLabel(row.type),
    type: row.type === "temperature" || row.type === "co2" || row.type === "smoke" || row.type === "humidity" ? row.type : "co2",
    value: Number(row.value),
    unit: row.unit,
    status: normalizeSafetyStatus(row.status),
    statusLabel: row.status_label ?? normalizeSafetyStatus(row.status),
    createdAt: row.created_at,
  };
}

export function mapAlert(row: AlertRow, roomName = "Room"): Alert {
  return {
    id: row.id,
    roomId: row.room_id,
    deviceId: row.device_id ?? undefined,
    title: row.title,
    roomName,
    message: row.message,
    severity: row.severity === "critical" ? "critical" : "warning",
    status: row.status === "checking" || row.status === "resolved" ? row.status : "active",
    createdAt: row.created_at,
    updatedAt: row.resolved_at ?? row.created_at,
    recommendedAction: row.recommended_action ?? "Check the room and review the latest readings.",
  };
}

export function mapActivity(row: ActivityRow): ActivityLog {
  return {
    id: row.id,
    category: row.type === "home" || row.type === "room" || row.type === "device" || row.type === "reading" || row.type === "alert" || row.type === "demo" ? row.type : "account",
    title: row.title,
    description: row.message ?? "",
    createdAt: row.created_at,
    status: row.type === "alert" ? "warning" : "good",
  };
}

export function normalizeSafetyStatus(value: string): SafetyStatus {
  if (value === "warning" || value === "critical" || value === "offline") return value;
  return "good";
}

export function normalizeDeviceType(value: string): DeviceType {
  if (value === "smoke-detector" || value === "co2-sensor" || value === "ventilation-fan" || value === "alarm") return value;
  return "air-sensor";
}

function normalizeRoomIcon(value: string): Room["icon"] {
  if (value === "kitchen" || value === "bedroom" || value === "bathroom" || value === "dining-room") return value;
  return "living-room";
}

function readingLabel(type: string) {
  if (type === "co2") return "CO2";
  if (type === "smoke") return "Smoke";
  if (type === "humidity") return "Humidity";
  if (type === "temperature") return "Temperature";
  return type;
}

function minutesSince(value: string) {
  const diff = Date.now() - Date.parse(value);
  if (!Number.isFinite(diff) || diff < 0) return 0;
  return Math.max(0, Math.round(diff / 60000));
}
