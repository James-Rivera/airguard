import React from "react";
import { StyleSheet, View } from "react-native";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Device } from "@/domain/models";
import { formatRelativeMinutes } from "@/lib/formatters";
import { colors, radius, spacing } from "@/theme/index";

const deviceIcon = {
  "air-sensor": "AQ",
  "ventilation-fan": "Fan",
  "smoke-detector": "Smk",
  alarm: "Alm",
};

export function DeviceCard({ device }: { device: Device }) {
  const meta = device.powerConnected ? "Connected" : device.batteryLevel ? `Battery ${device.batteryLevel}%` : "Battery unknown";
  return (
    <AppCard style={styles.card}>
      <View style={styles.icon}>
        <AppText style={styles.iconText}>{deviceIcon[device.type]}</AppText>
      </View>
      <View style={styles.copy}>
        <AppText style={styles.name}>{device.name}</AppText>
        <StatusBadge status={device.status} />
        <AppText variant="muted">{meta} • {formatRelativeMinutes(device.lastUpdatedMinutesAgo)}</AppText>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    flexDirection: "row",
    gap: 23,
    minHeight: 82,
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
  iconText: {
    color: colors.brand,
    fontSize: 11,
    fontWeight: "700",
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
});
