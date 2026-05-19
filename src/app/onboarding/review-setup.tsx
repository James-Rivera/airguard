import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { SummaryCard } from "@/components/airguard/SummaryCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { routes } from "@/navigation/routes";
import { useAirGuard } from "@/state/airguard-store";
import { colors, spacing } from "@/theme/index";

export default function ReviewSetupRoute() {
  const { state, actions } = useAirGuard();

  async function finish() {
    await actions.completeOnboarding();
    router.replace(routes.home);
  }

  return (
    <AppScreen title="Review Setup" subtitle="Confirm the home data saved in Supabase." onBack={() => router.back()} noBottomPadding>
      <AppText style={styles.home}>{state.home?.name}</AppText>
      <View style={styles.summary}>
        <SummaryCard label="Rooms" value={state.rooms.length} detail="Monitoring areas" />
        <SummaryCard label="Devices" value={state.devices.length} detail="Paired locally" />
      </View>
      <AppButton label="Go to Dashboard" onPress={finish} disabled={!state.home || state.rooms.length === 0 || state.devices.length === 0} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  home: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "700",
  },
  summary: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});
