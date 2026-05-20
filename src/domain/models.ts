export type SafetyStatus = "good" | "warning" | "critical" | "offline";
export type DeviceType = "air-sensor" | "smoke-detector" | "co2-sensor" | "ventilation-fan" | "alarm";
export type DeviceStatus = "online" | "offline" | "pairing";
export type AlertStatus = "active" | "checking" | "resolved";
export type AlertSeverity = "warning" | "critical";
export type ActivityCategory = "account" | "home" | "room" | "device" | "reading" | "alert" | "demo";

export type User = {
  id: string;
  name: string;
  email: string;
  role: "administrator" | "homeowner" | "member";
};

export type Session = {
  userId: string;
  email: string;
  startedAt: string;
  isDemo: boolean;
};

export type Home = {
  id: string;
  name: string;
  address?: string;
  createdAt: string;
};

export type Room = {
  id: string;
  name: string;
  icon: "bedroom" | "living-room" | "bathroom" | "kitchen" | "dining-room" | "office" | "nursery";
  status: SafetyStatus;
  createdAt: string;
};

export type Device = {
  id: string;
  roomId: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  batteryLevel?: number;
  lastUpdatedMinutesAgo: number;
  powerConnected?: boolean;
};

export type Reading = {
  id: string;
  roomId: string;
  deviceId?: string;
  label: string;
  type: "temperature" | "co2" | "smoke" | "humidity";
  value: number;
  unit: string;
  statusLabel: string;
  status: SafetyStatus;
  createdAt: string;
};

export type Alert = {
  id: string;
  roomId: string;
  deviceId?: string;
  title: string;
  roomName: string;
  message: string;
  severity: AlertSeverity;
  status: AlertStatus;
  createdAt: string;
  updatedAt: string;
  recommendedAction: string;
};

export type ActivityLog = {
  id: string;
  category: ActivityCategory;
  title: string;
  description: string;
  createdAt: string;
  status: SafetyStatus;
};

export type OnboardingState = {
  homeCreated: boolean;
  roomsAdded: boolean;
  firstDeviceAdded: boolean;
};

export type PairingDraft = {
  type?: DeviceType;
  roomId?: string;
  roomName?: string;
  roomIcon?: Room["icon"];
  foundDeviceName?: string;
};

export type AirGuardData = {
  currentUser: User | null;
  session: Session | null;
  onboardingComplete: boolean;
  onboarding: OnboardingState;
  homes: Home[];
  home: Home | null;
  rooms: Room[];
  devices: Device[];
  readings: Reading[];
  alerts: Alert[];
  activityLogs: ActivityLog[];
  pairingDraft: PairingDraft;
};
