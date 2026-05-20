import React, { useRef } from "react";
import type { View as ViewType } from "react-native";
import { Redirect, Tabs } from "expo-router";
import { BlurTargetView } from "expo-blur";
import { BottomTabBar } from "@/components/ui/BottomTabBar";
import { routes } from "@/navigation/routes";
import { useAirGuard } from "@/state/airguard-store";
import { useSession } from "@/state/session";

export default function TabsLayout() {
  const blurTargetRef = useRef<ViewType>(null);
  const { user, isLoading } = useSession();
  const { state } = useAirGuard();

  if (!isLoading && !user) return <Redirect href={routes.login} />;
  if (!isLoading && user && (!state.onboardingComplete || !state.home)) return <Redirect href={routes.onboarding} />;

  return (
    <BlurTargetView ref={blurTargetRef} style={styles.blurTarget}>
      <Tabs tabBar={(props) => <BottomTabBar {...props} blurTarget={blurTargetRef} />} screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="home" options={{ title: "Home" }} />
        <Tabs.Screen name="rooms" options={{ title: "Rooms" }} />
        <Tabs.Screen name="alerts" options={{ title: "Alerts" }} />
        <Tabs.Screen name="devices" options={{ title: "Devices" }} />
        <Tabs.Screen name="more" options={{ title: "More" }} />
      </Tabs>
    </BlurTargetView>
  );
}

const styles = {
  blurTarget: {
    flex: 1,
  },
};
