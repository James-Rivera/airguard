import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { routes } from "@/navigation/routes";
import { useAirGuard } from "@/state/airguard-store";
import { colors, spacing } from "@/theme/index";

export default function OnboardingIntroRoute() {
  const { state } = useAirGuard();
  const nextRoute = state.home ? (state.rooms.length ? routes.addFirstDevice : routes.addRooms) : routes.createHome;

  return (
    <AppScreen title="Set Up AirGuard" subtitle="Create the real home data that will be stored in Supabase." noBottomPadding>
      <AppCard style={styles.card}>
        <AppText style={styles.title}>Start with your home</AppText>
        <AppText variant="body">AirGuard organizes safety around homes, rooms, devices, readings, and alerts.</AppText>
      </AppCard>
      <View style={styles.steps}>
        <Step label="Home" done={Boolean(state.home)} />
        <Step label="Rooms" done={state.rooms.length > 0} />
        <Step label="First Device" done={state.devices.length > 0} />
      </View>
      <AppButton label="Continue Setup" onPress={() => router.push(nextRoute)} />
    </AppScreen>
  );
}

function Step({ label, done }: { label: string; done: boolean }) {
  return (
    <View style={styles.step}>
      <View style={[styles.dot, done && styles.dotDone]} />
      <AppText style={styles.stepText}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "700",
  },
  steps: {
    gap: spacing.sm,
  },
  step: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  dot: {
    backgroundColor: colors.border,
    borderRadius: 999,
    height: 12,
    width: 12,
  },
  dotDone: {
    backgroundColor: colors.success,
  },
  stepText: {
    color: colors.textSecondary,
    fontWeight: "600",
  },
});
