import React from "react";
import { router } from "expo-router";
import { AppButton } from "@/components/ui/AppButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { AppScreen } from "@/components/ui/AppScreen";
import { routes } from "@/navigation/routes";
import { useAirGuard } from "@/state/airguard-store";

export default function AddFirstDeviceRoute() {
  const { state, actions } = useAirGuard();
  const kitchen = state.rooms.find((room) => room.name.toLowerCase().includes("kitchen")) ?? state.rooms[0];

  async function addDemoDevice() {
    if (!kitchen) return;
    await actions.addDevice(`${kitchen.name} Smoke Detector`, "smoke-detector", kitchen.id);
    router.replace(routes.reviewSetup);
  }

  return (
    <AppScreen title="Add First Device" subtitle="Pair a simulated device and store it in Supabase." onBack={() => router.back()} noBottomPadding>
      <EmptyState title="No device paired yet" message="Start with a smoke detector or air sensor so the dashboard has real database readings." actionLabel="Use Demo Smoke Detector" onAction={addDemoDevice} />
      <AppButton label="Choose Device Manually" onPress={() => router.push(routes.addDevice)} variant="secondary" />
      {state.devices.length ? <AppButton label="Continue" onPress={() => router.replace(routes.reviewSetup)} /> : null}
    </AppScreen>
  );
}
