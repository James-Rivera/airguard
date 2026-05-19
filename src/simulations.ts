import { applyActiveAlertsToDevice, applyActiveAlertsToRoom, createActivity } from "./alerts";
import { createInitialData } from "./data";
import type { Alert, AppData, DemoScenario } from "./types";

export function simulateScenario(data: AppData, scenario: DemoScenario, actorName: string): AppData {
  const createdAt = new Date().toISOString();

  if (scenario === "Normal Reading") {
    const fresh = createInitialData();
    const activeAlerts = data.alerts.filter((alert) => alert.status !== "Resolved");
    return {
      ...data,
      home: { ...data.home, lastSystemSync: createdAt },
      reportGeneratedAt: createdAt,
      rooms: fresh.rooms.map((room) => applyActiveAlertsToRoom(room, activeAlerts)),
      devices: fresh.devices.map((device) => applyActiveAlertsToDevice({ ...device, lastChecked: createdAt }, activeAlerts)),
      readings: [createScenarioReading("Normal Reading", createdAt), ...data.readings].slice(0, 30),
      alerts: data.alerts,
      activityItems: [
        createActivity(actorName, "Monitoring", "Normal readings restored", "Readings returned to baseline. Open alerts remain active until resolved.", "Good", createdAt),
        ...data.activityItems,
      ],
    };
  }

  const alert = createScenarioAlert(scenario, createdAt);
  const existingActiveAlert = data.alerts.find((item) => item.status !== "Resolved" && item.roomId === alert.roomId && item.sourceDevice === alert.sourceDevice);
  const nextAlert = existingActiveAlert ? { ...existingActiveAlert, updatedAt: createdAt } : alert;

  return {
    ...data,
    home: { ...data.home, lastSystemSync: createdAt },
    reportGeneratedAt: createdAt,
    readings: [createScenarioReading(scenario, createdAt), ...data.readings].slice(0, 30),
    alerts: existingActiveAlert ? data.alerts.map((item) => (item.id === existingActiveAlert.id ? nextAlert : item)) : [nextAlert, ...data.alerts],
    rooms: data.rooms.map((room) => updateRoomForScenario(room, scenario)),
    devices: data.devices.map((device) => updateDeviceForScenario(device, scenario, createdAt)),
    activityItems: [
      createActivity(
        actorName,
        "Alerts",
        existingActiveAlert ? `${alert.riskLevel} alert refreshed` : `${alert.riskLevel} alert created`,
        alert.title,
        alert.riskLevel,
        createdAt,
      ),
      ...data.activityItems,
    ],
  };
}

function createScenarioReading(scenario: DemoScenario, createdAt: string): AppData["readings"][number] {
  if (scenario === "Smoke Detected") {
    return {
      id: `READ-${Date.now()}`,
      roomId: "kitchen",
      roomName: "Kitchen",
      status: "Critical",
      co2Ppm: 1280,
      humidityPercent: 58,
      temperatureC: 31.2,
      smokeUgM3: 215,
      ventilation: "Off",
      sourceEvent: scenario,
      createdAt,
    };
  }
  if (scenario === "High CO2") {
    return {
      id: `READ-${Date.now()}`,
      roomId: "bedroom",
      roomName: "Bedroom",
      status: "Warning",
      co2Ppm: 1510,
      humidityPercent: 47,
      temperatureC: 26.1,
      smokeUgM3: 0,
      ventilation: "Limited",
      sourceEvent: scenario,
      createdAt,
    };
  }
  if (scenario === "Sensor Offline") {
    return {
      id: `READ-${Date.now()}`,
      roomId: "living-room",
      roomName: "Living Room",
      status: "Offline",
      co2Ppm: 0,
      humidityPercent: 0,
      temperatureC: 0,
      smokeUgM3: 0,
      ventilation: "Poor",
      sourceEvent: scenario,
      createdAt,
    };
  }
  if (scenario === "Poor Ventilation") {
    return {
      id: `READ-${Date.now()}`,
      roomId: "kitchen",
      roomName: "Kitchen",
      status: "Warning",
      co2Ppm: 980,
      humidityPercent: 64,
      temperatureC: 29.3,
      smokeUgM3: 0,
      ventilation: "Off",
      sourceEvent: scenario,
      createdAt,
    };
  }
  return {
    id: `READ-${Date.now()}`,
    roomId: "living-room",
    roomName: "Living Room",
    status: "Good",
    co2Ppm: 438,
    humidityPercent: 49,
    temperatureC: 26.2,
    smokeUgM3: 0,
    ventilation: "Optimal",
    sourceEvent: scenario,
    createdAt,
  };
}

function createScenarioAlert(scenario: Exclude<DemoScenario, "Normal Reading">, createdAt: string): Alert {
  if (scenario === "Smoke Detected") {
    return {
      id: `ALT-${Date.now()}`,
      title: "Smoke detected in Kitchen",
      location: "Kitchen",
      roomId: "kitchen",
      riskLevel: "Critical",
      status: "New",
      detectedAt: createdAt,
      updatedAt: createdAt,
      sourceDevice: "Kitchen Smoke/Gas Sensor",
      description: "High smoke levels were detected near the cooking area.",
      recommendedAction: "Turn on ventilation and check the area now.",
      notes: [],
    };
  }
  if (scenario === "High CO2") {
    return {
      id: `ALT-${Date.now()}`,
      title: "High CO2 in Bedroom",
      location: "Bedroom",
      roomId: "bedroom",
      riskLevel: "Warning",
      status: "New",
      detectedAt: createdAt,
      updatedAt: createdAt,
      sourceDevice: "Bedroom CO2 Sensor",
      description: "CO2 rose above the comfort range in the bedroom.",
      recommendedAction: "Open a window or increase ventilation, then recheck the room in 15 minutes.",
      notes: [],
    };
  }
  if (scenario === "Sensor Offline") {
    return {
      id: `ALT-${Date.now()}`,
      title: "Living Room sensor offline",
      location: "Living Room",
      roomId: "living-room",
      riskLevel: "Offline",
      status: "New",
      detectedAt: createdAt,
      updatedAt: createdAt,
      sourceDevice: "Living Room Air Sensor",
      description: "The living room sensor stopped sending updates.",
      recommendedAction: "Check battery level and Wi-Fi connection, then mark the device checked.",
      notes: [],
    };
  }
  return {
    id: `ALT-${Date.now()}`,
    title: "Poor ventilation in Kitchen",
    location: "Kitchen",
    roomId: "kitchen",
    riskLevel: "Warning",
    status: "New",
    detectedAt: createdAt,
    updatedAt: createdAt,
    sourceDevice: "Smart Ventilation Fan",
    description: "Kitchen airflow is limited and the fan is not running.",
    recommendedAction: "Turn on ventilation fan and open windows if safe.",
    notes: [],
  };
}

function updateRoomForScenario(room: AppData["rooms"][number], scenario: DemoScenario) {
  if (scenario === "Smoke Detected" && room.id === "kitchen") {
    return { ...room, status: "Critical" as const, mainReading: "Smoke 215", co2Ppm: 1280, humidityPercent: 58, temperatureC: 31.2, smokeGas: "Warning" as const, summary: "Smoke detected. Check the kitchen immediately." };
  }
  if (scenario === "High CO2" && room.id === "bedroom") {
    return { ...room, status: "Warning" as const, mainReading: "CO2 1510 ppm", co2Ppm: 1510, summary: "CO2 is high. Increase ventilation." };
  }
  if (scenario === "Sensor Offline" && room.id === "living-room") {
    return { ...room, status: "Offline" as const, mainReading: "Sensor offline", summary: "Air sensor has stopped sending updates." };
  }
  if (scenario === "Poor Ventilation" && room.id === "kitchen") {
    return { ...room, status: "Warning" as const, mainReading: "Ventilation off", co2Ppm: 980, humidityPercent: 64, summary: "Airflow is limited. Turn on ventilation." };
  }
  return room;
}

function updateDeviceForScenario(device: AppData["devices"][number], scenario: DemoScenario, lastChecked: string) {
  if (scenario === "Smoke Detected" && device.id === "dev-kitchen-smoke") return { ...device, status: "Warning" as const, latestReading: "Smoke detected", lastChecked };
  if (scenario === "Smoke Detected" && device.id === "dev-kitchen-fan") return { ...device, status: "Offline" as const, latestReading: "Off", signalStrength: "No signal", lastChecked };
  if (scenario === "High CO2" && device.id === "dev-bedroom-co2") return { ...device, status: "Warning" as const, latestReading: "CO2 1510 ppm", lastChecked };
  if (scenario === "Sensor Offline" && device.id === "dev-living-air") return { ...device, status: "Offline" as const, latestReading: "No signal", signalStrength: "No signal", lastChecked };
  if (scenario === "Poor Ventilation" && device.id === "dev-kitchen-fan") return { ...device, status: "Warning" as const, latestReading: "Off", lastChecked };
  return device;
}
