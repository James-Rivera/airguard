import React from "react";
import { Pressable, StyleSheet, type ViewStyle } from "react-native";
import { AppText } from "./AppText";
import { colors, layout, radius, shadows, spacing } from "@/theme/index";

type Variant = "primary" | "secondary" | "danger";

export function AppButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  pill = false,
  style,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  pill?: boolean;
  style?: ViewStyle;
}) {
  return (
    <Pressable onPress={disabled ? undefined : onPress} style={[styles.button, styles[variant], pill && styles.pill, disabled && styles.disabled, style]}>
      <AppText style={[styles.text, variant === "secondary" && styles.secondaryText]}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: radius.md,
    height: layout.buttonHeight,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  primary: {
    backgroundColor: colors.brand,
    ...shadows.button,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  danger: {
    backgroundColor: colors.critical,
  },
  pill: {
    borderRadius: radius.pill,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  secondaryText: {
    color: colors.textPrimary,
  },
});
