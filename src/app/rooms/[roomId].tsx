import React, { useMemo } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AirQualityTrendChart, buildAirQualityTrendData } from "@/components/airguard/AirQualityTrendChart";
import { DeviceCard } from "@/components/airguard/DeviceCard";
import { AppCard } from "@/components/ui/AppCard";
import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";
import { AppScreen, SectionHeader } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Reading, SafetyStatus } from "@/domain/models";
import { getActiveAlerts, getDevicesByRoomId, getLatestReadingForDevice, getReadingsByRoomId, getRoomById } from "@/domain/selectors";
import { useHomeDataRefresh } from "@/hooks/useHomeDataRefresh";
import { routes } from "@/navigation/routes";
import { useAirGuard } from "@/state/airguard-store";
import { colors, fonts, layout, radius, spacing, statusColors } from "@/theme/index";

const readingTiles: Array<{ type: Reading["type"]; label: string; icon: AppIconName; fallbackUnit: string }> = [
  { type: "co2", label: "CO2", icon: "co2", fallbackUnit: "ppm" },
  { type: "smoke", label: "PM2.5", icon: "smoke", fallbackUnit: "ug/m3" },
  { type: "temperature", label: "Temperature", icon: "temperature", fallbackUnit: "C" },
  { type: "humidity", label: "Humidity", icon: "humidity", fallbackUnit: "%" },
];

export default function RoomDetailRoute() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { state } = useAirGuard();
  const refreshControl = useHomeDataRefresh();
  const { width } = useWindowDimensions();
  const room = getRoomById(state, roomId);
  const readings = room ? getReadingsByRoomId(state, room.id) : [];
  const devices = room ? getDevicesByRoomId(state, room.id) : [];
  const activeAlert = room ? getActiveAlerts(state).find((alert) => alert.roomId === room.id) : undefined;
  const shellWidth = Math.min(width, layout.maxPhoneWidth);
  const contentWidth = shellWidth - layout.screenPadding * 2;
  const cardWidth = Math.floor((contentWidth - spacing.md) / 2);
  const trendData = useMemo(() => buildAirQualityTrendData(readings, room?.status ?? "good"), [readings, room?.status]);

  if (!room) {
    return (
      <AppScreen title="Room" subtitle="Room not found" onBack={() => router.back()} noBottomPadding refreshControl={refreshControl}>
        <EmptyState title="Room not found" message="Go back and choose another monitored room." iconName="rooms" />
      </AppScreen>
    );
  }

  return (
    <AppScreen title={room.name} subtitle="Room overview" onBack={() => router.back()} noBottomPadding refreshControl={refreshControl}>
      <RoomSummary roomStatus={room.status} deviceCount={devices.length} readingCount={readings.length} />

      {activeAlert ? (
        <Pressable onPress={() => router.push(routes.alertDetail(activeAlert.id))} accessibilityRole="button" accessibilityLabel={`Open alert ${activeAlert.title}`}>
          <AppCard style={styles.alertBanner}>
            <View style={styles.alertIcon}>
              <AppIcon name="alert" size={30} color={colors.white} secondaryColor={colors.white} />
            </View>
            <View style={styles.alertCopy}>
              <AppText style={styles.alertEyebrow}>{activeAlert.severity === "critical" ? "Critical room alert" : "Room warning"}</AppText>
              <AppText style={styles.alertTitle}>{activeAlert.title}</AppText>
              <AppText style={styles.alertBody}>{activeAlert.recommendedAction}</AppText>
            </View>
          </AppCard>
        </Pressable>
      ) : null}

      <SectionHeader title="Current Readings" />
      <View style={styles.readingGrid}>
        {readingTiles.map((tile) => (
          <ReadingTile key={tile.type} tile={tile} reading={readings.find((item) => item.type === tile.type)} cardWidth={cardWidth} />
        ))}
      </View>

      <View style={styles.sectionBlock}>
        <View style={styles.trendHeader}>
          <AppText style={styles.sectionTitle}>Air Quality Trends</AppText>
          <View style={styles.filterPill}>
            <AppText style={styles.filterText}>Today</AppText>
          </View>
        </View>
        <AirQualityTrendChart data={trendData} width={contentWidth} emptyMessage="Apply a sensor event to build room air quality history." />
      </View>

      <SectionHeader title="Devices in this room" />
      {devices.length === 0 ? (
        <EmptyState title="No devices in this room" message="Pair a sensor profile with this room to start monitoring it." iconName="sensor" />
      ) : null}
      {devices.map((device) => (
        <DeviceCard
          key={device.id}
          device={device}
          reading={getLatestReadingForDevice(state, device.id)}
          onPress={() => router.push(routes.deviceDetail(device.id))}
        />
      ))}
    </AppScreen>
  );
}

function RoomSummary({ roomStatus, deviceCount, readingCount }: { roomStatus: SafetyStatus; deviceCount: number; readingCount: number }) {
  return (
    <AppCard style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <View style={styles.summaryIcon}>
          <AppIcon name={roomStatus === "critical" || roomStatus === "warning" ? "alert" : "shield"} size={28} color={statusColors[roomStatus]} secondaryColor={statusColors[roomStatus]} />
        </View>
        <View style={styles.summaryCopy}>
          <AppText style={styles.summaryLabel}>Room status</AppText>
          <AppText style={styles.summaryTitle}>{roomStatusLabel(roomStatus)}</AppText>
        </View>
        <StatusBadge status={roomStatus} />
      </View>
      <View style={styles.summaryStats}>
        <View style={styles.statTile}>
          <AppText style={styles.statValue}>{deviceCount}</AppText>
          <AppText style={styles.statLabel}>Devices</AppText>
        </View>
        <View style={styles.statTile}>
          <AppText style={styles.statValue}>{readingCount}</AppText>
          <AppText style={styles.statLabel}>Readings</AppText>
        </View>
      </View>
    </AppCard>
  );
}

function ReadingTile({
  tile,
  reading,
  cardWidth,
}: {
  tile: (typeof readingTiles)[number];
  reading?: Reading;
  cardWidth: number;
}) {
  const value = reading ? formatReadingValue(reading) : "--";
  const unit = reading?.unit ? normalizeUnit(reading.unit) : tile.fallbackUnit;
  const status = reading?.status ?? "offline";
  const statusLabel = reading?.statusLabel ?? "No data";
  return (
    <AppCard subtleShadow style={[styles.readingCard, { width: cardWidth }]}>
      <View style={styles.readingLabelRow}>
        <AppIcon name={tile.icon} size={15} color={colors.textGraphite} secondaryColor={colors.textGraphite} />
        <AppText style={styles.readingLabel}>{tile.label}</AppText>
      </View>
      <View style={styles.readingValueRow}>
        <AppText style={styles.readingValue}>{value}</AppText>
        <AppText style={styles.readingUnit}>{unit}</AppText>
      </View>
      <AppText style={[styles.readingStatus, { color: status === "good" ? "#006C49" : statusColors[status] ?? colors.textGraphite }]}>{statusLabel}</AppText>
    </AppCard>
  );
}

function roomStatusLabel(status: SafetyStatus) {
  if (status === "good") return "Good";
  if (status === "offline") return "Offline";
  if (status === "warning") return "Warning";
  return "Critical";
}

function formatReadingValue(reading: Reading) {
  if (reading.type === "temperature") return Number.isInteger(reading.value) ? String(reading.value) : reading.value.toFixed(1);
  return String(Math.round(reading.value));
}

function normalizeUnit(unit: string) {
  if (unit === "C") return "\u00B0C";
  if (unit === "ug/m3") return "ug/m3";
  return unit;
}

const styles = StyleSheet.create({
  summaryCard: {
    gap: spacing.md,
    padding: spacing.md,
  },
  summaryHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  summaryIcon: {
    alignItems: "center",
    backgroundColor: colors.iconSurface,
    borderRadius: radius.lg,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  summaryCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  summaryTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 22,
    lineHeight: 28,
  },
  summaryStats: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  statTile: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.lg,
    flex: 1,
    gap: 2,
    minHeight: 68,
    padding: spacing.md,
  },
  statValue: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 26,
  },
  statLabel: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  alertBanner: {
    alignItems: "center",
    backgroundColor: colors.criticalSurface,
    borderColor: colors.borderDanger,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },
  alertIcon: {
    alignItems: "center",
    backgroundColor: colors.critical,
    borderRadius: radius.pill,
    height: 58,
    justifyContent: "center",
    width: 58,
  },
  alertCopy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  alertEyebrow: {
    color: colors.critical,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 16,
    textTransform: "uppercase",
  },
  alertTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 26,
  },
  alertBody: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  readingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  readingCard: {
    borderColor: colors.readingBorder,
    borderRadius: 12,
    gap: 5,
    minHeight: 106,
    padding: 17,
  },
  readingLabelRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  readingLabel: {
    color: colors.textGraphite,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    letterSpacing: 0.6,
    lineHeight: 16,
  },
  readingValueRow: {
    alignItems: "baseline",
    flexDirection: "row",
    paddingTop: 4,
  },
  readingValue: {
    color: colors.textInk,
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 25,
  },
  readingUnit: {
    color: colors.textGraphite,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  readingStatus: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  sectionBlock: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  trendHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterPill: {
    alignItems: "center",
    backgroundColor: "#EAEDFF",
    borderRadius: 8,
    minHeight: 36,
    paddingHorizontal: spacing.sm,
    justifyContent: "center",
  },
  filterText: {
    color: colors.textInk,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
});
