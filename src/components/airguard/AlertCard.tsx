import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Alert } from "@/domain/models";
import { formatAlertTime } from "@/lib/formatters";
import { colors, fonts, radius, spacing } from "@/theme/index";

export function AlertCard({ alert, onPress, actionLabel, onAction }: { alert: Alert; onPress?: () => void; actionLabel?: string; onAction?: () => void }) {
  const badgeStatus = alert.status === "resolved" || alert.status === "checking" ? alert.status : alert.severity;
  const card = (
    <AppCard subtleShadow style={[styles.card, alert.severity === "critical" && styles.criticalCard]}>
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <AppText style={styles.title}>{alert.title}</AppText>
          <AppText style={styles.room}>{alert.roomName}</AppText>
        </View>
        <StatusBadge status={badgeStatus} />
      </View>
      <AppText style={styles.message}>{alert.message}</AppText>
      <AppText style={styles.action}>Recommended action: {alert.recommendedAction}</AppText>
      <AppText variant="muted">{formatAlertTime(alert.createdAt)}</AppText>
      {actionLabel && onAction ? (
        <AppButton label={actionLabel} onPress={onAction} variant={alert.severity === "critical" ? "danger" : "primary"} style={styles.button} />
      ) : null}
    </AppCard>
  );
  return onPress ? <Pressable onPress={onPress}>{card}</Pressable> : card;
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
    minHeight: 176,
    padding: spacing.md,
    width: "100%",
  },
  criticalCard: {
    borderColor: colors.borderDanger,
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
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  room: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  message: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  action: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    borderRadius: radius.md,
    height: 40,
  },
});
