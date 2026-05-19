import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { AppButton } from "./AppButton";
import { AppCard } from "./AppCard";
import { AppText } from "./AppText";
import { colors, radius, spacing } from "@/theme/index";

type Props = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
};

export function EmptyState({ title, message, actionLabel, onAction, style }: Props) {
  return (
    <AppCard style={[styles.card, style]}>
      <View style={styles.icon}>
        <AppText style={styles.iconText}>+</AppText>
      </View>
      <View style={styles.copy}>
        <AppText style={styles.title}>{title}</AppText>
        <AppText variant="body">{message}</AppText>
      </View>
      {actionLabel && onAction ? <AppButton label={actionLabel} onPress={onAction} /> : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  icon: {
    alignItems: "center",
    backgroundColor: colors.iconSurface,
    borderRadius: radius.pill,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  iconText: {
    color: colors.brand,
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 24,
  },
  copy: {
    alignItems: "center",
    gap: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
    textAlign: "center",
  },
});
