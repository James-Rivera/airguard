import type { Alert, Device, Home, Reading, Room, User } from "./models";

export const demoUser: User = {
  id: "user-admin",
  name: "Carlo Rivera",
  role: "administrator",
};

export const demoHome: Home = {
  id: "home-rivera",
  name: "Rivera Residence",
  address: "Sto. Tomas, Batangas",
  roomIds: ["living-room", "kitchen", "bedroom", "dining-room", "bathroom"],
};

export const rooms: Room[] = [
  { id: "living-room", name: "Living Room", icon: "living-room", status: "good", deviceIds: ["dev-living-air"] },
  { id: "kitchen", name: "Kitchen", icon: "kitchen", status: "critical", deviceIds: ["dev-kitchen-air", "dev-kitchen-fan", "dev-kitchen-smoke"] },
  { id: "bedroom", name: "Bedroom", icon: "bedroom", status: "offline", deviceIds: ["dev-bedroom-air"] },
  { id: "dining-room", name: "Dining Room", icon: "dining-room", status: "good", deviceIds: ["dev-dining-air"] },
  { id: "bathroom", name: "Bathroom", icon: "bathroom", status: "good", deviceIds: ["dev-bath-humidity"] },
];

export const devices: Device[] = [
  { id: "dev-living-air", roomId: "living-room", name: "Air Sensor", type: "air-sensor", status: "online", batteryLevel: 84, lastUpdatedMinutesAgo: 2 },
  { id: "dev-kitchen-air", roomId: "kitchen", name: "Air Sensor", type: "air-sensor", status: "online", batteryLevel: 88, lastUpdatedMinutesAgo: 1 },
  { id: "dev-kitchen-fan", roomId: "kitchen", name: "Ventilation Fan", type: "ventilation-fan", status: "online", lastUpdatedMinutesAgo: 1, powerConnected: true },
  { id: "dev-kitchen-smoke", roomId: "kitchen", name: "Smoke Detector", type: "smoke-detector", status: "online", batteryLevel: 91, lastUpdatedMinutesAgo: 1 },
  { id: "dev-bedroom-air", roomId: "bedroom", name: "Air Sensor", type: "air-sensor", status: "offline", batteryLevel: 22, lastUpdatedMinutesAgo: 34 },
  { id: "dev-dining-air", roomId: "dining-room", name: "Air Sensor", type: "air-sensor", status: "online", batteryLevel: 79, lastUpdatedMinutesAgo: 4 },
  { id: "dev-bath-humidity", roomId: "bathroom", name: "Humidity Sensor", type: "air-sensor", status: "online", batteryLevel: 68, lastUpdatedMinutesAgo: 6 },
  { id: "dev-hall-alarm", roomId: "living-room", name: "Home Alarm", type: "alarm", status: "online", lastUpdatedMinutesAgo: 2, powerConnected: true },
  { id: "dev-dining-fan", roomId: "dining-room", name: "Ventilation Fan", type: "ventilation-fan", status: "online", lastUpdatedMinutesAgo: 5, powerConnected: true },
];

export const readings: Reading[] = [
  { id: "read-living-temp", roomId: "living-room", label: "Temperature", type: "temperature", value: 26, unit: "C", statusLabel: "Normal", status: "good" },
  { id: "read-living-co2", roomId: "living-room", label: "CO2", type: "co2", value: 420, unit: "ppm", statusLabel: "Good", status: "good" },
  { id: "read-living-smoke", roomId: "living-room", label: "Smoke", type: "smoke", value: 0, unit: "ug/m3", statusLabel: "Clear", status: "good" },
  { id: "read-living-humidity", roomId: "living-room", label: "Humidity", type: "humidity", value: 49, unit: "%", statusLabel: "Normal", status: "good" },
  { id: "read-kitchen-smoke", roomId: "kitchen", label: "Smoke", type: "smoke", value: 286, unit: "ug/m3", statusLabel: "Critical", status: "critical" },
  { id: "read-kitchen-co2", roomId: "kitchen", label: "CO2", type: "co2", value: 1120, unit: "ppm", statusLabel: "High", status: "warning" },
  { id: "read-kitchen-temp", roomId: "kitchen", label: "Temperature", type: "temperature", value: 31, unit: "C", statusLabel: "Warm", status: "warning" },
  { id: "read-kitchen-humidity", roomId: "kitchen", label: "Humidity", type: "humidity", value: 54, unit: "%", statusLabel: "Normal", status: "good" },
  { id: "read-bedroom-co2", roomId: "bedroom", label: "CO2", type: "co2", value: 0, unit: "ppm", statusLabel: "No signal", status: "offline" },
  { id: "read-dining-co2", roomId: "dining-room", label: "CO2", type: "co2", value: 456, unit: "ppm", statusLabel: "Good", status: "good" },
  { id: "read-bath-humidity", roomId: "bathroom", label: "Humidity", type: "humidity", value: 52, unit: "%", statusLabel: "Normal", status: "good" },
];

export const alerts: Alert[] = [
  {
    id: "alert-kitchen-smoke",
    roomId: "kitchen",
    deviceId: "dev-kitchen-smoke",
    title: "Smoke detected in Kitchen",
    roomName: "Kitchen",
    message: "Smoke levels rose above the safety threshold near the cooking area.",
    severity: "critical",
    createdAt: "2026-05-19T08:12:00+08:00",
    recommendedAction: "Check the kitchen and turn on ventilation",
  },
  {
    id: "alert-bedroom-offline",
    roomId: "bedroom",
    deviceId: "dev-bedroom-air",
    title: "Bedroom sensor offline",
    roomName: "Bedroom",
    message: "The bedroom air sensor has not reported in 34 minutes.",
    severity: "active",
    createdAt: "2026-05-19T07:48:00+08:00",
    recommendedAction: "Check battery level and reconnect the bedroom sensor",
  },
  {
    id: "alert-co2-resolved",
    roomId: "living-room",
    deviceId: "dev-living-air",
    title: "CO2 returned to normal",
    roomName: "Living Room",
    message: "Ventilation returned the living room CO2 level to a safe range.",
    severity: "resolved",
    createdAt: "2026-05-18T21:25:00+08:00",
    recommendedAction: "No action needed",
  },
];

export const menuItems = [
  { label: "Risks", detail: "Home safety risk overview", icon: "!" },
  { label: "Activity", detail: "Recent actions and system events", icon: "N" },
  { label: "Safety Checklist", detail: "Readiness tasks for the home", icon: "✓" },
  { label: "Reports", detail: "Safety summaries and snapshots", icon: "R" },
  { label: "Settings", detail: "Account and app preferences", icon: "S" },
];
