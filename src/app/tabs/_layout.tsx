import React from "react";
import { Redirect, Tabs } from "expo-router";
import { BottomTabBar } from "@/components/ui/BottomTabBar";
import { routes } from "@/navigation/routes";
import { useAirGuard } from "@/state/airguard-store";
import { useSession } from "@/state/session";

export default function TabsLayout() {
  const { user, isLoading } = useSession();
  const { state } = useAirGuard();

  if (!isLoading && !user) return <Redirect href={routes.login} />;
  if (!isLoading && user && (!state.onboardingComplete || !state.home)) return <Redirect href={routes.onboarding} />;

  return (
    <Tabs tabBar={(props) => <BottomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="rooms" options={{ title: "Rooms" }} />
      <Tabs.Screen name="alerts" options={{ title: "Alerts" }} />
      <Tabs.Screen name="devices" options={{ title: "Devices" }} />
      <Tabs.Screen name="more" options={{ title: "More" }} />
    </Tabs>
  );
}
