import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AirGuardData, DeviceType, Home, User } from "@/domain/models";
import { demoDevices, demoRooms } from "@/domain/seed";
import * as activityService from "@/services/activity-service";
import * as alertService from "@/services/alert-service";
import * as authService from "@/services/auth-service";
import * as deviceService from "@/services/device-service";
import * as homeService from "@/services/home-service";
import * as profileService from "@/services/profile-service";
import * as readingService from "@/services/reading-service";
import * as roomService from "@/services/room-service";

type StoreActions = {
  bootstrapApp: () => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  loginDemo: (email?: string, password?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  loadHomeData: () => Promise<void>;
  createHome: (name: string, address?: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  addRoom: (name: string) => Promise<void>;
  startDevicePairing: (type?: DeviceType, roomId?: string) => Promise<void>;
  finishDevicePairing: () => Promise<void>;
  addDevice: (name: string, type?: DeviceType, roomId?: string) => Promise<void>;
  toggleDeviceStatus: (deviceId: string) => Promise<void>;
  simulateNormalReadings: () => Promise<void>;
  simulateWarningReadings: () => Promise<void>;
  simulateCriticalReadings: () => Promise<void>;
  triggerKitchenSmokeAlert: () => Promise<void>;
  startCheckingAlert: (alertId: string) => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
  resetDemoData: () => Promise<void>;
  resetAppData: () => Promise<void>;
  clearOnboarding: () => Promise<void>;
};

type StoreValue = {
  state: AirGuardData;
  isLoading: boolean;
  error: string | null;
  actions: StoreActions;
};

const AirGuardContext = createContext<StoreValue | undefined>(undefined);

export function AirGuardProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AirGuardData>(blankState());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function run<T>(operation: () => Promise<T>) {
    setError(null);
    try {
      return await operation();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      throw err;
    }
  }

  async function bootstrapApp() {
    setIsLoading(true);
    await run(async () => {
      const session = await authService.getSession();
      if (!session?.user) {
        setState(blankState());
        return;
      }
      const profile = (await profileService.getCurrentProfile()) ?? (await profileService.createProfileForUser());
      const activeHome = await homeService.getActiveHomeWithMembership();
      const nextBase = {
        ...blankState(),
        currentUser: profile,
        session: { userId: session.user.id, email: session.user.email ?? profile.email, startedAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : new Date().toISOString(), isDemo: false },
        onboardingComplete: profile.onboardingComplete,
        home: activeHome,
      };
      setState(nextBase);
      if (activeHome) {
        await loadHomeDataFor(activeHome, profile, profile.onboardingComplete);
      }
    }).finally(() => setIsLoading(false));
  }

  async function loadHomeDataFor(home: Home, profile = state.currentUser, onboardingComplete = state.onboardingComplete) {
    const [rooms, devices, readings, alerts, activityLogs] = await Promise.all([
      roomService.getRooms(home.id),
      deviceService.getDevices(home.id),
      readingService.getLatestReadings(home.id),
      alertService.getAlerts(home.id),
      activityService.getRecentActivity(home.id),
    ]);
    setState((current) => ({
      ...current,
      currentUser: profile,
      onboardingComplete,
      onboarding: { homeCreated: true, roomsAdded: rooms.length > 0, firstDeviceAdded: devices.length > 0 },
      home,
      rooms,
      devices,
      readings,
      alerts,
      activityLogs,
    }));
  }

  async function loadHomeData() {
    await run(async () => {
      const activeHome = await homeService.getActiveHomeWithMembership();
      if (!activeHome) {
        setState((current) => ({ ...current, home: null, rooms: [], devices: [], readings: [], alerts: [], activityLogs: [] }));
        return;
      }
      await loadHomeDataFor(activeHome);
    });
  }

  const actions = useMemo<StoreActions>(
    () => ({
      bootstrapApp,
      async signUp(name, email, password) {
        return run(async () => {
          await authService.signUp(email.trim(), password, name.trim());
          const profile = await profileService.createProfileForUser(name.trim());
          setState((current) => ({
            ...current,
            currentUser: profile,
            session: { userId: profile.id, email: profile.email, startedAt: new Date().toISOString(), isDemo: false },
            onboardingComplete: profile.onboardingComplete,
          }));
          return true;
        }).catch(() => false);
      },
      async signIn(email, password) {
        return run(async () => {
          await authService.signIn(email.trim(), password);
          await bootstrapApp();
          return true;
        }).catch(() => false);
      },
      async loginDemo(email = "homeowner@airguard.demo", password = "airguard123") {
        return run(async () => {
          await authService.signIn(email.trim(), password);
          await bootstrapApp();
          return true;
        }).catch(() => false);
      },
      async signOut() {
        await run(async () => {
          await authService.signOut();
          setState(blankState());
        });
      },
      async logout() {
        await run(async () => {
          await authService.signOut();
          setState(blankState());
        });
      },
      loadHomeData,
      async createHome(name, address) {
        await run(async () => {
          const home = await homeService.createHome(name.trim() || "My Home", address?.trim());
          await activityService.createActivityLog(home.id, "home", "Home created", `${home.name} is ready for monitoring.`);
          await loadHomeDataFor(home, state.currentUser, state.onboardingComplete);
        });
      },
      async completeOnboarding() {
        await run(async () => {
          const profile = await profileService.updateOnboardingComplete(true);
          if (state.home) await activityService.createActivityLog(state.home.id, "demo", "Setup completed", "Initial AirGuard setup was completed.");
          setState((current) => ({ ...current, currentUser: profile, onboardingComplete: true }));
          if (state.home) await loadHomeDataFor(state.home, profile, true);
        });
      },
      async addRoom(name) {
        await run(async () => {
          if (!state.home) throw new Error("Create a home before adding rooms.");
          const room = await roomService.addRoom(state.home.id, { name: name.trim() });
          await activityService.createActivityLog(state.home.id, "room", "Room added", `${room.name} is now monitored.`);
          await loadHomeDataFor(state.home);
        });
      },
      async startDevicePairing(type, roomId) {
        setState((current) => ({ ...current, pairingDraft: { ...current.pairingDraft, type, roomId } }));
        if (state.home) await activityService.createActivityLog(state.home.id, "device", "Device pairing started", "Searching for nearby AirGuard devices.");
      },
      async finishDevicePairing() {
        setState((current) => ({ ...current, pairingDraft: { ...current.pairingDraft, foundDeviceName: "AirGuard Sensor" } }));
      },
      async addDevice(name, type, roomId) {
        await run(async () => {
          if (!state.home) throw new Error("Create a home before adding devices.");
          const targetRoomId = roomId ?? state.pairingDraft.roomId ?? state.rooms[0]?.id;
          if (!targetRoomId) throw new Error("Add a room before pairing a device.");
          const deviceType = type ?? state.pairingDraft.type ?? "air-sensor";
          const room = state.rooms.find((item) => item.id === targetRoomId);
          const device = await deviceService.addDevice(state.home.id, targetRoomId, {
            name: name.trim() || `${room?.name ?? "Room"} ${deviceLabel(deviceType)}`,
            type: deviceType,
            batteryLevel: deviceType === "ventilation-fan" || deviceType === "alarm" ? undefined : 100,
            powerConnected: deviceType === "ventilation-fan" || deviceType === "alarm",
          });
          await insertInitialReading(state.home.id, targetRoomId, device.id, deviceType);
          await activityService.createActivityLog(state.home.id, "device", "Device added", `${device.name} was added to ${room?.name ?? "a room"}.`);
          setState((current) => ({ ...current, pairingDraft: {} }));
          await loadHomeDataFor(state.home);
        });
      },
      async toggleDeviceStatus(deviceId) {
        await run(async () => {
          if (!state.home) return;
          const device = state.devices.find((item) => item.id === deviceId);
          if (!device) return;
          await deviceService.updateDeviceStatus(deviceId, device.status === "online" ? "offline" : "online");
          await activityService.createActivityLog(state.home.id, "device", "Device status changed", `${device.name} is now ${device.status === "online" ? "offline" : "online"}.`);
          await loadHomeDataFor(state.home);
        });
      },
      async simulateNormalReadings() {
        await run(async () => {
          if (!state.home) return;
          await readingService.simulateNormalReadings(state.home.id);
          await activityService.createActivityLog(state.home.id, "reading", "Normal readings simulated", "All demo readings returned to a safe range.");
          await loadHomeDataFor(state.home);
        });
      },
      async simulateWarningReadings() {
        await run(async () => {
          if (!state.home) return;
          await readingService.simulateWarningReadings(state.home.id);
          await activityService.createActivityLog(state.home.id, "reading", "Warning readings simulated", "AirGuard inserted warning readings for the active home.");
          await loadHomeDataFor(state.home);
        });
      },
      async simulateCriticalReadings() {
        await run(async () => {
          if (!state.home) return;
          await readingService.simulateCriticalReadings(state.home.id);
          await alertService.triggerKitchenSmokeAlert(state.home.id);
          await activityService.createActivityLog(state.home.id, "alert", "Critical alert triggered", "Smoke simulation created a critical alert.");
          await loadHomeDataFor(state.home);
        });
      },
      async triggerKitchenSmokeAlert() {
        await run(async () => {
          if (!state.home) return;
          await readingService.simulateCriticalReadings(state.home.id);
          await alertService.triggerKitchenSmokeAlert(state.home.id);
          await activityService.createActivityLog(state.home.id, "alert", "Kitchen smoke alert triggered", "Demo smoke alert was persisted to Supabase.");
          await loadHomeDataFor(state.home);
        });
      },
      async startCheckingAlert(alertId) {
        await run(async () => {
          await alertService.startCheckingAlert(alertId);
          if (state.home) {
            await activityService.createActivityLog(state.home.id, "alert", "Alert checking started", "A household member started checking the alert.");
            await loadHomeDataFor(state.home);
          }
        });
      },
      async resolveAlert(alertId) {
        await run(async () => {
          await alertService.resolveAlert(alertId);
          if (state.home) {
            await readingService.simulateNormalReadings(state.home.id);
            await activityService.createActivityLog(state.home.id, "alert", "Alert resolved", "The alert was marked resolved after checking the room.");
            await loadHomeDataFor(state.home);
          }
        });
      },
      async resetDemoData() {
        await run(async () => {
          if (!state.home) return;
          for (const roomTemplate of demoRooms) {
            if (!state.rooms.some((room) => room.name === roomTemplate.name)) {
              await roomService.addRoom(state.home.id, { name: roomTemplate.name, type: roomTemplate.icon });
            }
          }
          const refreshedRooms = await roomService.getRooms(state.home.id);
          for (const deviceTemplate of demoDevices) {
            const templateRoom = demoRooms.find((room) => room.id === deviceTemplate.roomId);
            const room = refreshedRooms.find((item) => item.name === templateRoom?.name) ?? refreshedRooms[0];
            if (room && !state.devices.some((device) => device.name === deviceTemplate.name)) {
              await deviceService.addDevice(state.home.id, room.id, {
                name: deviceTemplate.name,
                type: deviceTemplate.type,
                batteryLevel: deviceTemplate.batteryLevel,
                powerConnected: deviceTemplate.powerConnected,
              });
            }
          }
          await readingService.simulateNormalReadings(state.home.id);
          await activityService.createActivityLog(state.home.id, "demo", "Demo data reset", "Demo room, device, and normal reading templates were applied.");
          await loadHomeDataFor(state.home);
        });
      },
      async resetAppData() {
        await run(async () => {
          if (!state.home) return;
          for (const roomTemplate of demoRooms) {
            if (!state.rooms.some((room) => room.name === roomTemplate.name)) {
              await roomService.addRoom(state.home.id, { name: roomTemplate.name, type: roomTemplate.icon });
            }
          }
          await readingService.simulateNormalReadings(state.home.id);
          await activityService.createActivityLog(state.home.id, "demo", "Demo data reset", "Demo room and reading templates were applied.");
          await loadHomeDataFor(state.home);
        });
      },
      async clearOnboarding() {
        await run(async () => {
          const profile = await profileService.updateOnboardingComplete(false);
          setState((current) => ({ ...current, currentUser: profile, onboardingComplete: false }));
        });
      },
    }),
    [state],
  );

  useEffect(() => {
    void bootstrapApp();
  }, []);

  const value = useMemo(() => ({ state, isLoading, error, actions }), [actions, error, isLoading, state]);
  return <AirGuardContext.Provider value={value}>{children}</AirGuardContext.Provider>;
}

export function useAirGuard() {
  const value = useContext(AirGuardContext);
  if (!value) throw new Error("useAirGuard must be used inside AirGuardProvider");
  return value;
}

function blankState(): AirGuardData {
  return {
    currentUser: null,
    session: null,
    onboardingComplete: false,
    onboarding: { homeCreated: false, roomsAdded: false, firstDeviceAdded: false },
    home: null,
    rooms: [],
    devices: [],
    readings: [],
    alerts: [],
    activityLogs: [],
    pairingDraft: {},
  };
}

function deviceLabel(type: DeviceType) {
  if (type === "smoke-detector") return "Smoke Detector";
  if (type === "co2-sensor") return "CO2 Sensor";
  if (type === "ventilation-fan") return "Ventilation Fan";
  if (type === "alarm") return "Alarm";
  return "Air Sensor";
}

async function insertInitialReading(homeId: string, roomId: string, deviceId: string, type: DeviceType) {
  if (type === "smoke-detector") {
    await readingService.insertReading({ homeId, roomId, deviceId, type: "smoke", value: 0, unit: "ug/m3", status: "good", statusLabel: "Clear" });
    return;
  }
  if (type === "co2-sensor" || type === "air-sensor") {
    await readingService.insertReading({ homeId, roomId, deviceId, type: "co2", value: 455, unit: "ppm", status: "good", statusLabel: "Good" });
  }
}
