import type { Device, Reading, Room, SafetyStatus } from "@/domain/models";
import type { DemoScenarioType, ScenarioRecordsAffected, ScenarioRunResult, ScenarioTargetInput } from "@/domain/scenarios";
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

export async function runDemoScenario(homeId: string, type: DemoScenarioType, target: ScenarioTargetInput = {}): Promise<ScenarioRunResult> {
  if (type === "normal-reading") return runNormalReading(homeId, type, false, target);
  if (type === "reset-to-normal") return runNormalReading(homeId, type, true, target);
  if (type === "high-co2") return runHighCo2(homeId, target);
  if (type === "smoke-detected") return runSmokeDetected(homeId, target);
  if (type === "sensor-offline") return runSensorOffline(homeId, target);
  return runHumidityTemperatureWarning(homeId, target);
}

async function runNormalReading(homeId: string, type: DemoScenarioType, reset: boolean, target: ScenarioTargetInput) {
  const { rooms, devices } = await loadHomeTargets(homeId);
  if (rooms.length === 0) throw new Error("Add a room before applying sensor events.");

  const hasExplicitTarget = Boolean(target.roomId || target.deviceId);
  const resolvedTarget = hasExplicitTarget ? resolveScenarioTarget(rooms, devices, "air", target) : undefined;
  const roomsToUpdate = resolvedTarget ? [resolvedTarget.room] : rooms;
  const affected = emptyAffected();

  if (reset) {
    const resolvedAlerts = await alertService.resolveActiveAlerts(homeId, resolvedTarget?.room.id);
    affected.resolvedAlerts += resolvedAlerts.length;
  }

  for (const room of roomsToUpdate) {
    const roomDevices = devices.filter((item) => item.roomId === room.id);
    const selectedDevice = resolvedTarget?.room.id === room.id ? resolvedTarget.device : undefined;
    const devicesToUpdate = selectedDevice ? [selectedDevice] : roomDevices;
    await roomService.updateRoomStatus(room.id, "good");
    affected.rooms += 1;

    for (const device of devicesToUpdate) {
      await deviceService.updateDeviceStatus(device.id, "online");
      await deviceService.updateDeviceSafetyStatus(device.id, "good");
      affected.devices += 1;
    }

    const readingDevice = selectedDevice ?? roomDevices[0];
    affected.readings += await insertRoomReadings(homeId, room.id, readingDevice?.id, [
      reading("co2", 430, "ppm", "good", "Good"),
      reading("humidity", 49, "%", "good", "Normal"),
      reading("temperature", 24, "C", "good", "Comfortable"),
      reading("smoke", 0, "ug/m3", "good", "Clear"),
    ]);
  }

  const meta = getDemoScenarioMeta(type);
  const targetDescription = resolvedTarget ? `${resolvedTarget.room.name} readings were returned to normal.` : "Home readings, devices, and active alerts were returned to normal.";
  await activityService.createActivityLog(homeId, "demo", meta.title, reset ? targetDescription : "Healthy readings were recorded for monitored rooms.");
  affected.activityLogs += 1;

  return buildRunResult(homeId, type, resolvedTarget?.room, resolvedTarget?.device, affected);
}

async function runHighCo2(homeId: string, targetInput: ScenarioTargetInput) {
  const target = await getScenarioTarget(homeId, "air", targetInput);
  const affected = emptyAffected();

  await markWarning(target.room, target.device, affected);
  affected.readings += await insertRoomReadings(homeId, target.room.id, target.device?.id, [reading("co2", 1180, "ppm", "warning", "High")]);
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
  affected.alerts += 1;
  await activityService.createActivityLog(homeId, "demo", getDemoScenarioMeta("high-co2").title, `${target.room.name} received a high CO2 warning.`);
  affected.activityLogs += 1;

  return buildRunResult(homeId, "high-co2", target.room, target.device, affected);
}

async function runSmokeDetected(homeId: string, targetInput: ScenarioTargetInput) {
  const target = await getScenarioTarget(homeId, "smoke", targetInput);
  const affected = emptyAffected();

  await roomService.updateRoomStatus(target.room.id, "critical");
  affected.rooms += 1;
  if (target.device) {
    await deviceService.updateDeviceStatus(target.device.id, "online");
    await deviceService.updateDeviceSafetyStatus(target.device.id, "critical");
    affected.devices += 1;
  }
  affected.readings += await insertRoomReadings(homeId, target.room.id, target.device?.id, [
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
  affected.alerts += 1;
  await activityService.createActivityLog(homeId, "demo", getDemoScenarioMeta("smoke-detected").title, `${target.room.name} received a critical smoke alert.`);
  affected.activityLogs += 1;

  return buildRunResult(homeId, "smoke-detected", target.room, target.device, affected);
}

async function runSensorOffline(homeId: string, targetInput: ScenarioTargetInput) {
  const target = await getScenarioTarget(homeId, "device", targetInput);
  if (!target.device) throw new Error("Add a device before applying the sensor offline event.");
  const affected = emptyAffected();

  await roomService.updateRoomStatus(target.room.id, "offline");
  affected.rooms += 1;
  await deviceService.updateDeviceStatus(target.device.id, "offline");
  await deviceService.updateDeviceSafetyStatus(target.device.id, "offline");
  affected.devices += 1;
  affected.readings += await insertRoomReadings(homeId, target.room.id, target.device.id, [reading("co2", 0, "ppm", "offline", "Offline")]);
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
  affected.alerts += 1;
  await activityService.createActivityLog(homeId, "demo", getDemoScenarioMeta("sensor-offline").title, `${target.device.name} was marked offline.`);
  affected.activityLogs += 1;

  return buildRunResult(homeId, "sensor-offline", target.room, target.device, affected);
}

async function runHumidityTemperatureWarning(homeId: string, targetInput: ScenarioTargetInput) {
  const target = await getScenarioTarget(homeId, "air", targetInput);
  const affected = emptyAffected();

  await markWarning(target.room, target.device, affected);
  affected.readings += await insertRoomReadings(homeId, target.room.id, target.device?.id, [
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
  affected.alerts += 1;
  await activityService.createActivityLog(homeId, "demo", getDemoScenarioMeta("humidity-temperature-warning").title, `${target.room.name} received a comfort warning.`);
  affected.activityLogs += 1;

  return buildRunResult(homeId, "humidity-temperature-warning", target.room, target.device, affected);
}

async function getScenarioTarget(homeId: string, preference: "air" | "smoke" | "device", target: ScenarioTargetInput): Promise<ScenarioTarget> {
  const { rooms, devices } = await loadHomeTargets(homeId);
  if (rooms.length === 0) throw new Error("Add a room before applying sensor events.");

  return resolveScenarioTarget(rooms, devices, preference, target);
}

async function loadHomeTargets(homeId: string) {
  const [rooms, devices] = await Promise.all([roomService.getRooms(homeId), deviceService.getDevices(homeId)]);
  return { rooms, devices };
}

function resolveScenarioTarget(rooms: Room[], devices: Device[], preference: "air" | "smoke" | "device", target: ScenarioTargetInput): ScenarioTarget {
  if (target.deviceId) {
    const selectedDevice = devices.find((device) => device.id === target.deviceId);
    if (!selectedDevice) throw new Error("Selected device is not available for this home.");

    const selectedRoom = target.roomId
      ? rooms.find((room) => room.id === target.roomId)
      : rooms.find((room) => room.id === selectedDevice.roomId);
    if (!selectedRoom) throw new Error("Selected room is not available for this home.");
    if (selectedDevice.roomId !== selectedRoom.id) throw new Error("Selected device is not assigned to the selected room.");

    return { rooms, devices, room: selectedRoom, device: selectedDevice };
  }

  if (target.roomId) {
    const selectedRoom = rooms.find((room) => room.id === target.roomId);
    if (!selectedRoom) throw new Error("Selected room is not available for this home.");
    return { rooms, devices, room: selectedRoom, device: chooseDevice(devices, selectedRoom, preference, false) };
  }

  const room = chooseRoom(rooms, preference);
  return { rooms, devices, room, device: chooseDevice(devices, room, preference, preference === "device") };
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

function chooseDevice(devices: Device[], room: Room, preference: "air" | "smoke" | "device", allowAnyDevice: boolean) {
  const roomDevices = devices.filter((device) => device.roomId === room.id);
  if (preference === "smoke") return roomDevices.find((device) => device.type === "smoke-detector") ?? roomDevices[0];
  if (preference === "air") return roomDevices.find((device) => device.type === "air-sensor" || device.type === "co2-sensor") ?? roomDevices[0];
  return roomDevices[0] ?? (allowAnyDevice ? devices[0] : undefined);
}

async function markWarning(room: Room, device: Device | undefined, affected: ScenarioRecordsAffected) {
  await roomService.updateRoomStatus(room.id, "warning");
  affected.rooms += 1;
  if (device) {
    await deviceService.updateDeviceStatus(device.id, "online");
    await deviceService.updateDeviceSafetyStatus(device.id, "warning");
    affected.devices += 1;
  }
}

async function insertRoomReadings(homeId: string, roomId: string, deviceId: string | undefined, readings: Array<Omit<ReadingInput, "homeId" | "roomId" | "deviceId">>) {
  let inserted = 0;
  for (const item of readings) {
    await readingService.insertReading({ homeId, roomId, deviceId, ...item });
    inserted += 1;
  }
  return inserted;
}

function emptyAffected(): ScenarioRecordsAffected {
  return {
    rooms: 0,
    devices: 0,
    readings: 0,
    alerts: 0,
    resolvedAlerts: 0,
    activityLogs: 0,
  };
}

function buildRunResult(
  homeId: string,
  type: DemoScenarioType,
  room: Room | undefined,
  device: Device | undefined,
  recordsAffected: ScenarioRecordsAffected,
): ScenarioRunResult {
  return {
    scenarioType: type,
    title: getDemoScenarioMeta(type).title,
    homeId,
    roomId: room?.id,
    roomName: room?.name,
    deviceId: device?.id,
    deviceName: device?.name,
    appliedAt: new Date().toISOString(),
    recordsAffected,
  };
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
