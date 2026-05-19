export const routes = {
  welcome: "/",
  login: "/auth/login",
  createAccount: "/auth/create-account",
  onboarding: "/onboarding",
  createHome: "/onboarding/create-home",
  addRooms: "/onboarding/add-rooms",
  addFirstDevice: "/onboarding/add-first-device",
  reviewSetup: "/onboarding/review-setup",
  home: "/tabs/home",
  rooms: "/tabs/rooms",
  alerts: "/tabs/alerts",
  devices: "/tabs/devices",
  more: "/tabs/more",
  addRoom: "/setup/add-room",
  addDevice: "/setup/add-device",
  activity: "/activity",
  roomDetail: (roomId: string) => `/rooms/${roomId}`,
  alertDetail: (alertId: string) => `/alerts/${alertId}`,
} as const;

export type AppRoute = typeof routes;
