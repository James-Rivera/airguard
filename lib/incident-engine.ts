import { createAuditLog, getStoredRole } from "./audit";
import { readAppData, writeAppData } from "./storage";
import type {
  AirQualityReading,
  AppData,
  Incident,
  RiskLevel,
  SimulationType,
  UserRole,
} from "./types";

type SimulationResult = {
  data: AppData;
  message: string;
  incident?: Incident;
};

const simulationConfig: Record<
  SimulationType,
  {
    reading: Omit<AirQualityReading, "id" | "createdAt" | "sourceEvent">;
    deviceId?: string;
    incident?: {
      type: string;
      description: string;
      severity: RiskLevel;
      sourceDevice: string;
      location: string;
      assignedRole: UserRole;
      recommendedAction: string;
    };
  }
> = {
  "Normal Reading": {
    reading: {
      airQualityStatus: "Good",
      co2Ppm: 610,
      smokeGasStatus: "Clear",
      pm25: 6,
      temperatureC: 25.8,
      humidityPercent: 52,
      ventilationStatus: "Optimal",
    },
  },
  "High CO2": {
    deviceId: "dev-co2-bedroom",
    reading: {
      airQualityStatus: "Moderate",
      co2Ppm: 1510,
      smokeGasStatus: "Clear",
      pm25: 13,
      temperatureC: 26.7,
      humidityPercent: 59,
      ventilationStatus: "Limited",
    },
    incident: {
      type: "High CO2",
      description: "CO2 level exceeded safe threshold in bedroom.",
      severity: "Medium",
      sourceDevice: "Bedroom CO2 Sensor",
      location: "Bedroom",
      assignedRole: "Safety Officer",
      recommendedAction: "Increase ventilation, open windows, and verify sensor reading within 15 minutes.",
    },
  },
  "Smoke Detected": {
    deviceId: "dev-smoke-kitchen",
    reading: {
      airQualityStatus: "Hazardous",
      co2Ppm: 840,
      smokeGasStatus: "Detected",
      pm25: 72,
      temperatureC: 31.2,
      humidityPercent: 54,
      ventilationStatus: "Poor",
    },
    incident: {
      type: "Smoke/Gas Detected",
      description: "Smoke detected in kitchen by the smoke and gas sensor.",
      severity: "Critical",
      sourceDevice: "Kitchen Smoke and Gas Sensor",
      location: "Kitchen",
      assignedRole: "Safety Officer",
      recommendedAction: "Evacuate if needed, check cooking area or gas source, and contact emergency support if smoke persists.",
    },
  },
  "Poor Ventilation": {
    deviceId: "dev-fan-living",
    reading: {
      airQualityStatus: "Moderate",
      co2Ppm: 1180,
      smokeGasStatus: "Clear",
      pm25: 18,
      temperatureC: 27.5,
      humidityPercent: 63,
      ventilationStatus: "Poor",
    },
    incident: {
      type: "Poor Ventilation",
      description: "Poor ventilation detected in living room.",
      severity: "Medium",
      sourceDevice: "Smart Ventilation Fan",
      location: "Living Room",
      assignedRole: "Homeowner",
      recommendedAction: "Inspect ventilation fan, open airflow paths, and run purifier or fan in manual mode.",
    },
  },
  "Sensor Offline": {
    deviceId: "dev-aq-living",
    reading: {
      airQualityStatus: "Unhealthy",
      co2Ppm: 990,
      smokeGasStatus: "Clear",
      pm25: 26,
      temperatureC: 27.1,
      humidityPercent: 60,
      ventilationStatus: "Limited",
    },
    incident: {
      type: "Sensor Offline",
      description: "Sensor offline for more than 10 minutes.",
      severity: "High",
      sourceDevice: "Living Room Air Quality Sensor",
      location: "Living Room",
      assignedRole: "Administrator",
      recommendedAction: "Check sensor battery, network connection, and restart the device if needed.",
    },
  },
  "High Humidity": {
    deviceId: "dev-humidity-bath",
    reading: {
      airQualityStatus: "Moderate",
      co2Ppm: 760,
      smokeGasStatus: "Clear",
      pm25: 11,
      temperatureC: 28.2,
      humidityPercent: 79,
      ventilationStatus: "Limited",
    },
    incident: {
      type: "High Humidity",
      description: "High humidity may cause mold risk.",
      severity: "Low",
      sourceDevice: "Bathroom Humidity Sensor",
      location: "Bathroom",
      assignedRole: "Homeowner",
      recommendedAction: "Run bathroom exhaust fan, inspect moisture sources, and recheck humidity after 20 minutes.",
    },
  },
};

export function runSimulation(type: SimulationType): SimulationResult {
  const actorRole = getStoredRole();
  const data = readAppData();
  const config = simulationConfig[type];
  const createdAt = new Date().toISOString();
  const reading: AirQualityReading = {
    id: `READ-${Date.now()}`,
    sourceEvent: type,
    createdAt,
    ...config.reading,
  };

  let incident: Incident | undefined;
  if (config.incident) {
    incident = {
      id: `INC-${Date.now()}`,
      status: "New",
      createdAt,
      updatedAt: createdAt,
      mitigationNotes: [],
      ...config.incident,
    };
  }

  const devices = data.devices.map((device) => {
    if (type === "Normal Reading") {
      return {
        ...device,
        status: device.status === "Offline" ? device.status : "Online",
        riskLevel: device.status === "Offline" ? "High" : "Low",
        lastChecked: createdAt,
      };
    }

    if (device.id !== config.deviceId) return device;

    const nextStatus = type === "Sensor Offline" ? "Offline" : "Warning";
    return {
      ...device,
      status: nextStatus,
      riskLevel: incident?.severity ?? "Low",
      latestReading: formatReadingForDevice(type, reading),
      lastChecked: createdAt,
    };
  });

  const logs = [
    createAuditLog({
      actorRole,
      action: `${type} simulation triggered`,
      module: "Dashboard",
      importance: incident?.severity === "Critical" ? "Critical" : incident ? "Warning" : "Info",
      details: `${actorRole} triggered ${type.toLowerCase()} simulation.`,
    }),
  ];

  if (incident) {
    logs.unshift(
      createAuditLog({
        actorRole,
        action: "Incident created automatically",
        module: "Incidents",
        importance: incident.severity === "Critical" ? "Critical" : "Warning",
        details: `${incident.id} created from ${type} simulation: ${incident.description}`,
      }),
    );
  }

  const nextData: AppData = {
    ...data,
    devices,
    readings: [reading, ...data.readings].slice(0, 25),
    incidents: incident ? [incident, ...data.incidents] : data.incidents,
    auditLogs: [...logs, ...data.auditLogs],
  };

  writeAppData(nextData);

  return {
    data: nextData,
    incident,
    message: incident
      ? `${type} simulated. ${incident.severity} incident ${incident.id} was created.`
      : "Normal reading recorded. No incident was created.",
  };
}

function formatReadingForDevice(type: SimulationType, reading: AirQualityReading) {
  if (type === "Smoke Detected") return "Smoke/Gas detected";
  if (type === "High CO2") return `CO2 ${reading.co2Ppm} ppm`;
  if (type === "High Humidity") return `Humidity ${reading.humidityPercent}%`;
  if (type === "Sensor Offline") return "No signal";
  if (type === "Poor Ventilation") return `Ventilation ${reading.ventilationStatus}`;
  return "Normal";
}
