import React from "react";
import { Pressable, StyleSheet, View, type ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";
import { AppText } from "./AppText";
import { colors, fonts, layout, radius, shadows, spacing } from "@/theme/index";

type Variant = "primary" | "secondary" | "danger";

export function AppButton({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  pill = false,
  style,
  rightIcon,
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  pill?: boolean;
  style?: ViewStyle;
  rightIcon?: "arrow-right";
}) {
  return (
    <Pressable onPress={disabled ? undefined : onPress} style={[styles.button, styles[variant], pill && styles.pill, disabled && styles.disabled, style]}>
      <View style={styles.content}>
        <AppText style={[styles.text, variant === "secondary" && styles.secondaryText]}>{label}</AppText>
        {rightIcon === "arrow-right" ? <ArrowRight color={variant === "secondary" ? colors.textPrimary : colors.white} /> : null}
      </View>
    </Pressable>
  );
}

function ArrowRight({ color }: { color: string }) {
  return (
    <Svg width={21} height={21} viewBox="0 0 21 21" fill="none">
      <Path d="M4.5 10.5h11.2M11.2 5.8l4.8 4.7-4.8 4.7" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
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
  content: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "center",
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
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  secondaryText: {
    color: colors.textPrimary,
  },
});
