import React from "react";
import { StyleSheet } from "react-native";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { colors, fonts, radius, spacing } from "@/theme/index";

export function SummaryCard({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <AppCard subtleShadow style={styles.card}>
      <AppText style={styles.label}>{label}</AppText>
      <AppText style={styles.value}>{value}</AppText>
      <AppText style={styles.detail}>{detail}</AppText>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.summary,
    flex: 1,
    gap: spacing.xxs,
    minHeight: 109,
    padding: 14,
  },
  label: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  value: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 37,
  },
  detail: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
  },
});
