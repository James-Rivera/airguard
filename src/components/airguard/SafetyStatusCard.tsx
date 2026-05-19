import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AppButton } from "@/components/ui/AppButton";
import { AppIcon } from "@/components/ui/AppIcon";
import { AppText } from "@/components/ui/AppText";
import { colors, fonts, gradient, radius, shadows, spacing } from "@/theme/index";

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
        <View style={styles.safeIcon}>
          <AppIcon name="check" size={18} color={colors.white} secondaryColor={colors.white} />
        </View>
        <View style={styles.goodPill}>
          <View style={styles.dot} />
          <AppText style={styles.goodPillText}>Good</AppText>
        </View>
      </View>
      <AppText style={styles.heroTitle}>Your home air is safe</AppText>
      <AppText style={styles.heroBody}>All monitored rooms are within normal air quality range.</AppText>
      <Pressable style={styles.heroButton} onPress={onAction} accessibilityRole="button">
        <AppText style={styles.heroButtonText}>View Rooms</AppText>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.card,
    gap: 14,
    minHeight: 224,
    padding: spacing.lg,
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
    gap: 13,
  },
  safeIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  goodPill: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: radius.pill,
    flexDirection: "row",
    gap: spacing.xs,
    height: 36,
    paddingHorizontal: 16,
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
    fontFamily: fonts.bold,
    fontSize: 23,
    lineHeight: 30,
  },
  heroBody: {
    color: colors.heroText,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 18,
  },
  heroButton: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 15,
    height: 40,
    justifyContent: "center",
  },
  heroButtonText: {
    color: colors.brand,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 18,
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
