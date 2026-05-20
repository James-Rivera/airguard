import React from "react";
import { StyleSheet, View } from "react-native";
import { AppCard } from "@/components/ui/AppCard";
import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";
import { AppText } from "@/components/ui/AppText";
import type { Reading, SafetyStatus } from "@/domain/models";
import { colors, fonts, spacing, statusColors } from "@/theme/index";

export function ReadingCard({
  reading,
  cardWidth,
  label,
  type,
}: {
  reading?: Reading;
  cardWidth?: number;
  label?: string;
  type?: Reading["type"];
}) {
  const tileType = reading?.type ?? type ?? "co2";
  const value = reading ? formatReadingValue(reading) : { amount: "--", unit: "" };
  const status: SafetyStatus = reading?.status ?? "offline";
  return (
    <AppCard padded={false} style={[styles.card, cardWidth ? { width: cardWidth } : null]}>
      <View style={styles.heading}>
        <AppIcon name={readingIcon(tileType)} size={13} color={colors.textGraphite} secondaryColor={colors.textGraphite} />
        <AppText style={styles.label} numberOfLines={1}>
          {label ?? reading?.label ?? readingLabel(tileType)}
        </AppText>
      </View>
      <View style={styles.valueRow}>
        <AppText style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
          {value.amount}
        </AppText>
        <AppText style={styles.unit} numberOfLines={1}>
          {value.unit}
        </AppText>
      </View>
      <AppText style={[styles.status, { color: statusColors[status] ?? colors.textSecondary }]} numberOfLines={1}>
        {reading?.statusLabel ?? "No data"}
      </AppText>
    </AppCard>
  );
}

function readingIcon(type: Reading["type"]): AppIconName {
  if (type === "temperature") return "temperature";
  if (type === "humidity") return "humidity";
  if (type === "smoke") return "smoke";
  return "co2";
}

function formatReadingValue(reading: Reading) {
  if (reading.unit === "%") return { amount: String(reading.value), unit: "%" };
  if (reading.unit === "C" || reading.unit === "\u00B0C" || reading.unit === "\u00C2\u00B0C") return { amount: String(reading.value), unit: "\u00B0C" };
  return { amount: String(reading.value), unit: reading.unit };
}

function readingLabel(type: Reading["type"]) {
  if (type === "temperature") return "Temperature";
  if (type === "humidity") return "Humidity";
  if (type === "smoke") return "Smoke";
  return "CO2";
}

const styles = StyleSheet.create({
  card: {
    borderColor: colors.readingBorder,
    borderRadius: 12,
    gap: spacing.xs,
    minHeight: 102,
    padding: 17,
    width: 162,
  },
  heading: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 16,
  },
  label: {
    color: colors.textGraphite,
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    letterSpacing: 0.6,
    lineHeight: 16,
  },
  valueRow: {
    alignItems: "baseline",
    flexDirection: "row",
    paddingTop: 4,
  },
  value: {
    color: colors.textInk,
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 24,
  },
  unit: {
    color: colors.textGraphite,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  status: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    letterSpacing: 0.6,
    lineHeight: 16,
  },
});
