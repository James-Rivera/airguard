import type { AirGuardData, Alert, AlertSeverity, AlertStatus, Device, DeviceType, Reading, SafetyStatus } from "./models";

const rank: Record<SafetyStatus, number> = {
  good: 0,
  offline: 1,
  warning: 2,
  critical: 3,
};

export type AirRiskKind = "co2" | "smoke" | "humidity" | "offline" | "ventilation";

export type AirRisk = {
  id: string;
  kind: AirRiskKind;
  title: string;
  severity: AlertSeverity;
  roomId: string;
  roomName: string;
  measuredValue: string;
  explanation: string;
  recommendation: string;
  actionLabel: string;
  createdAt: string;
  alertId?: string;
  deviceId?: string;
};

export type ReportRange = "day" | "week" | "month";

export type ReportChartPoint = {
  label: string;
  value: number;
};

export type ReportMetric = {
  id: string;
  title: string;
  value: string;
  detail: string;
  status: SafetyStatus;
  kind: "smoke" | "co2" | "humidity" | "temperature" | "alert";
};

export type AirQualityReport = {
  rangeLabel: string;
  overallAqi: number | null;
  overallStatus: SafetyStatus;
  trendPercent: number;
  trendDirection: "better" | "worse" | "steady";
  chartPoints: ReportChartPoint[];
  cleanestRoom: {
    roomName: string;
    detail: string;
  };
  mostImproved: {
    roomName: string;
    detail: string;
  };
  metrics: ReportMetric[];
};

export function getRooms(state: AirGuardData) {
  return state.rooms.map((room) => ({ ...room, status: getRoomSafetyStatus(state, room.id) }));
}

export function getRoomById(state: AirGuardData, roomId: string) {
  return getRooms(state).find((room) => room.id === roomId);
}

export function getDevices(state: AirGuardData) {
  return state.devices;
}

export function getDeviceById(state: AirGuardData, deviceId: string) {
  return state.devices.find((device) => device.id === deviceId);
}

export function getDevicesByRoomId(state: AirGuardData, roomId: string) {
  return state.devices.filter((device) => device.roomId === roomId);
}

export function getReadingsByRoomId(state: AirGuardData, roomId: string) {
  return state.readings.filter((reading) => reading.roomId === roomId);
}

export function getReadingsByDeviceId(state: AirGuardData, deviceId: string) {
  const device = getDeviceById(state, deviceId);
  const deviceReadings = state.readings.filter((reading) => reading.deviceId === deviceId);
  if (deviceReadings.length > 0 || !device) return deviceReadings;
  return getReadingsByRoomId(state, device.roomId);
}

export function getLatestReadingForDevice(state: AirGuardData, deviceId: string): Reading | undefined {
  const readings = getReadingsByDeviceId(state, deviceId);
  return readings.find((reading) => reading.type === "co2") ?? readings.find((reading) => reading.type === "smoke") ?? readings[0];
}

export function getActiveAlerts(state: AirGuardData) {
  return state.alerts.filter((alert) => alert.status !== "resolved");
}

export function getCriticalAlerts(state: AirGuardData) {
  return getActiveAlerts(state).filter((alert) => alert.severity === "critical");
}

export function getResolvedAlerts(state: AirGuardData) {
  return state.alerts.filter((alert) => alert.status === "resolved");
}

export function getAlertsByFilter(state: AirGuardData, filter: "All" | "Active" | "Critical" | "Resolved") {
  if (filter === "Active") return getActiveAlerts(state);
  if (filter === "Critical") return getCriticalAlerts(state);
  if (filter === "Resolved") return getResolvedAlerts(state);
  return state.alerts;
}

export function getAlertById(state: AirGuardData, alertId: string) {
  return state.alerts.find((alert) => alert.id === alertId);
}

export function getDashboardSummary(state: AirGuardData) {
  const activeAlerts = getActiveAlerts(state);
  const criticalAlerts = getCriticalAlerts(state);
  return {
    home: state.home,
    user: state.currentUser,
    rooms: getRooms(state),
    readings: getDashboardReadings(state),
    activeAlerts,
    criticalAlerts,
    status: getHomeSafetyStatus(state),
  };
}

export function getDeviceSummary(state: AirGuardData) {
  const online = state.devices.filter((device) => device.status === "online").length;
  return {
    total: state.devices.length,
    online,
    offline: state.devices.length - online,
    rooms: state.rooms.length,
  };
}

export function getRoomSafetyStatus(state: AirGuardData, roomId: string): SafetyStatus {
  const activeAlertStatus = getActiveAlerts(state)
    .filter((alert) => alert.roomId === roomId)
    .reduce<SafetyStatus>((current, alert) => highest(current, alert.severity === "critical" ? "critical" : "warning"), "good");
  const readingStatus = getReadingsByRoomId(state, roomId).reduce<SafetyStatus>((current, reading) => highest(current, reading.status), "good");
  const hasOfflineDevice = getDevicesByRoomId(state, roomId).some((device) => device.status === "offline");
  const statuses: SafetyStatus[] = [activeAlertStatus, readingStatus, hasOfflineDevice ? "offline" : "good"];
  return statuses.reduce(highest, "good");
}

export function getRecentActivity(state: AirGuardData, limit = 8) {
  return [...state.activityLogs].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, limit);
}

export function getHomeSafetyStatus(state: AirGuardData): SafetyStatus {
  const statuses: SafetyStatus[] = state.rooms.map((room) => getRoomSafetyStatus(state, room.id));
  return statuses.reduce(highest, "good");
}

export function getAirRisks(state: AirGuardData): AirRisk[] {
  const roomsById = new Map(getRooms(state).map((room) => [room.id, room]));
  const risks: AirRisk[] = [];
  const seen = new Set<string>();

  function addRisk(risk: AirRisk) {
    const key = risk.deviceId && (risk.kind === "offline" || risk.kind === "ventilation") ? `${risk.kind}:device:${risk.deviceId}` : `${risk.kind}:room:${risk.roomId}`;
    if (seen.has(key)) return;
    seen.add(key);
    risks.push(risk);
  }

  for (const alert of getActiveAlerts(state)) {
    const roomReadings = getReadingsByRoomId(state, alert.roomId);
    addRisk(buildAlertRisk(alert, roomReadings, roomsById.get(alert.roomId)?.name ?? alert.roomName));
  }

  for (const reading of state.readings) {
    const kind = getRiskKindFromReading(reading);
    if (!kind) continue;
    const room = roomsById.get(reading.roomId);
    addRisk(buildReadingRisk(kind, reading, room?.name ?? "Room"));
  }

  for (const device of state.devices) {
    if (device.status !== "offline") continue;
    const room = roomsById.get(device.roomId);
    const kind: AirRiskKind = device.type === "ventilation-fan" ? "ventilation" : "offline";
    addRisk(buildDeviceRisk(kind, device, room?.name ?? "Room"));
  }

  return risks.sort((a, b) => {
    const severityDiff = severityRank(b.severity) - severityRank(a.severity);
    if (severityDiff !== 0) return severityDiff;
    return Date.parse(b.createdAt) - Date.parse(a.createdAt);
  });
}

export function getAirQualityReport(state: AirGuardData, range: ReportRange): AirQualityReport {
  const sourceReadings = state.readingHistory.length > 0 ? state.readingHistory : state.readings;
  const rangeReadings = readingsForRange(sourceReadings, range);
  const reportReadings = rangeReadings.length > 0 ? rangeReadings : sourceReadings;
  const chartPoints = buildReportChartPoints(state, reportReadings, range);
  const roomScores = getRoomAqiScores(state, reportReadings);
  const overallAqi = roomScores.length > 0 ? Math.round(average(roomScores.map((item) => item.aqi))) : chartPoints.length > 0 ? Math.round(average(chartPoints.map((item) => item.value))) : null;
  const trend = computeReportTrend(reportReadings);
  const cleanestRoom = roomScores[0];
  const mostImproved = getMostImprovedRoom(state, reportReadings, roomScores);

  return {
    rangeLabel: range === "day" ? "Today" : range === "week" ? "Last 7 days" : "Last 30 days",
    overallAqi,
    overallStatus: statusFromAqi(overallAqi),
    trendPercent: trend.percent,
    trendDirection: trend.direction,
    chartPoints,
    cleanestRoom: cleanestRoom ? { roomName: cleanestRoom.roomName, detail: `Avg AQI: ${cleanestRoom.aqi}` } : { roomName: "No rooms", detail: "Add rooms to build reports." },
    mostImproved,
    metrics: buildReportMetrics(state, reportReadings),
  };
}

export function getDeviceTypeLabel(type: DeviceType) {
  const labels: Record<DeviceType, string> = {
    "air-sensor": "Air Sensor",
    "smoke-detector": "Smoke Detector",
    "co2-sensor": "CO2 Sensor",
    "ventilation-fan": "Ventilation Fan",
    alarm: "Alarm",
  };
  return labels[type];
}

export function isSetupReady(state: AirGuardData) {
  return Boolean(state.home && state.rooms.length > 0 && state.devices.length > 0);
}

export function nextAlertStatus(status: AlertStatus): AlertStatus {
  if (status === "active") return "checking";
  if (status === "checking") return "resolved";
  return "resolved";
}

function getDashboardReadings(state: AirGuardData) {
  const deviceRoomIds = new Set(state.devices.map((device) => device.roomId));
  return state.readings.filter((reading) => deviceRoomIds.has(reading.roomId)).slice(0, 4);
}

function highest(a: SafetyStatus, b: SafetyStatus) {
  return rank[b] > rank[a] ? b : a;
}

function buildAlertRisk(alert: Alert, readings: Reading[], fallbackRoomName: string): AirRisk {
  const kind = getRiskKindFromAlert(alert, readings);
  const reading = getReadingForRiskKind(kind, readings);
  return {
    id: `alert-${alert.id}`,
    kind,
    title: riskTitle(kind),
    severity: alert.severity,
    roomId: alert.roomId,
    roomName: alert.roomName || fallbackRoomName,
    measuredValue: reading ? formatRiskReading(reading) : alert.status === "checking" ? "Checking" : "Active",
    explanation: alert.message || riskExplanation(kind, alert.severity),
    recommendation: alert.recommendedAction || riskRecommendation(kind, alert.severity),
    actionLabel: alert.status === "checking" ? "Review Check" : "Review Alert",
    createdAt: alert.createdAt,
    alertId: alert.id,
    deviceId: alert.deviceId,
  };
}

function buildReadingRisk(kind: AirRiskKind, reading: Reading, roomName: string): AirRisk {
  const severity: AlertSeverity = reading.status === "critical" ? "critical" : "warning";
  return {
    id: `reading-${reading.id}`,
    kind,
    title: riskTitle(kind),
    severity,
    roomId: reading.roomId,
    roomName,
    measuredValue: formatRiskReading(reading),
    explanation: riskExplanation(kind, severity),
    recommendation: riskRecommendation(kind, severity),
    actionLabel: "View Room",
    createdAt: reading.createdAt,
    deviceId: reading.deviceId,
  };
}

function buildDeviceRisk(kind: AirRiskKind, device: Device, roomName: string): AirRisk {
  return {
    id: `device-${device.id}`,
    kind,
    title: riskTitle(kind),
    severity: "warning",
    roomId: device.roomId,
    roomName,
    measuredValue: "Offline",
    explanation: kind === "ventilation" ? "The ventilation device is offline, which can reduce airflow during a safety event." : "AirGuard has not received a recent update from this sensor.",
    recommendation: kind === "ventilation" ? "Check power and restart ventilation before relying on this room." : "Check battery, power, and room placement for this sensor.",
    actionLabel: "Check Device",
    createdAt: new Date(Date.now() - device.lastUpdatedMinutesAgo * 60000).toISOString(),
    deviceId: device.id,
  };
}

function getRiskKindFromAlert(alert: Alert, readings: Reading[]): AirRiskKind {
  const text = `${alert.title} ${alert.message} ${alert.recommendedAction}`.toLowerCase();
  if (text.includes("smoke")) return "smoke";
  if (text.includes("offline") || text.includes("sensor update")) return "offline";
  if (text.includes("humidity") || text.includes("comfort")) return "humidity";
  if (text.includes("co2")) return "co2";
  if (text.includes("ventilation") || text.includes("airflow") || text.includes("hvac")) return "ventilation";
  const readingKind = getRiskKindFromReading(readings.find((reading) => reading.status !== "good") ?? readings[0]);
  return readingKind ?? "ventilation";
}

function getRiskKindFromReading(reading?: Reading): AirRiskKind | null {
  if (!reading || reading.status === "good") return null;
  if (reading.status === "offline" || (reading.type === "co2" && reading.value <= 0)) return "offline";
  if (reading.type === "smoke") return "smoke";
  if (reading.type === "co2") return "co2";
  if (reading.type === "humidity") return "humidity";
  if (reading.type === "temperature") return "ventilation";
  return null;
}

function getReadingForRiskKind(kind: AirRiskKind, readings: Reading[]) {
  if (kind === "co2") return readings.find((reading) => reading.type === "co2");
  if (kind === "smoke") return readings.find((reading) => reading.type === "smoke");
  if (kind === "humidity") return readings.find((reading) => reading.type === "humidity");
  if (kind === "offline") return readings.find((reading) => reading.status === "offline");
  return readings.find((reading) => reading.status === "warning" || reading.status === "critical");
}

function riskTitle(kind: AirRiskKind) {
  if (kind === "co2") return "Elevated CO2 Levels";
  if (kind === "smoke") return "Smoke Detected";
  if (kind === "humidity") return "High Humidity";
  if (kind === "offline") return "Sensor Offline";
  return "Poor Ventilation";
}

function riskExplanation(kind: AirRiskKind, severity: AlertSeverity) {
  if (kind === "co2") return severity === "critical" ? "CO2 has exceeded the safe ventilation range and may cause drowsiness or poor air quality." : "CO2 is rising above the recommended ventilation range.";
  if (kind === "smoke") return "Smoke has been detected above the normal safety threshold.";
  if (kind === "humidity") return "Humidity is outside the recommended comfort range and can encourage mold growth if it stays high.";
  if (kind === "offline") return "A monitored sensor is not currently reporting reliable readings.";
  return "Airflow may be insufficient for this room based on recent readings or device status.";
}

function riskRecommendation(kind: AirRiskKind, severity: AlertSeverity) {
  if (kind === "co2") return severity === "critical" ? "Open windows immediately and turn on ventilation or the HVAC fan." : "Improve airflow and keep watching this room until CO2 returns to normal.";
  if (kind === "smoke") return "Check the room now, turn on ventilation, and move people away from smoke.";
  if (kind === "humidity") return "Run ventilation or a dehumidifier and recheck the room after levels settle.";
  if (kind === "offline") return "Check sensor battery, power, and placement before relying on this room.";
  return "Open windows or run ventilation, then review the latest readings.";
}

function formatRiskReading(reading: Reading) {
  const rounded = reading.type === "temperature" ? formatNumber(reading.value, 1) : String(Math.round(reading.value));
  const unit = reading.unit === "C" ? "C" : reading.unit;
  return `${rounded} ${unit}`;
}

function severityRank(severity: AlertSeverity) {
  return severity === "critical" ? 2 : 1;
}

function readingsForRange(readings: Reading[], range: ReportRange) {
  const days = range === "day" ? 1 : range === "week" ? 7 : 30;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const filtered = readings.filter((reading) => {
    const time = Date.parse(reading.createdAt);
    return Number.isFinite(time) && time >= cutoff;
  });
  return filtered.length > 0 ? filtered : readings;
}

function buildReportChartPoints(state: AirGuardData, readings: Reading[], range: ReportRange): ReportChartPoint[] {
  const sorted = [...readings].filter((reading) => Number.isFinite(Date.parse(reading.createdAt))).sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  if (sorted.length >= 2) {
    const maxPoints = range === "day" ? 5 : range === "week" ? 7 : 6;
    const stride = Math.max(1, Math.ceil(sorted.length / maxPoints));
    const sampled = sorted.filter((_, index) => index % stride === 0).slice(-maxPoints);
    return sampled.map((reading) => ({
      label: formatChartLabel(reading.createdAt, range),
      value: readingRiskScore(reading),
    }));
  }

  return getRoomAqiScores(state, readings.length > 0 ? readings : state.readings).slice(0, 7).map((room) => ({
    label: shortRoomLabel(room.roomName),
    value: room.aqi,
  }));
}

function getRoomAqiScores(state: AirGuardData, readings: Reading[]) {
  return getRooms(state)
    .map((room) => {
      const roomReadings = readings.filter((reading) => reading.roomId === room.id);
      const fallbackReadings = state.readings.filter((reading) => reading.roomId === room.id);
      const aqi = computeRoomAqi(roomReadings.length > 0 ? roomReadings : fallbackReadings, room.status);
      return aqi === null ? null : { roomId: room.id, roomName: room.name, aqi };
    })
    .filter((item): item is { roomId: string; roomName: string; aqi: number } => Boolean(item))
    .sort((a, b) => a.aqi - b.aqi);
}

function computeRoomAqi(readings: Reading[], status: SafetyStatus) {
  if (readings.length === 0) return null;
  const latestByType = new Map<Reading["type"], Reading>();
  for (const reading of readings) {
    const current = latestByType.get(reading.type);
    if (!current || Date.parse(reading.createdAt) > Date.parse(current.createdAt)) {
      latestByType.set(reading.type, reading);
    }
  }
  const scores = [...latestByType.values()].map(readingRiskScore);
  const statusLift = status === "critical" ? 18 : status === "warning" ? 8 : status === "offline" ? 14 : 0;
  return clampIndex(average(scores) + statusLift);
}

function readingRiskScore(reading: Reading) {
  let score = 20;
  if (reading.type === "co2") score = reading.value <= 700 ? 18 : reading.value <= 1100 ? 38 : reading.value <= 1800 ? 68 : 88;
  if (reading.type === "smoke") score = reading.value <= 12 ? 10 : reading.value <= 35 ? 36 : reading.value <= 100 ? 74 : 96;
  if (reading.type === "humidity") score = Math.min(80, Math.abs(reading.value - 45) * 1.7);
  if (reading.type === "temperature") score = Math.min(82, Math.abs(reading.value - 24) * 3.2);
  if (reading.status === "critical") score += 18;
  if (reading.status === "warning") score += 8;
  if (reading.status === "offline") score += 14;
  return clampIndex(score);
}

function computeReportTrend(readings: Reading[]) {
  if (readings.length < 2) return { percent: 0, direction: "steady" as const };
  const sorted = [...readings].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  const midpoint = Math.max(1, Math.floor(sorted.length / 2));
  const baseline = average(sorted.slice(0, midpoint).map(readingRiskScore));
  const recent = average(sorted.slice(midpoint).map(readingRiskScore));
  if (!Number.isFinite(baseline) || baseline <= 0) return { percent: 0, direction: "steady" as const };
  const percent = Math.round(((baseline - recent) / baseline) * 100);
  if (Math.abs(percent) < 2) return { percent: 0, direction: "steady" as const };
  return { percent: Math.abs(percent), direction: percent > 0 ? ("better" as const) : ("worse" as const) };
}

function getMostImprovedRoom(state: AirGuardData, readings: Reading[], roomScores: Array<{ roomId: string; roomName: string; aqi: number }>) {
  let best: { roomName: string; detail: string; improvement: number } | null = null;
  for (const room of getRooms(state)) {
    const roomReadings = readings.filter((reading) => reading.roomId === room.id).sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
    if (roomReadings.length < 2) continue;
    const first = average(roomReadings.slice(0, Math.max(1, Math.floor(roomReadings.length / 2))).map(readingRiskScore));
    const latest = average(roomReadings.slice(Math.max(1, Math.floor(roomReadings.length / 2))).map(readingRiskScore));
    const improvement = Math.round(first - latest);
    if (improvement > 0 && (!best || improvement > best.improvement)) {
      best = { roomName: room.name, detail: `-${improvement} AQI risk`, improvement };
    }
  }
  if (best) return { roomName: best.roomName, detail: best.detail };
  const fallback = roomScores.find((room) => room.aqi <= 45) ?? roomScores[0];
  return fallback ? { roomName: fallback.roomName, detail: "Needs more history" } : { roomName: "No trend yet", detail: "Apply sensor events to compare rooms." };
}

function buildReportMetrics(state: AirGuardData, readings: Reading[]): ReportMetric[] {
  const activeAlerts = getActiveAlerts(state);
  const pm25 = averageReading(readings, "smoke");
  const co2 = averageReading(readings, "co2");
  const humidity = averageReading(readings, "humidity");
  const temperature = averageReading(readings, "temperature");

  return [
    {
      id: "pm25",
      title: "PM2.5 Levels",
      value: pm25 ? `Avg ${Math.round(pm25.value)} ${pm25.unit}` : "No PM2.5 data",
      detail: metricDetail(pm25?.status),
      status: pm25?.status ?? "offline",
      kind: "smoke",
    },
    {
      id: "co2",
      title: "CO2 Levels",
      value: co2 ? `Avg ${Math.round(co2.value)} ${co2.unit}` : "No CO2 data",
      detail: metricDetail(co2?.status),
      status: co2?.status ?? "offline",
      kind: "co2",
    },
    {
      id: "humidity",
      title: "Humidity Trends",
      value: humidity ? `Avg ${Math.round(humidity.value)}${humidity.unit}` : "No humidity data",
      detail: metricDetail(humidity?.status),
      status: humidity?.status ?? "offline",
      kind: "humidity",
    },
    {
      id: "temperature",
      title: "Temperature",
      value: temperature ? `Avg ${formatNumber(temperature.value, 1)} C` : "No temperature data",
      detail: metricDetail(temperature?.status),
      status: temperature?.status ?? "offline",
      kind: "temperature",
    },
    {
      id: "alerts",
      title: "Alerts Summary",
      value: `${activeAlerts.length} active`,
      detail: `${getCriticalAlerts(state).length} critical, ${getResolvedAlerts(state).length} resolved`,
      status: getCriticalAlerts(state).length > 0 ? "critical" : activeAlerts.length > 0 ? "warning" : "good",
      kind: "alert",
    },
  ];
}

function averageReading(readings: Reading[], type: Reading["type"]) {
  const matches = readings.filter((reading) => reading.type === type);
  if (matches.length === 0) return null;
  const value = average(matches.map((reading) => reading.value));
  const status = matches.map((reading) => reading.status).reduce(highest, "good");
  return { value, unit: matches[0].unit === "C" ? "C" : matches[0].unit, status };
}

function metricDetail(status?: SafetyStatus) {
  if (status === "critical") return "Needs immediate attention";
  if (status === "warning") return "Outside recommended range";
  if (status === "offline") return "Awaiting readings";
  return "Within expected range";
}

function statusFromAqi(aqi: number | null): SafetyStatus {
  if (aqi === null) return "offline";
  if (aqi >= 70) return "critical";
  if (aqi >= 45) return "warning";
  return "good";
}

function formatChartLabel(value: string, range: ReportRange) {
  const date = new Date(value);
  if (range === "day") {
    const hour = date.getHours();
    if (hour === 0) return "12A";
    if (hour < 12) return `${hour}A`;
    if (hour === 12) return "12P";
    return `${hour - 12}P`;
  }
  if (range === "month") return `${date.getMonth() + 1}/${date.getDate()}`;
  return date.toLocaleDateString([], { weekday: "short" });
}

function shortRoomLabel(name: string) {
  const firstWord = name.trim().split(/\s+/)[0];
  return firstWord.length > 7 ? `${firstWord.slice(0, 6)}.` : firstWord;
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function clampIndex(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function formatNumber(value: number, maxFractionDigits: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(maxFractionDigits);
}
