import type { ActivityLog, AirGuardData, Alert, Device, Home, Reading, Room, User } from "./models";

export const demoUser: User = {
  id: "user-carlo",
  name: "Carlo Rivera",
  email: "homeowner@airguard.demo",
  role: "administrator",
};

const now = "2026-05-19T08:15:00+08:00";

export const demoHome: Home = {
  id: "home-rivera",
  name: "Rivera Residence",
  address: "Sto. Tomas, Batangas",
  createdAt: now,
};

export const demoRooms: Room[] = [
  { id: "living-room", name: "Living Room", icon: "living-room", status: "good", createdAt: now },
  { id: "kitchen", name: "Kitchen", icon: "kitchen", status: "good", createdAt: now },
  { id: "bedroom", name: "Bedroom", icon: "bedroom", status: "good", createdAt: now },
  { id: "bathroom", name: "Bathroom", icon: "bathroom", status: "good", createdAt: now },
];

export const demoDevices: Device[] = [
  { id: "dev-living-air", roomId: "living-room", name: "Living Room Air Sensor", type: "air-sensor", status: "online", batteryLevel: 84, lastUpdatedMinutesAgo: 2 },
  { id: "dev-kitchen-smoke", roomId: "kitchen", name: "Kitchen Smoke Detector", type: "smoke-detector", status: "online", batteryLevel: 91, lastUpdatedMinutesAgo: 1 },
  { id: "dev-kitchen-fan", roomId: "kitchen", name: "Kitchen Ventilation Fan", type: "ventilation-fan", status: "online", powerConnected: true, lastUpdatedMinutesAgo: 1 },
  { id: "dev-bedroom-co2", roomId: "bedroom", name: "Bedroom CO2 Sensor", type: "co2-sensor", status: "online", batteryLevel: 76, lastUpdatedMinutesAgo: 5 },
];

export const demoReadings: Reading[] = [
  { id: "read-living-temp", roomId: "living-room", deviceId: "dev-living-air", label: "Temperature", type: "temperature", value: 26, unit: "C", statusLabel: "Normal", status: "good", createdAt: now },
  { id: "read-living-co2", roomId: "living-room", deviceId: "dev-living-air", label: "CO2", type: "co2", value: 420, unit: "ppm", statusLabel: "Good", status: "good", createdAt: now },
  { id: "read-living-humidity", roomId: "living-room", deviceId: "dev-living-air", label: "Humidity", type: "humidity", value: 49, unit: "%", statusLabel: "Normal", status: "good", createdAt: now },
  { id: "read-kitchen-smoke", roomId: "kitchen", deviceId: "dev-kitchen-smoke", label: "Smoke", type: "smoke", value: 0, unit: "ug/m3", statusLabel: "Clear", status: "good", createdAt: now },
  { id: "read-kitchen-co2", roomId: "kitchen", deviceId: "dev-kitchen-smoke", label: "CO2", type: "co2", value: 472, unit: "ppm", statusLabel: "Good", status: "good", createdAt: now },
  { id: "read-bedroom-co2", roomId: "bedroom", deviceId: "dev-bedroom-co2", label: "CO2", type: "co2", value: 526, unit: "ppm", statusLabel: "Good", status: "good", createdAt: now },
];

export const demoAlerts: Alert[] = [
  {
    id: "alert-co2-resolved",
    roomId: "bedroom",
    deviceId: "dev-bedroom-co2",
    title: "CO2 returned to normal",
    roomName: "Bedroom",
    message: "Ventilation returned bedroom CO2 to a safe range.",
    severity: "warning",
    status: "resolved",
    createdAt: "2026-05-18T21:25:00+08:00",
    updatedAt: "2026-05-18T21:48:00+08:00",
    recommendedAction: "No action needed.",
  },
];

export const demoActivityLogs: ActivityLog[] = [
  {
    id: "activity-ready",
    category: "demo",
    title: "Home monitoring ready",
    description: "Rivera Residence sensors are online and reporting normal indoor air readings.",
    createdAt: now,
    status: "good",
  },
];

export const menuItems = [
  { label: "Home Settings", detail: "Home name and address", icon: "H" },
  { label: "Rooms", detail: "Manage monitored rooms", icon: "R" },
  { label: "Devices", detail: "Pair and manage sensors", icon: "D" },
  { label: "Activity", detail: "Recent actions and system events", icon: "A" },
  { label: "Safety Checklist", detail: "Readiness tasks for the home", icon: "OK" },
];

export function createSeedData(): AirGuardData {
  return {
    currentUser: null,
    session: null,
    onboardingComplete: true,
    onboarding: { homeCreated: true, roomsAdded: true, firstDeviceAdded: true },
    home: demoHome,
    rooms: demoRooms,
    devices: demoDevices,
    readings: demoReadings,
    alerts: demoAlerts,
    activityLogs: demoActivityLogs,
    pairingDraft: {},
  };
}

export function createEmptyAccountData(user: User, sessionStartedAt: string): AirGuardData {
  return {
    currentUser: user,
    session: { userId: user.id, email: user.email, startedAt: sessionStartedAt, isDemo: false },
    onboardingComplete: false,
    onboarding: { homeCreated: false, roomsAdded: false, firstDeviceAdded: false },
    home: null,
    rooms: [],
    devices: [],
    readings: [],
    alerts: [],
    activityLogs: [
      {
        id: `activity-account-${Date.now()}`,
        category: "account",
        title: "Account created",
        description: `${user.name} created a local AirGuard account.`,
        createdAt: sessionStartedAt,
        status: "good",
      },
    ],
    pairingDraft: {},
  };
}
