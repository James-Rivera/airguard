import type { User } from "@/domain/models";
import { AirGuardProvider, useAirGuard } from "./airguard-store";

export const SessionProvider = AirGuardProvider;

export function useSession() {
  const { state, isLoading, actions } = useAirGuard();
  return {
    user: state.currentUser as User | null,
    session: state.session,
    onboardingComplete: state.onboardingComplete,
    isLoading,
    signIn: actions.signIn,
    signOut: actions.logout,
    createAccount: actions.signUp,
  };
}
