import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { AlertCard } from "@/components/airguard/AlertCard";
import { ReadingCard } from "@/components/airguard/ReadingCard";
import { RoomCard } from "@/components/airguard/RoomCard";
import { SafetyStatusCard } from "@/components/airguard/SafetyStatusCard";
import { AppScreen, SectionHeader } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import type { Reading } from "@/domain/models";
import { getDashboardSummary, getReadingsByRoomId } from "@/domain/selectors";
import { useHomeDataRefresh } from "@/hooks/useHomeDataRefresh";
import { routes } from "@/navigation/routes";
import { useAirGuard } from "@/state/airguard-store";
import { colors, fonts, gradient, layout, spacing, radius } from "@/theme/index";

const dashboardReadingTypes: Array<{ type: Reading["type"]; label: string }> = [
  { type: "co2", label: "CO2" },
  { type: "smoke", label: "PM2.5" },
  { type: "temperature", label: "Temperature" },
  { type: "humidity", label: "Humidity" },
];

export default function HomeRoute() {
  const { state } = useAirGuard();
  const refreshControl = useHomeDataRefresh();
  const { width } = useWindowDimensions();
  const summary = getDashboardSummary(state);
  const primaryAlert = summary.criticalAlerts[0] ?? summary.activeAlerts[0];
  const userName = summary.user?.name ?? "Guest";
  const shellWidth = Math.min(width, layout.maxPhoneWidth);
  const contentWidth = shellWidth - layout.screenPadding * 2;
  const readingGap = spacing.md;
  const readingCardWidth = Math.floor((contentWidth - readingGap) / 2);
  const compactHeader = shellWidth < 360;
  const brandSize = compactHeader ? 30 : 32;
  const brandLineHeight = compactHeader ? 36 : 39;
  const addButtonHeight = compactHeader ? 42 : 46;
  const addButtonWidth = compactHeader ? 116 : 127;
  const addButtonTextSize = compactHeader ? 13 : 14;
  const dashboardReadings = useMemo(() => getDashboardReadingTiles(state.readings, state.devices.map((device) => device.roomId)), [state.devices, state.readings]);

  return (
    <AppScreen refreshControl={refreshControl}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText style={[styles.brand, { fontSize: brandSize, lineHeight: brandLineHeight }]}>
            <Text style={styles.brandAir}>Air</Text>Guard
          </AppText>
          <AppText style={styles.greeting}>Good morning, {userName.split(" ")[0]}!</AppText>
        </View>
        <Pressable onPress={() => router.push(routes.addDevice)} accessibilityRole="button">
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.addButton, { height: addButtonHeight, width: addButtonWidth }]}
          >
            <AppText style={[styles.addText, { fontSize: addButtonTextSize }]}>Add Device</AppText>
          </LinearGradient>
        </Pressable>
      </View>
      <SafetyStatusCard status={summary.status === "critical" ? "critical" : "good"} onAction={() => router.push(primaryAlert ? routes.alertDetail(primaryAlert.id) : routes.rooms)} />
      <SectionHeader title="Live Readings" />
      <View style={[styles.grid, { columnGap: readingGap, rowGap: readingGap }]}>
        {dashboardReadingTypes.map((item) => (
          <ReadingCard key={item.type} reading={dashboardReadings[item.type]} label={item.label} type={item.type} cardWidth={readingCardWidth} />
        ))}
      </View>
      <SectionHeader title="Rooms" action={<AppText style={styles.link} onPress={() => router.push("/tabs/rooms")}>See all</AppText>} />
      {summary.rooms.slice(0, 1).map((room) => (
        <RoomCard key={room.id} room={room} readings={getReadingsByRoomId(state, room.id)} wide onPress={() => router.push(routes.roomDetail(room.id))} />
      ))}
      {primaryAlert ? (
        <>
          <SectionHeader title="Alerts" />
          <AlertCard alert={primaryAlert} onPress={() => router.push(routes.alertDetail(primaryAlert.id))} />
        </>
      ) : null}
    </AppScreen>
  );
}

function getDashboardReadingTiles(readings: Reading[], deviceRoomIds: string[]) {
  const monitoredRooms = new Set(deviceRoomIds);
  return readings.reduce<Partial<Record<Reading["type"], Reading>>>((tiles, reading) => {
    if (!monitoredRooms.has(reading.roomId) || tiles[reading.type]) return tiles;
    tiles[reading.type] = reading;
    return tiles;
  }, {});
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
    minHeight: 70,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  brand: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 32,
    lineHeight: 39,
  },
  brandAir: {
    color: colors.brandCyan,
    fontFamily: fonts.bold,
  },
  greeting: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  addButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 8,
    justifyContent: "center",
    overflow: "hidden",
  },
  addText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 18,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  link: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: "700",
  },
});
