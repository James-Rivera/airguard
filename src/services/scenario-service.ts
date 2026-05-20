import type { Device, Reading, Room, SafetyStatus } from "@/domain/models";
import type { DemoScenarioType } from "@/domain/scenarios";
import { getDemoScenarioMeta } from "@/domain/scenarios";
import * as activityService from "./activity-service";
import * as alertService from "./alert-service";
import * as deviceService from "./device-service";
import * as readingService from "./reading-service";
import * as roomService from "./room-service";

type ScenarioTarget = {
  rooms: Room[];
  devices: Device[];
  room: Room;
  device?: Device;
};

export async function runDemoScenario(homeId: string, type: DemoScenarioType) {
  if (type === "normal-reading") return runNormalReading(homeId, false);
  if (type === "reset-to-normal") return runNormalReading(homeId, true);
  if (type === "high-co2") return runHighCo2(homeId);
  if (type === "smoke-detected") return runSmokeDetected(homeId);
  if (type === "sensor-offline") return runSensorOffline(homeId);
  return runHumidityTemperatureWarning(homeId);
}

async function runNormalReading(homeId: string, reset: boolean) {
  const { rooms, devices } = await loadHomeTargets(homeId);
  if (rooms.length === 0) throw new Error("Add a room before applying sensor events.");

  if (reset) await alertService.resolveActiveAlerts(homeId);

  for (const room of rooms) {
    const device = devices.find((item) => item.roomId === room.id);
    await roomService.updateRoomStatus(room.id, "good");
    if (device) {
      await deviceService.updateDeviceStatus(device.id, "online");
      await deviceService.updateDeviceSafetyStatus(device.id, "good");
    }
    await insertRoomReadings(homeId, room.id, device?.id, [
      reading("co2", 430, "ppm", "good", "Good"),
      reading("humidity", 49, "%", "good", "Normal"),
      reading("temperature", 24, "C", "good", "Comfortable"),
      reading("smoke", 0, "ug/m3", "good", "Clear"),
    ]);
  }

  const meta = getDemoScenarioMeta(reset ? "reset-to-normal" : "normal-reading");
  await activityService.createActivityLog(homeId, "demo", meta.title, reset ? "Home readings, devices, and active alerts were reset to normal." : "Healthy readings were recorded for monitored rooms.");
}

async function runHighCo2(homeId: string) {
  const target = await getScenarioTarget(homeId, "air");
  await markWarning(target.room, target.device);
  await insertRoomReadings(homeId, target.room.id, target.device?.id, [reading("co2", 1180, "ppm", "warning", "High")]);
  await alertService.createAlert(
    {
      homeId,
      roomId: target.room.id,
      deviceId: target.device?.id,
      title: `High CO2 in ${target.room.name}`,
      message: "CO2 is above the recommended ventilation range.",
      severity: "warning",
      recommendedAction: "Open windows, improve airflow, and check ventilation in this room.",
    },
    target.room.name,
  );
  await activityService.createActivityLog(homeId, "demo", getDemoScenarioMeta("high-co2").title, `${target.room.name} received a high CO2 warning.`);
}

async function runSmokeDetected(homeId: string) {
  const target = await getScenarioTarget(homeId, "smoke");
  await roomService.updateRoomStatus(target.room.id, "critical");
  if (target.device) {
    await deviceService.updateDeviceStatus(target.device.id, "online");
    await deviceService.updateDeviceSafetyStatus(target.device.id, "critical");
  }
  await insertRoomReadings(homeId, target.room.id, target.device?.id, [
    reading("smoke", 286, "ug/m3", "critical", "Critical"),
    reading("co2", 1180, "ppm", "warning", "High"),
  ]);
  await alertService.createAlert(
    {
      homeId,
      roomId: target.room.id,
      deviceId: target.device?.id,
      title: `Smoke detected in ${target.room.name}`,
      message: "Smoke rose above the safety threshold.",
      severity: "critical",
      recommendedAction: "Check the room now, turn on ventilation, and move people away from smoke.",
    },
    target.room.name,
  );
  await activityService.createActivityLog(homeId, "demo", getDemoScenarioMeta("smoke-detected").title, `${target.room.name} received a critical smoke alert.`);
}

async function runSensorOffline(homeId: string) {
  const target = await getScenarioTarget(homeId, "device");
  if (!target.device) throw new Error("Add a device before applying the sensor offline event.");

  await roomService.updateRoomStatus(target.room.id, "offline");
  await deviceService.updateDeviceStatus(target.device.id, "offline");
  await deviceService.updateDeviceSafetyStatus(target.device.id, "offline");
  await insertRoomReadings(homeId, target.room.id, target.device.id, [reading("co2", 0, "ppm", "offline", "Offline")]);
  await alertService.createAlert(
    {
      homeId,
      roomId: target.room.id,
      deviceId: target.device.id,
      title: `${target.device.name} is offline`,
      message: "AirGuard has not received a recent sensor update from this device.",
      severity: "warning",
      recommendedAction: "Check the device power, battery, and room placement before relying on this room reading.",
    },
    target.room.name,
  );
  await activityService.createActivityLog(homeId, "demo", getDemoScenarioMeta("sensor-offline").title, `${target.device.name} was marked offline.`);
}

async function runHumidityTemperatureWarning(homeId: string) {
  const target = await getScenarioTarget(homeId, "air");
  await markWarning(target.room, target.device);
  await insertRoomReadings(homeId, target.room.id, target.device?.id, [
    reading("humidity", 72, "%", "warning", "High"),
    reading("temperature", 33, "C", "warning", "Warm"),
  ]);
  await alertService.createAlert(
    {
      homeId,
      roomId: target.room.id,
      deviceId: target.device?.id,
      title: `Comfort warning in ${target.room.name}`,
      message: "Humidity or temperature moved outside the recommended comfort range.",
      severity: "warning",
      recommendedAction: "Improve ventilation and check nearby heat or moisture sources.",
    },
    target.room.name,
  );
  await activityService.createActivityLog(homeId, "demo", getDemoScenarioMeta("humidity-temperature-warning").title, `${target.room.name} received a comfort warning.`);
}

async function getScenarioTarget(homeId: string, preference: "air" | "smoke" | "device"): Promise<ScenarioTarget> {
  const { rooms, devices } = await loadHomeTargets(homeId);
  if (rooms.length === 0) throw new Error("Add a room before applying sensor events.");

  const room = chooseRoom(rooms, preference);
  const device = chooseDevice(devices, room, preference);
  return { rooms, devices, room, device };
}

async function loadHomeTargets(homeId: string) {
  const [rooms, devices] = await Promise.all([roomService.getRooms(homeId), deviceService.getDevices(homeId)]);
  return { rooms, devices };
}

function chooseRoom(rooms: Room[], preference: "air" | "smoke" | "device") {
  if (preference === "smoke") {
    return rooms.find((room) => room.icon === "kitchen" || room.name.toLowerCase().includes("kitchen")) ?? rooms[0];
  }
  if (preference === "air") {
    return rooms.find((room) => room.icon === "living-room") ?? rooms.find((room) => room.icon === "bedroom") ?? rooms[0];
  }
  return rooms.find((room) => room.status !== "offline") ?? rooms[0];
}

function chooseDevice(devices: Device[], room: Room, preference: "air" | "smoke" | "device") {
  const roomDevices = devices.filter((device) => device.roomId === room.id);
  if (preference === "smoke") return roomDevices.find((device) => device.type === "smoke-detector") ?? roomDevices[0];
  if (preference === "air") return roomDevices.find((device) => device.type === "air-sensor" || device.type === "co2-sensor") ?? roomDevices[0];
  return roomDevices[0] ?? devices[0];
}

async function markWarning(room: Room, device?: Device) {
  await roomService.updateRoomStatus(room.id, "warning");
  if (device) {
    await deviceService.updateDeviceStatus(device.id, "online");
    await deviceService.updateDeviceSafetyStatus(device.id, "warning");
  }
}

async function insertRoomReadings(homeId: string, roomId: string, deviceId: string | undefined, readings: Array<Omit<ReadingInput, "homeId" | "roomId" | "deviceId">>) {
  for (const item of readings) {
    await readingService.insertReading({ homeId, roomId, deviceId, ...item });
  }
}

type ReadingInput = {
  homeId: string;
  roomId: string;
  deviceId?: string;
  type: Reading["type"];
  value: number;
  unit: string;
  status: SafetyStatus;
  statusLabel: string;
};

function reading(type: Reading["type"], value: number, unit: string, status: SafetyStatus, statusLabel: string) {
  return { type, value, unit, status, statusLabel };
}
