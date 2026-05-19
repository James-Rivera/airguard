export type SafetyStatus = "good" | "warning" | "critical" | "offline";

export type User = {
  id: string;
  name: string;
  role: "administrator" | "homeowner" | "member";
  avatarUrl?: string;
};

export type Home = {
  id: string;
  name: string;
  address?: string;
  roomIds: string[];
};

export type Room = {
  id: string;
  name: string;
  icon: "bedroom" | "living-room" | "bathroom" | "kitchen" | "dining-room";
  status: SafetyStatus;
  deviceIds: string[];
};

export type Device = {
  id: string;
  roomId: string;
  name: string;
  type: "air-sensor" | "ventilation-fan" | "smoke-detector" | "alarm";
  status: "online" | "offline";
  batteryLevel?: number;
  lastUpdatedMinutesAgo: number;
  powerConnected?: boolean;
};

export type Reading = {
  id: string;
  roomId: string;
  label: string;
  type: "temperature" | "co2" | "smoke" | "humidity";
  value: number;
  unit: string;
  statusLabel: string;
  status: SafetyStatus;
};

export type Alert = {
  id: string;
  roomId: string;
  deviceId?: string;
  title: string;
  roomName: string;
  message: string;
  severity: "active" | "critical" | "resolved";
  createdAt: string;
  recommendedAction: string;
};
