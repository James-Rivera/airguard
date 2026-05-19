import { routes } from "./routes";
import type { AirGuardData } from "@/domain/models";

export function getOnboardingResumeRoute(state: AirGuardData) {
  if (state.onboardingComplete && state.home) return routes.home;
  if (!state.home) return routes.onboarding;
  if (!state.pairingDraft.type && state.devices.length === 0) return routes.addSensorProfile;
  if (!state.pairingDraft.roomId && !state.pairingDraft.roomName && state.devices.length === 0) return routes.assignSensorRoom;
  return routes.reviewSetup;
}

export function shouldLeaveCreateHome(state: AirGuardData) {
  return Boolean(state.home);
}
