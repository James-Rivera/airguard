import React from "react";
import { Text, type TextProps, StyleSheet } from "react-native";
import { colors, typography } from "@/theme/index";

type Variant = "title" | "subtitle" | "body" | "caption" | "muted" | "metric";

export function AppText({ variant = "body", style, ...props }: TextProps & { variant?: Variant }) {
  return <Text {...props} style={[styles.base, styles[variant], style]} />;
}

const styles = StyleSheet.create({
  base: {
    color: colors.textPrimary,
    letterSpacing: 0,
  },
  title: typography.screenTitle,
  subtitle: { ...typography.subtitle, color: colors.textSecondary },
  body: { ...typography.body, color: colors.textSecondary },
  caption: { ...typography.caption, color: colors.textSecondary },
  muted: { ...typography.caption, color: colors.textMuted },
  metric: { ...typography.metric, color: colors.textPrimary },
});
