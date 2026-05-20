import React, { useMemo, useState } from "react";
import { Alert as NativeAlert, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { AirQualityTrendChart, buildAirQualityTrendData } from "@/components/airguard/AirQualityTrendChart";
import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Device, Reading, SafetyStatus } from "@/domain/models";
import { getActiveAlerts, getDeviceById, getReadingsByDeviceId, getRoomById } from "@/domain/selectors";
import { useHomeDataRefresh } from "@/hooks/useHomeDataRefresh";
import { routes } from "@/navigation/routes";
import { useAirGuard } from "@/state/airguard-store";
import { colors, fonts, layout, radius, shadows, spacing, statusColors } from "@/theme/index";

const readingTiles: Array<{ type: Reading["type"]; label: string; icon: AppIconName; fallbackUnit: string }> = [
  { type: "co2", label: "CO2", icon: "co2", fallbackUnit: "ppm" },
  { type: "smoke", label: "PM2.5", icon: "smoke", fallbackUnit: "ug/m3" },
  { type: "temperature", label: "Temperature", icon: "temperature", fallbackUnit: "C" },
  { type: "humidity", label: "Humidity", icon: "humidity", fallbackUnit: "%" },
];

export default function DeviceDetailRoute() {
  const { deviceId } = useLocalSearchParams<{ deviceId: string }>();
  const { state, actions } = useAirGuard();
  const insets = useSafeAreaInsets();
  const refreshControl = useHomeDataRefresh();
  const { width } = useWindowDimensions();
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [isRestarting, setIsRestarting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const device = getDeviceById(state, deviceId);
  const room = device ? getRoomById(state, device.roomId) : undefined;
  const readings = device ? getReadingsByDeviceId(state, device.id) : [];
  const activeAlert = device ? getActiveAlerts(state).find((alert) => alert.deviceId === device.id || alert.roomId === device.roomId) : undefined;
  const deviceStatus = getDevicePresentationStatus(device, room?.status ?? "good", readings, activeAlert?.severity);
  const title = device?.name ?? "Air Sensor";
  const shellWidth = Math.min(width, layout.maxPhoneWidth);
  const contentWidth = shellWidth - layout.screenPadding * 2;
  const cardWidth = Math.floor((contentWidth - spacing.md) / 2);
  const trendData = useMemo(() => buildAirQualityTrendData(readings, room?.status ?? "good"), [readings, room?.status]);

  async function restartDevice() {
    if (!device || isRestarting || isRemoving) return;
    setActionError("");
    setActionMessage("");
    setIsRestarting(true);
    try {
      await actions.restartDevice(device.id);
      setActionMessage(`${device.name} restarted and returned to monitoring.`);
    } catch (err) {
      console.warn("[AirGuard] Restart device failed", err);
      setActionError("Device could not be restarted. Please try again.");
    } finally {
      setIsRestarting(false);
    }
  }

  async function removeCurrentDevice() {
    if (!device || isRemoving) return;
    setActionError("");
    setActionMessage("");
    setIsRemoving(true);
    try {
      await actions.removeDevice(device.id);
      router.replace(routes.devices);
    } catch (err) {
      console.warn("[AirGuard] Remove device failed", err);
      setActionError("Device could not be removed. Please try again.");
      setIsRemoving(false);
    }
  }

  function confirmRemoveDevice() {
    if (isRestarting || isRemoving) return;
    NativeAlert.alert("Remove device?", `${title} will stop contributing readings for this home.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove Device",
        style: "destructive",
        onPress: () => {
          void removeCurrentDevice();
        },
      },
    ]);
  }

  if (!device) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <Header title="Air Sensor" onBack={() => router.back()} />
        <View style={styles.notFound}>
          <EmptyState title="Device not found" message="Go back and choose another monitored device." iconName="sensor" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Header title={title} onBack={() => router.back()} />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
      >
        <DeviceStatusCard device={device} title={room ? `${room.name} monitoring` : title} status={deviceStatus} />

        {activeAlert ? (
          <View style={styles.alertStrip}>
            <AppIcon name="alert" size={18} color={statusColors[activeAlert.severity]} secondaryColor={statusColors[activeAlert.severity]} />
            <View style={styles.alertCopy}>
              <AppText style={styles.alertTitle}>{activeAlert.title}</AppText>
              <AppText variant="caption">{activeAlert.recommendedAction}</AppText>
            </View>
          </View>
        ) : null}

        <View style={styles.sectionBlock}>
          <AppText style={styles.sectionTitle}>Current Readings</AppText>
          <View style={styles.readingGrid}>
            {readingTiles.map((tile) => (
              <ReadingTile
                key={tile.type}
                tile={tile}
                reading={readings.find((item) => item.type === tile.type)}
                cardWidth={cardWidth}
              />
            ))}
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.trendHeader}>
            <AppText style={styles.sectionTitle}>Air Quality Trends</AppText>
            <View style={styles.filterPill}>
              <AppText style={styles.filterText}>Today</AppText>
              <ChevronDown />
            </View>
          </View>
          <AirQualityTrendChart data={trendData} width={contentWidth} />
        </View>

        <View style={styles.sectionBlock}>
          <AppText style={styles.sectionTitle}>Device Actions</AppText>
          <Pressable
            style={[styles.restartAction, (isRestarting || isRemoving) && styles.actionDisabled]}
            onPress={restartDevice}
            disabled={isRestarting || isRemoving}
            accessibilityRole="button"
          >
            <View style={styles.actionLeft}>
              <AppIcon name="power" size={18} color={colors.textPrimary} secondaryColor={colors.brand} />
              <AppText style={styles.restartText}>{isRestarting ? "Restarting Device" : "Restart Device"}</AppText>
            </View>
            <AppIcon name="chevron-right" size={20} color={colors.textPrimary} secondaryColor={colors.textPrimary} />
          </Pressable>
          <Pressable
            style={[styles.removeAction, (isRestarting || isRemoving) && styles.actionDisabled]}
            onPress={confirmRemoveDevice}
            disabled={isRestarting || isRemoving}
            accessibilityRole="button"
          >
            <AppIcon name="logout" size={18} color="#93000A" secondaryColor="#93000A" />
            <AppText style={styles.removeText}>{isRemoving ? "Removing Device" : "Remove Device"}</AppText>
          </Pressable>
          {actionError ? <AppText style={styles.actionError}>{actionError}</AppText> : null}
          {actionMessage ? <AppText style={styles.actionMessage}>{actionMessage}</AppText> : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Pressable onPress={onBack} style={styles.headerIconButton} accessibilityRole="button" accessibilityLabel="Go back">
          <BackArrow />
        </Pressable>
        <AppText style={styles.headerTitle} numberOfLines={1}>{title}</AppText>
      </View>
    </View>
  );
}

function DeviceStatusCard({ device, title, status }: { device: Device; title: string; status: SafetyStatus | "online" }) {
  const statusLabel = status === "critical" ? "Critical" : status === "warning" ? "Warning" : status === "offline" ? "Offline" : "Online";
  const lastSynced = device.status === "offline" ? "Last synced: Not currently connected" : `Last synced: ${formatLastSynced(device.lastUpdatedMinutesAgo)}`;
  const batteryText = typeof device.batteryLevel === "number" ? `Battery: ${device.batteryLevel}%` : device.powerConnected ? "Power connected" : "Battery: --";
  return (
    <View style={styles.statusCard}>
      <View style={[styles.deviceIconHalo, status === "offline" && styles.deviceIconOffline]}>
        <AppIcon name={deviceIcon(device)} size={28} color={status === "offline" ? colors.textMuted : colors.brand} secondaryColor={status === "offline" ? colors.textMuted : colors.brand} />
      </View>
      <View style={styles.statusCopy}>
        <AppText style={[styles.statusTitle, { color: status === "critical" ? colors.critical : colors.textInk }]}>{statusLabel}</AppText>
        <AppText style={styles.syncText}>{lastSynced}</AppText>
      </View>
      <View style={styles.batteryPill}>
        <AppIcon name="battery" size={15} color={colors.textPrimary} secondaryColor={colors.success} />
        <AppText style={styles.batteryText}>{batteryText}</AppText>
      </View>
      <AppText style={styles.deviceCaption} numberOfLines={1}>{title}</AppText>
    </View>
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
    <View style={[styles.readingCard, { width: cardWidth }]}>
      <View style={styles.readingLabelRow}>
        <AppIcon name={tile.icon} size={13} color={colors.textGraphite} secondaryColor={colors.textGraphite} />
        <AppText style={styles.readingLabel}>{tile.label}</AppText>
      </View>
      <View style={styles.readingValueRow}>
        <AppText style={styles.readingValue}>{value}</AppText>
        <AppText style={styles.readingUnit}>{unit}</AppText>
      </View>
      <AppText style={[styles.readingStatus, { color: status === "good" ? "#006C49" : statusColors[status] ?? colors.textGraphite }]}>{statusLabel}</AppText>
    </View>
  );
}

function getDevicePresentationStatus(
  device: Device | undefined,
  roomStatus: SafetyStatus,
  readings: Reading[],
  alertSeverity?: "warning" | "critical",
): SafetyStatus | "online" {
  if (device?.status === "offline" || roomStatus === "offline") return "offline";
  if (alertSeverity === "critical" || roomStatus === "critical" || readings.some((reading) => reading.status === "critical")) return "critical";
  if (alertSeverity === "warning" || roomStatus === "warning" || readings.some((reading) => reading.status === "warning")) return "warning";
  return "online";
}

function deviceIcon(device?: Device): AppIconName {
  if (device?.type === "smoke-detector") return "smoke";
  if (device?.type === "co2-sensor") return "co2";
  if (device?.type === "ventilation-fan") return "fan";
  if (device?.type === "alarm") return "alert";
  return "sensor";
}

function formatLastSynced(minutes?: number) {
  if (typeof minutes !== "number" || minutes <= 0) return "Just now";
  if (minutes === 1) return "1 min ago";
  if (minutes < 60) return `${minutes} mins ago`;
  return `${Math.round(minutes / 60)} hr ago`;
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

function BackArrow() {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      <Path d="M17.5 7 10.5 14l7 7M11 14h12" stroke={colors.textPrimary} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChevronDown() {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
      <Path d="m4 6 4 4 4-4" stroke={colors.textPrimary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.white,
    flex: 1,
  },
  header: {
    alignItems: "center",
    backgroundColor: "#FAF8FF",
    flexDirection: "row",
    height: 64,
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  headerLeft: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.md,
    minWidth: 0,
  },
  headerIconButton: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  headerTitle: {
    color: colors.textInk,
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 24,
  },
  screen: {
    backgroundColor: colors.white,
    flex: 1,
  },
  content: {
    alignSelf: "center",
    gap: 48,
    maxWidth: layout.maxPhoneWidth,
    paddingHorizontal: 24,
    paddingTop: spacing.xs,
    width: "100%",
  },
  notFound: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
  },
  statusCard: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.readingBorder,
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.md,
    minHeight: 237,
    padding: 25,
    ...shadows.cardSubtle,
  },
  deviceIconHalo: {
    alignItems: "center",
    backgroundColor: "rgba(0,74,198,0.1)",
    borderRadius: radius.pill,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  deviceIconOffline: {
    backgroundColor: colors.offlineSurface,
  },
  statusCopy: {
    alignItems: "center",
    gap: 4,
  },
  statusTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    lineHeight: 28,
    textAlign: "center",
  },
  syncText: {
    color: colors.textGraphite,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  batteryPill: {
    alignItems: "center",
    backgroundColor: "#EAEDFF",
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 32,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  batteryText: {
    color: colors.textInk,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  deviceCaption: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    maxWidth: "100%",
  },
  alertStrip: {
    alignItems: "center",
    backgroundColor: colors.criticalSurface,
    borderColor: colors.borderDanger,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: -32,
    padding: spacing.md,
  },
  alertCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  alertTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 19,
  },
  sectionBlock: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.textInk,
    fontFamily: fonts.semiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  readingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  readingCard: {
    backgroundColor: colors.white,
    borderColor: colors.readingBorder,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
    minHeight: 102,
    padding: 17,
    ...shadows.cardSubtle,
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
    fontSize: 17,
    lineHeight: 24,
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
  trendHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterPill: {
    alignItems: "center",
    backgroundColor: "#EAEDFF",
    borderRadius: 8,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 36,
    paddingHorizontal: spacing.sm,
  },
  filterText: {
    color: colors.textInk,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  restartAction: {
    alignItems: "center",
    backgroundColor: "#EAEDFF",
    borderRadius: 12,
    flexDirection: "row",
    height: 56,
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  actionLeft: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  restartText: {
    color: colors.textInk,
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 24,
  },
  removeAction: {
    alignItems: "center",
    backgroundColor: "#FFDAD6",
    borderRadius: 12,
    flexDirection: "row",
    gap: spacing.xs,
    height: 56,
    justifyContent: "center",
  },
  removeText: {
    color: "#93000A",
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 24,
  },
  actionDisabled: {
    opacity: 0.55,
  },
  actionError: {
    color: colors.critical,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  actionMessage: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
  },
});
