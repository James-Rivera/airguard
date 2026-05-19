import AsyncStorage from "@react-native-async-storage/async-storage";
import { createInitialData } from "./data";
import type { AppData, Session } from "./types";

const DATA_KEY = "airguard:native:data:v2";
export const SESSION_KEY = "airguard.session";

export async function loadAppData(): Promise<AppData> {
  const fallback = createInitialData();
  try {
    const raw = await AsyncStorage.getItem(DATA_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<AppData>;
    if (!parsed.home || !Array.isArray(parsed.rooms) || !Array.isArray(parsed.alerts)) return fallback;
    return normalizeAppData(parsed, fallback);
  } catch {
    return fallback;
  }
}

export async function saveAppData(data: AppData) {
  await AsyncStorage.setItem(DATA_KEY, JSON.stringify(data));
}

export async function resetAppData(): Promise<AppData> {
  const data = createInitialData();
  await saveAppData(data);
  return data;
}

export async function loadSession(): Promise<Session | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Session>;
    if (!parsed.userId || !parsed.name || !parsed.email || !parsed.role || !parsed.homeName || !parsed.loginAt || !parsed.isDemo) return null;
    return parsed as Session;
  } catch {
    return null;
  }
}

export async function saveSession(session: Session) {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function clearSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}

function normalizeAppData(parsed: Partial<AppData>, fallback: AppData): AppData {
  return {
    ...fallback,
    ...parsed,
    selectedAccountId: parsed.selectedAccountId ?? fallback.selectedAccountId,
    home: { ...fallback.home, ...parsed.home },
    reportGeneratedAt: parsed.reportGeneratedAt ?? fallback.reportGeneratedAt,
    rooms: mergeById(fallback.rooms, parsed.rooms),
    devices: mergeById(fallback.devices, parsed.devices),
    readings: Array.isArray(parsed.readings) ? parsed.readings : fallback.readings,
    alerts: Array.isArray(parsed.alerts) ? parsed.alerts : fallback.alerts,
    activityItems: Array.isArray(parsed.activityItems) ? parsed.activityItems : fallback.activityItems,
    risks: mergeById(fallback.risks, parsed.risks),
    checklistItems: mergeKnownById(fallback.checklistItems, parsed.checklistItems),
  };
}

function mergeById<T extends { id: string }>(fallbackItems: T[], storedItems?: Partial<T>[]): T[] {
  if (!Array.isArray(storedItems)) return fallbackItems;
  const merged = storedItems.map((item) => {
    const fallback = fallbackItems.find((entry) => entry.id === item.id);
    return fallback ? ({ ...fallback, ...item } as T) : (item as T);
  });
  const storedIds = new Set(merged.map((item) => item.id));
  return [...merged, ...fallbackItems.filter((item) => !storedIds.has(item.id))];
}

function mergeKnownById<T extends { id: string }>(fallbackItems: T[], storedItems?: Partial<T>[]): T[] {
  if (!Array.isArray(storedItems)) return fallbackItems;
  return fallbackItems.map((fallback) => {
    const stored = storedItems.find((item) => item.id === fallback.id);
    return stored ? ({ ...fallback, ...stored } as T) : fallback;
  });
}
