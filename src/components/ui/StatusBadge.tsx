import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { colors, fonts, radius, spacing, statusColors, statusSurfaces } from "@/theme/index";
import type { AlertStatus, SafetyStatus } from "@/domain/models";

type BadgeStatus = SafetyStatus | AlertStatus | "online" | "pairing";

const labels: Record<BadgeStatus, string> = {
  good: "Good",
  warning: "Warning",
  critical: "Critical",
  offline: "Offline",
  online: "Online",
  pairing: "Pairing",
  active: "Active",
  checking: "Checking",
  resolved: "Resolved",
};

export function StatusBadge({ status }: { status: BadgeStatus }) {
  return (
    <View style={[styles.badge, { backgroundColor: statusSurfaces[status] ?? colors.surfaceSubtle }]}>
      <AppText style={[styles.label, { color: statusColors[status] ?? colors.textSecondary }]}>{labels[status]}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    minHeight: 28,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
});
