import React from "react";
import { StyleSheet } from "react-native";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { spacing } from "@/theme/index";

export function SummaryCard({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <AppCard style={styles.card}>
      <AppText style={styles.label}>{label}</AppText>
      <AppText variant="metric">{value}</AppText>
      <AppText variant="muted">{detail}</AppText>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: spacing.xxs,
    minHeight: 109,
    padding: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
  },
});
