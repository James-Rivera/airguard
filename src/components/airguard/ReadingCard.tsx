import React from "react";
import { StyleSheet } from "react-native";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Reading } from "@/domain/models";
import { formatReadingValue } from "@/lib/formatters";
import { spacing } from "@/theme/index";

export function ReadingCard({ reading }: { reading: Reading }) {
  return (
    <AppCard style={styles.card}>
      <AppText variant="caption">{reading.label}</AppText>
      <AppText style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {formatReadingValue(reading.value, reading.unit)}
      </AppText>
      <StatusBadge status={reading.status} />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
    minHeight: 86,
    width: 166,
  },
  value: {
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 26,
  },
});
