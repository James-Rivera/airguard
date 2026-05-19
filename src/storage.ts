import AsyncStorage from "@react-native-async-storage/async-storage";
import { createInitialData } from "./data";
import type { AppData } from "./types";

const DATA_KEY = "airguard:native:data:v1";

export async function loadAppData(): Promise<AppData> {
  const fallback = createInitialData();
  try {
    const raw = await AsyncStorage.getItem(DATA_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<AppData>;
    if (!Array.isArray(parsed.rooms) || !Array.isArray(parsed.alerts)) return fallback;
    return parsed as AppData;
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
