import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AirGuardData, DeviceType, Home, Room, User } from "@/domain/models";
import type { DemoScenarioType, ScenarioRunResult, ScenarioTargetInput } from "@/domain/scenarios";
import { demoDevices, demoRooms } from "@/domain/seed";
import * as activityService from "@/services/activity-service";
import * as alertService from "@/services/alert-service";
import * as authService from "@/services/auth-service";
import * as deviceService from "@/services/device-service";
import * as homeService from "@/services/home-service";
import * as profileService from "@/services/profile-service";
import * as readingService from "@/services/reading-service";
import * as roomService from "@/services/room-service";
import * as scenarioService from "@/services/scenario-service";

type StoreActions = {
  bootstrapApp: () => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<SignUpResult>;
  verifySignUpCode: (name: string, email: string, code: string) => Promise<boolean>;
  resendSignUpCode: (email: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  loadHomeData: () => Promise<void>;
  selectHome: (homeId: string) => Promise<void>;
  createHome: (name: string, address?: string) => Promise<void>;
  prepareSensorProfile: (type: DeviceType) => void;
  prepareSensorRoom: (room: { id?: string; name: string; icon?: Room["icon"] }) => void;
  completeOnboardingSetup: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  addRoom: (name: string, type?: Room["icon"]) => Promise<void>;
  updateHome: (name: string, address?: string) => Promise<void>;
  startDevicePairing: (type?: DeviceType, roomId?: string) => Promise<void>;
  finishDevicePairing: () => Promise<void>;
  addDevice: (name: string, type?: DeviceType, roomId?: string) => Promise<void>;
  toggleDeviceStatus: (deviceId: string) => Promise<void>;
  runDemoScenario: (type: DemoScenarioType, target?: ScenarioTargetInput) => Promise<ScenarioRunResult>;
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

type SignUpResult = { ok: true } | { ok: false; needsVerification?: boolean };

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
      const homes = await homeService.getHomesForCurrentUser();
      const activeHome = homes[0] ?? null;
      const nextBase = {
        ...blankState(),
        currentUser: profile,
        session: {
          userId: session.user.id,
          email: session.user.email ?? profile.email,
          startedAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : new Date().toISOString(),
          isDemo: isDemoEmail(session.user.email ?? profile.email),
        },
        onboardingComplete: profile.onboardingComplete,
        homes,
        home: activeHome,
      };
      setState(nextBase);
      if (activeHome) {
        await loadHomeDataFor(activeHome, profile, profile.onboardingComplete, homes);
      }
    }).finally(() => setIsLoading(false));
  }

  async function loadHomeDataFor(home: Home, profile = state.currentUser, onboardingComplete = state.onboardingComplete, homes = state.homes) {
    await deviceService.removeExactDuplicateDevices(home.id);
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
      homes,
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
      const homes = await homeService.getHomesForCurrentUser();
      const activeHome = state.home ? homes.find((home) => home.id === state.home?.id) ?? homes[0] : homes[0];
      if (!activeHome) {
        setState((current) => ({ ...current, homes, home: null, rooms: [], devices: [], readings: [], alerts: [], activityLogs: [] }));
        return;
      }
      await loadHomeDataFor(activeHome, state.currentUser, state.onboardingComplete, homes);
    });
  }

  async function selectHome(homeId: string) {
    await run(async () => {
      const homes = state.homes.length > 0 ? state.homes : await homeService.getHomesForCurrentUser();
      const home = homes.find((item) => item.id === homeId);
      if (!home) throw new Error("Selected home is not available for this account.");
      await loadHomeDataFor(home, state.currentUser, state.onboardingComplete, homes);
    });
  }

  async function runDemoScenario(type: DemoScenarioType, target?: ScenarioTargetInput) {
    return run(async () => {
      if (!state.currentUser) throw new Error("Sign in before opening sensor controls.");
      if (!state.home) throw new Error("Create a home before applying sensor events.");
      const result = await scenarioService.runDemoScenario(state.home.id, type, target);
      await loadHomeDataFor(state.home);
      return result;
    });
  }

  const actions = useMemo<StoreActions>(
    () => ({
      bootstrapApp,
      async signUp(name, email, password) {
        return run(async () => {
          const result = await authService.signUp(email.trim(), password, name.trim());
          if (!result.session?.user) {
            return { ok: false, needsVerification: true };
          }
          const profile = await profileService.createProfileForUser(name.trim());
          setState((current) => ({
            ...current,
            currentUser: profile,
            session: { userId: profile.id, email: profile.email, startedAt: new Date().toISOString(), isDemo: isDemoEmail(profile.email) },
            onboardingComplete: profile.onboardingComplete,
          }));
          return { ok: true };
        }).catch(() => ({ ok: false }));
      },
      async verifySignUpCode(name, email, code) {
        return run(async () => {
          const result = await authService.verifySignUpCode(email.trim(), code.trim());
          if (!result.session?.user) throw new Error("Enter the latest verification code sent to your email.");
          const profile = await profileService.createProfileForUser(name.trim());
          setState((current) => ({
            ...current,
            currentUser: profile,
            session: { userId: profile.id, email: profile.email, startedAt: new Date().toISOString(), isDemo: isDemoEmail(profile.email) },
            onboardingComplete: profile.onboardingComplete,
          }));
          return true;
        }).catch(() => false);
      },
      async resendSignUpCode(email) {
        return run(async () => {
          await authService.resendSignUpCode(email.trim());
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
      selectHome,
      async createHome(name, address) {
        await run(async () => {
          const home = await homeService.createHome(name.trim() || "My Home", address?.trim());
          await activityService.createActivityLog(home.id, "home", "Home created", `${home.name} is ready for monitoring.`);
          const homes = await homeService.getHomesForCurrentUser();
          await loadHomeDataFor(home, state.currentUser, state.onboardingComplete, homes);
        });
      },
      prepareSensorProfile(type) {
        setState((current) => ({ ...current, pairingDraft: { ...current.pairingDraft, type } }));
      },
      prepareSensorRoom(room) {
        setState((current) => ({ ...current, pairingDraft: { ...current.pairingDraft, roomId: room.id, roomName: room.name, roomIcon: room.icon } }));
      },
      async completeOnboardingSetup() {
        await run(async () => {
          if (!state.home) throw new Error("Create a home before starting monitoring.");
          if (!state.pairingDraft.type) throw new Error("Choose a sensor profile before starting monitoring.");
          if (!state.pairingDraft.roomId && !state.pairingDraft.roomName?.trim()) throw new Error("Choose a room before starting monitoring.");

          const deviceType = state.pairingDraft.type;
          let targetRoom = state.pairingDraft.roomId ? state.rooms.find((room) => room.id === state.pairingDraft.roomId) : undefined;

          if (!targetRoom) {
            const roomName = state.pairingDraft.roomName?.trim();
            if (!roomName) throw new Error("Choose a room before starting monitoring.");
            const result = await roomService.findOrCreateRoom(state.home.id, { name: roomName, type: state.pairingDraft.roomIcon });
            targetRoom = result.room;
            if (result.created) {
              await activityService.createActivityLog(state.home.id, "room", "Room added", `${targetRoom.name} is now monitored.`);
            }
          }

          const result = await deviceService.findOrCreateDevice(state.home.id, targetRoom.id, {
            name: `${targetRoom.name} ${sensorProfileLabel(deviceType)}`,
            type: deviceType,
            batteryLevel: deviceType === "ventilation-fan" || deviceType === "alarm" ? undefined : 100,
            powerConnected: deviceType === "ventilation-fan" || deviceType === "alarm",
          });
          if (result.created) {
            const device = result.device;
            await insertInitialReading(state.home.id, targetRoom.id, device.id, deviceType);
            await activityService.createActivityLog(state.home.id, "device", "Sensor profile added", `${sensorProfileLabel(deviceType)} is monitoring ${targetRoom.name}.`);
          }

          const profile = await profileService.updateOnboardingComplete(true);
          await activityService.createActivityLog(state.home.id, "home", "Setup completed", "Home safety profile is ready to monitor.");
          setState((current) => ({ ...current, currentUser: profile, onboardingComplete: true, pairingDraft: {} }));
          await loadHomeDataFor(state.home, profile, true);
        });
      },
      async completeOnboarding() {
        await run(async () => {
          const profile = await profileService.updateOnboardingComplete(true);
          if (state.home) await activityService.createActivityLog(state.home.id, "home", "Setup completed", "Initial AirGuard setup was completed.");
          setState((current) => ({ ...current, currentUser: profile, onboardingComplete: true }));
          if (state.home) await loadHomeDataFor(state.home, profile, true);
        });
      },
      async addRoom(name, type) {
        await run(async () => {
          if (!state.home) throw new Error("Create a home before adding rooms.");
          const result = await roomService.findOrCreateRoom(state.home.id, { name, type });
          if (result.created) {
            await activityService.createActivityLog(state.home.id, "room", "Room added", `${result.room.name} is now monitored.`);
          }
          await loadHomeDataFor(state.home);
        });
      },
      async updateHome(name, address) {
        await run(async () => {
          if (!state.home) throw new Error("Create a home before updating settings.");
          const home = await homeService.updateHome(state.home.id, { name, address });
          await activityService.createActivityLog(home.id, "home", "Home settings updated", `${home.name} settings were updated.`);
          await loadHomeDataFor(home);
        });
      },
      async startDevicePairing(type, roomId) {
        setState((current) => ({ ...current, pairingDraft: { ...current.pairingDraft, type, roomId } }));
        if (state.home) await activityService.createActivityLog(state.home.id, "device", "Sensor profile selected", "A sensor profile was prepared for setup.");
      },
      async finishDevicePairing() {
        setState((current) => ({ ...current, pairingDraft: { ...current.pairingDraft, foundDeviceName: "AirGuard Sensor" } }));
      },
      async addDevice(name, type, roomId) {
        await run(async () => {
          if (!state.home) throw new Error("Create a home before adding devices.");
          const targetRoomId = roomId ?? state.pairingDraft.roomId ?? state.rooms[0]?.id;
          if (!targetRoomId) throw new Error("Add a room before adding a sensor profile.");
          const deviceType = type ?? state.pairingDraft.type ?? "air-sensor";
          const room = state.rooms.find((item) => item.id === targetRoomId);
          const result = await deviceService.findOrCreateDevice(state.home.id, targetRoomId, {
            name: name.trim() || `${room?.name ?? "Room"} ${deviceLabel(deviceType)}`,
            type: deviceType,
            batteryLevel: deviceType === "ventilation-fan" || deviceType === "alarm" ? undefined : 100,
            powerConnected: deviceType === "ventilation-fan" || deviceType === "alarm",
          });
          if (result.created) {
            await insertInitialReading(state.home.id, targetRoomId, result.device.id, deviceType);
            await activityService.createActivityLog(state.home.id, "device", "Device added", `${result.device.name} was added to ${room?.name ?? "a room"}.`);
          }
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
      runDemoScenario,
      async simulateNormalReadings() {
        await runDemoScenario("normal-reading");
      },
      async simulateWarningReadings() {
        await runDemoScenario("high-co2");
      },
      async simulateCriticalReadings() {
        await runDemoScenario("smoke-detected");
      },
      async triggerKitchenSmokeAlert() {
        await runDemoScenario("smoke-detected");
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
          ensureDemoToolsAllowed(state);
          for (const roomTemplate of demoRooms) {
            await roomService.findOrCreateRoom(state.home.id, { name: roomTemplate.name, type: roomTemplate.icon });
          }
          const refreshedRooms = await roomService.getRooms(state.home.id);
          const refreshedDevices = await deviceService.getDevices(state.home.id);
          for (const deviceTemplate of demoDevices) {
            const templateRoom = demoRooms.find((room) => room.id === deviceTemplate.roomId);
            const room = refreshedRooms.find((item) => item.name === templateRoom?.name) ?? refreshedRooms[0];
            const exists = refreshedDevices.some((device) => normalizeName(device.name) === normalizeName(deviceTemplate.name) && device.roomId === room?.id && device.type === deviceTemplate.type);
            if (room && !exists) {
              await deviceService.findOrCreateDevice(state.home.id, room.id, {
                name: deviceTemplate.name,
                type: deviceTemplate.type,
                batteryLevel: deviceTemplate.batteryLevel,
                powerConnected: deviceTemplate.powerConnected,
              });
            }
          }
          await readingService.simulateNormalReadings(state.home.id);
          await activityService.createActivityLog(state.home.id, "home", "Home data reset", "Room, device, and normal reading templates were applied.");
          await loadHomeDataFor(state.home);
        });
      },
      async resetAppData() {
        await run(async () => {
          if (!state.home) return;
          ensureDemoToolsAllowed(state);
          for (const roomTemplate of demoRooms) {
            await roomService.findOrCreateRoom(state.home.id, { name: roomTemplate.name, type: roomTemplate.icon });
          }
          await readingService.simulateNormalReadings(state.home.id);
          await activityService.createActivityLog(state.home.id, "home", "Home data reset", "Room and reading templates were applied.");
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
    homes: [],
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

function sensorProfileLabel(type: DeviceType) {
  if (type === "smoke-detector") return "Smoke Sensor";
  if (type === "co2-sensor") return "CO2 Sensor";
  return "Air Quality Sensor";
}

function isDemoEmail(email?: string | null) {
  return Boolean(email?.toLowerCase().endsWith("@airguard.demo"));
}

function canUseDemoTools(state: AirGuardData) {
  return isDemoEmail(state.currentUser?.email) || state.currentUser?.role === "administrator" || state.currentUser?.role === "member";
}

function ensureDemoToolsAllowed(state: AirGuardData) {
  if (!canUseDemoTools(state)) {
    throw new Error("Safety tools are available only for authorized AirGuard accounts.");
  }
}

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
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
