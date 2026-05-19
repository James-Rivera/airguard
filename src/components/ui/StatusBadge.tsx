import React from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { colors, radius, spacing, statusColors, statusSurfaces } from "@/theme/index";
import type { SafetyStatus } from "@/domain/models";

type BadgeStatus = SafetyStatus | "online" | "active" | "resolved";

const labels: Record<BadgeStatus, string> = {
  good: "Good",
  warning: "Warning",
  critical: "Critical",
  offline: "Offline",
  online: "Online",
  active: "Active",
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
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },
});
