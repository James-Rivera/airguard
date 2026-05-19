import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { DeviceCard } from "@/components/airguard/DeviceCard";
import { SummaryCard } from "@/components/airguard/SummaryCard";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { getDeviceSummary, getDevices } from "@/domain/selectors";
import { routes } from "@/navigation/routes";
import { useAirGuard } from "@/state/airguard-store";
import { colors, radius, spacing } from "@/theme/index";

export default function DevicesRoute() {
  const { state } = useAirGuard();
  const summary = getDeviceSummary(state);
  return (
    <AppScreen title="Devices">
      <View style={styles.summary}>
        <SummaryCard label="Total Devices" value={summary.total} detail="+2 this week" />
        <SummaryCard label="Rooms" value={summary.rooms} detail={`${summary.offline} need attention`} />
      </View>
      {getDevices(state).slice(0, 5).map((device) => (
        <DeviceCard key={device.id} device={device} />
      ))}
      <Pressable style={styles.add} onPress={() => router.push(routes.addDevice)}>
        <AppText style={styles.addText}>+</AppText>
      </Pressable>
    </AppScreen>
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
    position: "absolute",
    right: 25,
    top: 9,
    width: 25,
  },
  addText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 20,
  },
});
