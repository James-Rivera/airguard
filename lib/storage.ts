import { createInitialData } from "./mock-data";
import type { AppData } from "./types";

export const APP_DATA_KEY = "airguard:data:v1";
export const ROLE_KEY = "airguard:role";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getData<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  const raw = window.localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveData<T>(key: string, value: T) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function seedInitialData() {
  if (!isBrowser()) return createInitialData();
  const existing = window.localStorage.getItem(APP_DATA_KEY);
  if (!existing) {
    const data = createInitialData();
    saveData(APP_DATA_KEY, data);
    return data;
  }
  return getData(APP_DATA_KEY, createInitialData());
}

export function readAppData(): AppData {
  return getData(APP_DATA_KEY, createInitialData());
}

export function writeAppData(data: AppData) {
  saveData(APP_DATA_KEY, data);
}

export function updateAppData(updater: (data: AppData) => AppData): AppData {
  const next = updater(readAppData());
  writeAppData(next);
  return next;
}

export function resetData() {
  const next = createInitialData();
  writeAppData(next);
  return next;
}
