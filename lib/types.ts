export type UserRole = "Homeowner" | "Safety Officer" | "Administrator";

export type DeviceStatus = "Online" | "Warning" | "Offline";
export type RiskLevel = "Low" | "Medium" | "High" | "Critical";
export type IncidentStatus = "New" | "Investigating" | "Mitigated" | "Resolved";
export type AirQualityStatus = "Good" | "Moderate" | "Unhealthy" | "Hazardous";
export type RiskMitigationStatus = "Not Started" | "In Progress" | "Implemented";

export type Device = {
  id: string;
  name: string;
  type: string;
  location: string;
  status: DeviceStatus;
  latestReading: string;
  powerStatus: string;
  lastChecked: string;
  riskLevel: RiskLevel;
  description: string;
};

export type AirQualityReading = {
  id: string;
  airQualityStatus: AirQualityStatus;
  co2Ppm: number;
  smokeGasStatus: "Clear" | "Detected";
  pm25: number;
  temperatureC: number;
  humidityPercent: number;
  ventilationStatus: "Optimal" | "Limited" | "Poor" | "Offline";
  sourceEvent: string;
  createdAt: string;
};

export type Incident = {
  id: string;
  type: string;
  description: string;
  severity: RiskLevel;
  status: IncidentStatus;
  sourceDevice: string;
  location: string;
  createdAt: string;
  updatedAt: string;
  assignedRole: UserRole;
  recommendedAction: string;
  mitigationNotes: string[];
};

export type RiskItem = {
  id: string;
  title: string;
  category: string;
  likelihood: number;
  impact: number;
  mitigationPlan: string;
  ownerRole: UserRole;
  status: RiskMitigationStatus;
  reviewDate: string;
  mitigationNotes: string[];
};

export type AuditLog = {
  id: string;
  timestamp: string;
  actorRole: UserRole;
  action: string;
  module: "Auth" | "Dashboard" | "Devices" | "Incidents" | "Risk Assessment" | "Audit Logs" | "Compliance" | "Reports" | "System";
  importance: "Info" | "Notice" | "Warning" | "Critical";
  details: string;
};

export type ComplianceItem = {
  id: string;
  category: "Data Privacy and Access Control" | "Incident Response" | "Risk Management" | "Cybersecurity Governance";
  label: string;
  checked: boolean;
};

export type AppData = {
  devices: Device[];
  readings: AirQualityReading[];
  incidents: Incident[];
  risks: RiskItem[];
  auditLogs: AuditLog[];
  complianceItems: ComplianceItem[];
};

export type SimulationType =
  | "Normal Reading"
  | "High CO2"
  | "Smoke Detected"
  | "Poor Ventilation"
  | "Sensor Offline"
  | "High Humidity";
