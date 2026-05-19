import React from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AlertCard } from "@/components/airguard/AlertCard";
import { DeviceCard } from "@/components/airguard/DeviceCard";
import { ReadingCard } from "@/components/airguard/ReadingCard";
import { AppCard } from "@/components/ui/AppCard";
import { AppIcon } from "@/components/ui/AppIcon";
import { AppScreen, SectionHeader } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Reading } from "@/domain/models";
import { getActiveAlerts, getDevicesByRoomId, getReadingsByRoomId, getRoomById } from "@/domain/selectors";
import { routes } from "@/navigation/routes";
import { useAirGuard } from "@/state/airguard-store";
import { colors, fonts, layout, radius, spacing } from "@/theme/index";

const readingTypes: Array<{ type: Reading["type"]; label: string }> = [
  { type: "co2", label: "CO2" },
  { type: "smoke", label: "PM2.5" },
  { type: "temperature", label: "Temperature" },
  { type: "humidity", label: "Humidity" },
];

export default function RoomDetailRoute() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { state } = useAirGuard();
  const { width } = useWindowDimensions();
  const room = getRoomById(state, roomId);

  if (!room) {
    return <AppScreen title="Room" subtitle="Room not found" onBack={() => router.back()} noBottomPadding>{null}</AppScreen>;
  }

  const roomAlerts = getActiveAlerts(state).filter((alert) => alert.roomId === room.id);
  const alert = roomAlerts[0];
  const readings = getReadingsByRoomId(state, room.id);
  const devices = getDevicesByRoomId(state, room.id);
  const shellWidth = Math.min(width, layout.maxPhoneWidth);
  const contentWidth = shellWidth - layout.screenPadding * 2;
  const cardWidth = Math.floor((contentWidth - spacing.md) / 2);

  return (
    <AppScreen title={room.name} subtitle={room.id === "kitchen" ? "Smoke and ventilation monitor" : "Room air monitor"} onBack={() => router.back()} noBottomPadding>
      <AppCard subtleShadow style={styles.roomHero}>
        <View style={styles.roomIcon}>
          <AppIcon name={room.icon} size={28} color={colors.brand} secondaryColor={colors.brand} />
        </View>
        <View style={styles.roomHeroCopy}>
          <AppText style={styles.roomHeroTitle}>{room.name}</AppText>
          <AppText variant="caption">{devices.length} device{devices.length === 1 ? "" : "s"} monitoring this room</AppText>
        </View>
        <StatusBadge status={room.status} />
      </AppCard>
      {alert ? <AlertCard alert={alert} onPress={() => router.push(routes.alertDetail(alert.id))} actionLabel="Open Alert" onAction={() => router.push(routes.alertDetail(alert.id))} /> : null}
      <SectionHeader title="Current Readings" />
      <View style={styles.grid}>
        {readingTypes.map((item) => (
          <ReadingCard
            key={item.type}
            reading={readings.find((reading) => reading.type === item.type)}
            label={item.label}
            type={item.type}
            cardWidth={cardWidth}
          />
        ))}
      </View>
      <TrendCard readings={readings} />
      <SectionHeader title="Devices" />
      {devices.length === 0 ? <EmptyState title="No devices in this room" message="Pair a sensor profile to start monitoring this room." /> : null}
      {devices.map((device) => (
        <DeviceCard key={device.id} device={device} />
      ))}
    </AppScreen>
  );
}

function TrendCard({ readings }: { readings: Reading[] }) {
  const score = readings.length ? Math.min(100, Math.max(12, readings.filter((reading) => reading.status === "good").length * 25)) : 0;
  return (
    <AppCard subtleShadow style={styles.trend}>
      <View style={styles.trendHeader}>
        <AppText style={styles.trendTitle}>Air Quality Trends</AppText>
        <AppText variant="caption">{readings.length ? "Latest snapshot" : "No data yet"}</AppText>
      </View>
      <View style={styles.trendBars}>
        {[34, 48, 42, score || 28, score || 36, score || 52].map((height, index) => (
          <View key={`${height}-${index}`} style={styles.trendSlot}>
            <View style={[styles.trendBar, { height }]} />
          </View>
        ))}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  roomHero: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
    minHeight: 82,
  },
  roomIcon: {
    alignItems: "center",
    backgroundColor: colors.iconSurface,
    borderRadius: radius.md,
    height: 48,
    justifyContent: "center",
    width: 54,
  },
  roomHeroCopy: {
    flex: 1,
    minWidth: 0,
  },
  roomHeroTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 26,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  trend: {
    gap: spacing.sm,
  },
  trendHeader: {
    gap: 2,
  },
  trendTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  trendBars: {
    alignItems: "flex-end",
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    flexDirection: "row",
    gap: spacing.xs,
    height: 112,
    justifyContent: "space-between",
    padding: spacing.md,
  },
  trendSlot: {
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  trendBar: {
    backgroundColor: colors.brandCyan,
    borderRadius: radius.pill,
    width: "70%",
  },
});
