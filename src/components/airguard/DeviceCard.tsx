import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppCard } from "@/components/ui/AppCard";
import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";
import { AppText } from "@/components/ui/AppText";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Device, Reading } from "@/domain/models";
import { getDeviceTypeLabel } from "@/domain/selectors";
import { formatRelativeMinutes } from "@/lib/formatters";
import { colors, fonts, radius, spacing } from "@/theme/index";

export function DeviceCard({ device, reading, onPress }: { device: Device; reading?: Reading; onPress?: () => void }) {
  const connection = device.powerConnected ? "Connected" : device.batteryLevel ? `Battery ${device.batteryLevel}%` : "Battery unknown";
  const meta = reading ? `${reading.label} ${formatReading(reading)} - ${connection}` : `${connection} - ${formatRelativeMinutes(device.lastUpdatedMinutesAgo)}`;
  const card = (
    <AppCard subtleShadow style={styles.card}>
      <View style={styles.icon}>
        <AppIcon name={deviceIcon(device.type)} size={22} color={colors.brand} secondaryColor={colors.brand} />
      </View>
      <View style={styles.copy}>
        <AppText style={styles.name}>{device.name}</AppText>
        <View style={styles.metaRow}>
          <StatusBadge status={device.status} />
          <AppText style={styles.type}>{getDeviceTypeLabel(device.type)}</AppText>
        </View>
        <AppText variant="muted">{meta}</AppText>
      </View>
    </AppCard>
  );
  return onPress ? (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Open ${device.name}`}>
      {card}
    </Pressable>
  ) : (
    card
  );
}

function deviceIcon(type: Device["type"]): AppIconName {
  if (type === "ventilation-fan") return "fan";
  if (type === "smoke-detector") return "smoke";
  if (type === "co2-sensor") return "co2";
  if (type === "alarm") return "alert";
  return "sensor";
}

function formatReading(reading: Reading) {
  if (reading.unit === "%") return `${Math.round(reading.value)}%`;
  if (reading.unit === "C" || reading.unit === "\u00B0C" || reading.unit === "\u00C2\u00B0C") return `${reading.value}\u00B0C`;
  return `${Math.round(reading.value)} ${reading.unit}`;
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    borderColor: colors.borderStrong,
    borderRadius: radius.card,
    flexDirection: "row",
    gap: 23,
    minHeight: 86,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  icon: {
    alignItems: "center",
    backgroundColor: colors.iconSurface,
    borderRadius: radius.md,
    height: 40,
    justifyContent: "center",
    width: 42,
  },
  copy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  name: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  type: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
  },
});
