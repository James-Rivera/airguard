import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { DeviceCard } from "@/components/airguard/DeviceCard";
import { SummaryCard } from "@/components/airguard/SummaryCard";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppIcon } from "@/components/ui/AppIcon";
import { EmptyState } from "@/components/ui/EmptyState";
import { getDeviceSummary, getDevices, getLatestReadingForDevice } from "@/domain/selectors";
import { useHomeDataRefresh } from "@/hooks/useHomeDataRefresh";
import { routes } from "@/navigation/routes";
import { useAirGuard } from "@/state/airguard-store";
import { colors, radius, spacing } from "@/theme/index";

export default function DevicesRoute() {
  const { state } = useAirGuard();
  const refreshControl = useHomeDataRefresh();
  const summary = getDeviceSummary(state);
  const devices = getDevices(state);
  return (
    <AppScreen title="Devices" headerAction={<AddButton onPress={() => router.push(routes.addDevice)} />} refreshControl={refreshControl}>
      <View style={styles.summary}>
        <SummaryCard label="Total Devices" value={summary.total} detail={`${summary.online} online`} />
        <SummaryCard label="Rooms" value={summary.rooms} detail={`${summary.offline} need attention`} />
      </View>
      {devices.length === 0 ? (
        <EmptyState title="No devices yet" message="Pair a sensor profile with a room to start monitoring." actionLabel="Add Device" onAction={() => router.push(routes.addDevice)} />
      ) : null}
      {devices.map((device) => (
        <DeviceCard key={device.id} device={device} reading={getLatestReadingForDevice(state, device.id)} onPress={() => router.push(routes.deviceDetail(device.id))} />
      ))}
    </AppScreen>
  );
}

function AddButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={styles.add} onPress={onPress} accessibilityRole="button" accessibilityLabel="Add device">
      <AppIcon name="plus" size={18} color={colors.white} secondaryColor={colors.white} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  summary: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  add: {
    alignItems: "center",
    backgroundColor: colors.textSecondary,
    borderRadius: radius.pill,
    height: 25,
    justifyContent: "center",
    width: 25,
  },
});
