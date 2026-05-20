import React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { colors, radius, shadows, spacing } from "@/theme/index";

type Props = ViewProps & {
  padded?: "sm" | "md" | "lg" | false;
  shadow?: boolean;
  subtleShadow?: boolean;
};

export function AppCard({ padded = "md", shadow = true, subtleShadow = false, style, ...props }: Props) {
  return <View {...props} style={[styles.card, shadow && (subtleShadow ? shadows.cardSubtle : shadows.card), padded && styles[padded], style]} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
  },
  sm: { padding: spacing.sm },
  md: { padding: spacing.md },
  lg: { padding: spacing.lg },
});
