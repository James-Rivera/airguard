import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { LogoMark } from "./LogoMark";
import { colors, gradient, radius, shadows, spacing } from "@/theme/index";

export function SafetyStatusCard({ status, onAction }: { status: "good" | "critical"; onAction: () => void }) {
  const critical = status === "critical";
  if (critical) {
    return (
      <View style={[styles.card, styles.critical]}>
        <View style={styles.top}>
          <View style={styles.alertIcon}>
            <AppText style={styles.alertText}>!</AppText>
          </View>
          <AppText style={styles.criticalPill}>Critical</AppText>
        </View>
        <AppText style={styles.criticalTitle}>Kitchen needs attention</AppText>
        <AppText style={styles.criticalBody}>Smoke detected. Check the kitchen and turn on ventilation.</AppText>
        <AppButton label="Open Alert" onPress={onAction} variant="danger" />
      </View>
    );
  }

  return (
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
      <View style={styles.top}>
        <View style={styles.logoWrap}>
          <LogoMark size={34} />
        </View>
        <View style={styles.goodPill}>
          <View style={styles.dot} />
          <AppText style={styles.goodPillText}>Good</AppText>
        </View>
      </View>
      <AppText style={styles.heroTitle}>Your home air is safe</AppText>
      <AppText style={styles.heroBody}>All monitored rooms are within normal range.</AppText>
      <AppButton label="View Rooms" onPress={onAction} variant="secondary" />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    gap: spacing.md,
    minHeight: 224,
    padding: spacing.md,
    width: "100%",
    ...shadows.card,
  },
  critical: {
    backgroundColor: colors.criticalSurface,
    borderColor: colors.borderDanger,
    borderWidth: 1,
  },
  top: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  logoWrap: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: radius.md,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  goodPill: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 34,
    paddingHorizontal: spacing.sm,
  },
  goodPillText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "700",
  },
  dot: {
    backgroundColor: colors.leaf,
    borderRadius: radius.pill,
    height: 8,
    width: 8,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 30,
    fontWeight: "700",
    lineHeight: 36,
  },
  heroBody: {
    color: colors.heroText,
    fontSize: 14,
    lineHeight: 20,
  },
  alertIcon: {
    alignItems: "center",
    backgroundColor: colors.critical,
    borderRadius: radius.md,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  alertText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "700",
  },
  criticalPill: {
    color: colors.critical,
    fontSize: 12,
    fontWeight: "700",
  },
  criticalTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 30,
  },
  criticalBody: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
