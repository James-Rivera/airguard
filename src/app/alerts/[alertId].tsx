import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AlertCard } from "@/components/airguard/AlertCard";
import { DeviceCard } from "@/components/airguard/DeviceCard";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppScreen, SectionHeader } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAlertById, getDevicesByRoomId, getLatestReadingForDevice } from "@/domain/selectors";
import { useHomeDataRefresh } from "@/hooks/useHomeDataRefresh";
import { routes } from "@/navigation/routes";
import { useAirGuard } from "@/state/airguard-store";
import { colors, spacing } from "@/theme/index";

export default function AlertDetailRoute() {
  const { alertId } = useLocalSearchParams<{ alertId: string }>();
  const { state, actions } = useAirGuard();
  const refreshControl = useHomeDataRefresh();
  const [actionName, setActionName] = useState<"checking" | "resolving" | null>(null);
  const [actionError, setActionError] = useState("");
  const alert = getAlertById(state, alertId);
  const relatedDevices = alert ? getDevicesByRoomId(state, alert.roomId) : [];

  if (!alert) {
    return (
      <AppScreen title="Alert Detail" subtitle="Alert not found" onBack={() => router.back()} noBottomPadding refreshControl={refreshControl}>
        <EmptyState title="Alert not found" message="Go back to alerts and choose another safety event." iconName="alert" actionLabel="View Alerts" onAction={() => router.replace(routes.alerts)} />
      </AppScreen>
    );
  }

  async function startChecking() {
    if (actionName || !alert) return;
    setActionError("");
    setActionName("checking");
    try {
      await actions.startCheckingAlert(alert.id);
    } catch (err) {
      console.warn("[AirGuard] Start checking alert failed", err);
      setActionError("Alert could not be updated. Please try again.");
    } finally {
      setActionName(null);
    }
  }

  async function resolveAlert() {
    if (actionName || !alert) return;
    setActionError("");
    setActionName("resolving");
    try {
      await actions.resolveAlert(alert.id);
    } catch (err) {
      console.warn("[AirGuard] Resolve alert failed", err);
      setActionError("Alert could not be resolved. Please try again.");
    } finally {
      setActionName(null);
    }
  }

  return (
    <AppScreen title="Alert Detail" subtitle={alert.roomName} onBack={() => router.back()} noBottomPadding refreshControl={refreshControl}>
      <AlertCard alert={alert} />
      <AppCard style={styles.actionCard}>
        <AppText style={styles.label}>Recommended Action</AppText>
        <AppText style={styles.action}>{alert.recommendedAction}</AppText>
      </AppCard>
      {alert.status !== "resolved" ? (
        <View style={styles.actions}>
          <AppButton
            label={actionName === "checking" ? "Starting Check" : alert.status === "checking" ? "Checking" : "Start Checking"}
            onPress={startChecking}
            variant={alert.severity === "critical" ? "danger" : "primary"}
            style={styles.actionButton}
            disabled={alert.status === "checking" || Boolean(actionName)}
          />
          <AppButton
            label={actionName === "resolving" ? "Resolving" : "Resolve"}
            onPress={resolveAlert}
            variant="secondary"
            style={styles.actionButton}
            disabled={Boolean(actionName)}
          />
        </View>
      ) : null}
      {actionError ? <AppText style={styles.error}>{actionError}</AppText> : null}
      <SectionHeader title="Related Devices" />
      {relatedDevices.length === 0 ? (
        <EmptyState title="No related devices" message="This alert is linked to the room, but no device is currently assigned there." iconName="sensor" />
      ) : null}
      {relatedDevices.map((device) => (
        <DeviceCard key={device.id} device={device} reading={getLatestReadingForDevice(state, device.id)} onPress={() => router.push(routes.deviceDetail(device.id))} />
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
  error: {
    color: colors.critical,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
});
