import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppCard } from "@/components/ui/AppCard";
import { AppIcon } from "@/components/ui/AppIcon";
import { AppText } from "@/components/ui/AppText";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Reading, Room, SafetyStatus } from "@/domain/models";
import { colors, fonts, radius, spacing, statusColors } from "@/theme/index";

export function RoomCard({
  room,
  readings = [],
  onPress,
  wide = false,
  cardWidth,
}: {
  room: Room;
  readings?: Reading[];
  onPress?: () => void;
  wide?: boolean;
  cardWidth?: number;
}) {
  const primary = readings.find((reading) => reading.type === "co2") ?? readings[0];
  const statusLabel = roomStatusLabel(room.status);
  const card = (
    <AppCard subtleShadow padded={false} style={[styles.card, wide ? styles.wide : styles.grid, cardWidth ? { width: cardWidth } : null]}>
      {wide ? (
        <>
          <View style={styles.wideHeader}>
            <View style={styles.roomTitleRow}>
              <View style={styles.wideIcon}>
                <AppIcon name={room.icon} size={24} color={colors.brand} secondaryColor={colors.brand} />
              </View>
              <AppText style={styles.wideName} numberOfLines={1}>
                {room.name}
              </AppText>
            </View>
            <StatusBadge status={room.status} />
          </View>
          <AppText style={styles.primaryReading}>{primary ? `${primary.label} ${formatReading(primary)}` : "No readings yet"}</AppText>
          <View style={styles.metrics}>
            {metricTiles(readings).map((metric) => (
              <View key={metric.label} style={styles.metric}>
                <AppText style={styles.metricLabel} numberOfLines={1}>
                  {metric.label}
                </AppText>
                <AppText style={styles.metricValue} numberOfLines={1} adjustsFontSizeToFit>
                  {metric.value}
                </AppText>
              </View>
            ))}
          </View>
        </>
      ) : (
        <>
          <View style={styles.icon}>
            <AppIcon name={room.icon} size={24} color={colors.brand} secondaryColor={colors.brand} />
          </View>
          <View style={styles.copy}>
            <AppText style={[styles.name, room.status === "offline" && styles.nameMuted]} numberOfLines={1}>
              {room.name}
            </AppText>
            <AppText style={[styles.status, { color: statusColors[room.status] ?? colors.textSecondary }]}>{statusLabel}</AppText>
          </View>
        </>
      )}
    </AppCard>
  );
  return onPress ? <Pressable onPress={onPress}>{card}</Pressable> : card;
}

function roomStatusLabel(status: SafetyStatus) {
  if (status === "good") return "Online";
  if (status === "offline") return "Offline";
  if (status === "warning") return "Warning";
  return "Critical";
}

function formatReading(reading: Reading) {
  if (reading.unit === "%") return `${reading.value}%`;
  if (reading.unit === "C" || reading.unit === "\u00B0C" || reading.unit === "\u00C2\u00B0C") return `${reading.value}\u00B0C`;
  return `${reading.value} ${reading.unit}`;
}

function metricTiles(readings: Reading[]) {
  const types: Array<{ label: string; type: Reading["type"] }> = [
    { label: "CO2", type: "co2" },
    { label: "Humidity", type: "humidity" },
    { label: "Temp", type: "temperature" },
    { label: "Smoke", type: "smoke" },
  ];

  return types.map((item) => {
    const reading = readings.find((candidate) => candidate.type === item.type);
    return {
      label: item.label,
      value: reading ? formatReading(reading).replace(" ppm", "") : "--",
    };
  });
}

const styles = StyleSheet.create({
  card: {
    borderColor: colors.borderStrong,
    borderRadius: radius.card,
  },
  grid: {
    gap: spacing.xs,
    height: 112,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    width: 161,
  },
  wide: {
    gap: spacing.sm,
    minHeight: 162,
    padding: spacing.md,
    width: "100%",
  },
  icon: {
    alignItems: "center",
    backgroundColor: colors.iconSurface,
    borderRadius: radius.md,
    height: 40,
    justifyContent: "center",
    width: 53,
  },
  copy: {
    gap: 3,
  },
  name: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 15,
    lineHeight: 20,
  },
  nameMuted: {
    color: colors.textSecondary,
  },
  status: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 20,
  },
  wideHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 30,
  },
  roomTitleRow: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minWidth: 0,
    paddingRight: spacing.sm,
  },
  wideIcon: {
    alignItems: "center",
    backgroundColor: colors.iconSurface,
    borderRadius: radius.md,
    height: 40,
    justifyContent: "center",
    width: 46,
  },
  wideName: {
    color: colors.textPrimary,
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 17,
    lineHeight: 22,
  },
  primaryReading: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 18,
  },
  metrics: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  metric: {
    alignItems: "center",
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 16,
    flex: 1,
    gap: 2,
    height: 58,
    justifyContent: "center",
    minWidth: 0,
  },
  metricLabel: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 13,
  },
  metricValue: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
});
