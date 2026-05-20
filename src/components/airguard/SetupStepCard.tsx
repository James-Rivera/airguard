import React from "react";
import { StyleSheet, View } from "react-native";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { colors, radius, spacing } from "@/theme/index";

export function SetupStepCard({ label, detail, done }: { label: string; detail: string; done: boolean }) {
  return (
    <AppCard style={[styles.card, done && styles.cardDone]}>
      <View style={[styles.indicator, done && styles.indicatorDone]}>
        <AppText style={[styles.indicatorText, done && styles.indicatorTextDone]}>{done ? "OK" : ""}</AppText>
      </View>
      <View style={styles.copy}>
        <AppText style={styles.label}>{label}</AppText>
        <AppText variant="caption">{detail}</AppText>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 76,
  },
  cardDone: {
    borderColor: colors.success,
  },
  indicator: {
    alignItems: "center",
    backgroundColor: colors.iconSurface,
    borderRadius: radius.pill,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  indicatorDone: {
    backgroundColor: colors.successSurface,
  },
  indicatorText: {
    color: colors.brand,
    fontSize: 10,
    fontWeight: "700",
  },
  indicatorTextDone: {
    color: colors.success,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
});
