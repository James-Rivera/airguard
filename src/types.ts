export type AccountRole = "Homeowner" | "Safety Officer" | "Administrator";
export type SafetyStatus = "Good" | "Moderate" | "Warning" | "Critical" | "Offline";
export type DeviceStatus = "Online" | "Warning" | "Offline";
export type AlertStatus = "New" | "Checking" | "Action Taken" | "Resolved";
export type DemoScenario = "Normal Reading" | "High CO2" | "Smoke Detected" | "Sensor Offline" | "Poor Ventilation";
export type MainTab = "Home" | "Rooms" | "Alerts" | "Devices" | "More";
export type ScreenName =
  | MainTab
  | "Splash"
  | "Accounts"
  | "Kitchen"
  | "AlertDetail"
  | "Risks"
  | "Activity"
  | "Checklist"
  | "Reports"
  | "DemoControls"
  | "Settings";

export type Account = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: AccountRole;
  initials: string;
  homeName: string;
  description: string;
};

export type Session = {
  userId: string;
  name: string;
  email: string;
  role: AccountRole;
  homeName: string;
  loginAt: string;
  isDemo: true;
};

export type HomeProfile = {
  name: string;
  location: string;
  lastSystemSync: string;
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
  firmwareVersion: string;
  signalStrength: string;
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

export type ChecklistGroup = "Account Access" | "Alert Response" | "Home Readiness" | "System Readiness";

export type ChecklistItem = {
  id: string;
  group: ChecklistGroup;
  label: string;
  checked: boolean;
};

export type AppData = {
  selectedAccountId: string | null;
  home: HomeProfile;
  reportGeneratedAt: string;
  rooms: Room[];
  devices: Device[];
  readings: Reading[];
  alerts: Alert[];
  activityItems: ActivityItem[];
  risks: RiskItem[];
  checklistItems: ChecklistItem[];
};

export type RolePermissions = {
  canManageAlerts: boolean;
  canUseSimulationTools: boolean;
  canResetDemo: boolean;
  canViewSafetyTools: boolean;
};

export type ReportSummary = {
  totalAlerts: number;
  activeAlerts: number;
  resolvedAlerts: number;
  highestRisk: SafetyStatus;
  highestRiskLabel: string;
  readiness: number;
  recentActions: ActivityItem[];
  generatedAt: string;
};
