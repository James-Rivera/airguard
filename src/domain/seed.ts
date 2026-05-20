import type { Device, Room } from "./models";

const now = "2026-05-19T08:15:00+08:00";

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

export const menuItems = [
  { label: "Home Settings", detail: "Home name and address", icon: "settings" },
  { label: "Rooms", detail: "Manage monitored rooms", icon: "rooms" },
  { label: "Devices", detail: "Pair and manage sensors", icon: "device" },
  { label: "Risks", detail: "Unsafe conditions and safety warnings", icon: "alert" },
  { label: "Reports", detail: "Air quality summary and history", icon: "note" },
  { label: "Activity", detail: "Recent actions and system events", icon: "note" },
  { label: "Safety Checklist", detail: "Readiness tasks for the home", icon: "check" },
];
