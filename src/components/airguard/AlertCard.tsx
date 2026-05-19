import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Alert } from "@/domain/models";
import { formatAlertTime } from "@/lib/formatters";
import { colors, spacing } from "@/theme/index";

export function AlertCard({ alert, onPress, actionLabel, onAction }: { alert: Alert; onPress?: () => void; actionLabel?: string; onAction?: () => void }) {
  const card = (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <AppText style={styles.title}>{alert.title}</AppText>
          <AppText variant="caption">{alert.roomName}</AppText>
        </View>
        <StatusBadge status={alert.severity} />
      </View>
      <AppText variant="body">{alert.message}</AppText>
      <AppText style={styles.action}>Recommended action: {alert.recommendedAction}</AppText>
      <AppText variant="muted">{formatAlertTime(alert.createdAt)}</AppText>
      {actionLabel && onAction ? <AppButton label={actionLabel} onPress={onAction} variant={alert.severity === "critical" ? "danger" : "primary"} /> : null}
    </AppCard>
  );
  return onPress ? <Pressable onPress={onPress}>{card}</Pressable> : card;
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    minHeight: 176,
    width: "100%",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  titleGroup: {
    flex: 1,
    gap: 2,
    paddingRight: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  action: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
});
