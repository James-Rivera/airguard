import React from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AlertCard } from "@/components/airguard/AlertCard";
import { DeviceCard } from "@/components/airguard/DeviceCard";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppScreen, SectionHeader } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { getAlertById, getDevicesByRoomId } from "@/domain/selectors";
import { colors, spacing } from "@/theme/index";

export default function AlertDetailRoute() {
  const { alertId } = useLocalSearchParams<{ alertId: string }>();
  const alert = getAlertById(alertId);

  if (!alert) {
    return <AppScreen title="Alert Detail" subtitle="Alert not found" onBack={() => router.back()} noBottomPadding>{null}</AppScreen>;
  }

  return (
    <AppScreen title="Alert Detail" subtitle={alert.roomName} onBack={() => router.back()} noBottomPadding>
      <AlertCard alert={alert} />
      <AppCard style={styles.actionCard}>
        <AppText style={styles.label}>Recommended Action</AppText>
        <AppText style={styles.action}>{alert.recommendedAction}</AppText>
      </AppCard>
      {alert.severity !== "resolved" ? (
        <View style={styles.actions}>
          <AppButton label="Start Checking" onPress={() => undefined} variant={alert.severity === "critical" ? "danger" : "primary"} style={styles.actionButton} />
          <AppButton label="Action Taken" onPress={() => undefined} variant="secondary" style={styles.actionButton} />
        </View>
      ) : null}
      <SectionHeader title="Related Devices" />
      {getDevicesByRoomId(alert.roomId).map((device) => (
        <DeviceCard key={device.id} device={device} />
      ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  actionCard: {
    gap: spacing.xs,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  action: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 24,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
