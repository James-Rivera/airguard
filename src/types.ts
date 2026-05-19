export type AccountRole = "Homeowner" | "Safety Officer" | "Administrator";
export type SafetyStatus = "Good" | "Moderate" | "Warning" | "Critical" | "Offline";
export type DeviceStatus = "Online" | "Warning" | "Offline";
export type AlertStatus = "New" | "Checking" | "Action Taken" | "Resolved";
export type DemoScenario = "Normal" | "High CO2" | "Smoke" | "Offline" | "Ventilation";
export type MainTab = "Home" | "Rooms" | "Alerts" | "Devices" | "More";
export type ScreenName = MainTab | "Splash" | "Accounts" | "Kitchen" | "AlertDetail" | "Risks" | "Activity" | "Checklist" | "Reports";

export type Account = {
  id: string;
  name: string;
  role: AccountRole;
  initials: string;
  description: string;
};

export type Room = {
  id: string;
  name: string;
  status: SafetyStatus;
  mainReading: string;
  co2Ppm: number;
  humidityPercent: number;
  temperatureC: number;
  smokeGas: "Clear" | "Warning";
  deviceCount: number;
  summary: string;
};

export type Device = {
  id: string;
  name: string;
  type: string;
  roomId: string;
  roomName: string;
  status: DeviceStatus;
  latestReading: string;
  powerStatus: string;
  lastChecked: string;
};

export type Reading = {
  id: string;
  roomId: string;
  roomName: string;
  status: SafetyStatus;
  co2Ppm: number;
  humidityPercent: number;
  temperatureC: number;
  smokeUgM3: number;
  ventilation: "Optimal" | "Limited" | "Poor" | "Off";
  sourceEvent: string;
  createdAt: string;
};

export type AlertNote = {
  id: string;
  text: string;
  createdAt: string;
  actorName: string;
};

export type Alert = {
  id: string;
  title: string;
  location: string;
  roomId: string;
  riskLevel: SafetyStatus;
  status: AlertStatus;
  detectedAt: string;
  updatedAt: string;
  sourceDevice: string;
  description: string;
  recommendedAction: string;
  notes: AlertNote[];
};

export type ActivityItem = {
  id: string;
  timestamp: string;
  actorName: string;
  category: "Account" | "Monitoring" | "Alerts" | "Devices" | "Risks" | "Checklist" | "Reports" | "System";
  title: string;
  description: string;
  level: SafetyStatus;
};

export type RiskItem = {
  id: string;
  title: string;
  riskLevel: SafetyStatus;
  whyItMatters: string;
  recommendedPrevention: string;
  likelihood: number;
  impact: number;
  score: number;
};

export type ChecklistGroup = "Access Control" | "Alert Response" | "Risk Management" | "Data Safety";

export type ChecklistItem = {
  id: string;
  group: ChecklistGroup;
  label: string;
  checked: boolean;
};

export type AppData = {
  selectedAccountId: string | null;
  rooms: Room[];
  devices: Device[];
  readings: Reading[];
  alerts: Alert[];
  activityItems: ActivityItem[];
  risks: RiskItem[];
  checklistItems: ChecklistItem[];
};
