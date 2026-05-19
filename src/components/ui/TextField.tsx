import React from "react";
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { AppText } from "./AppText";
import { colors, layout, radius, spacing, typography } from "@/theme/index";

type Props = TextInputProps & {
  label: string;
  error?: string;
  helperText?: string;
  leftLabel?: string;
  rightLabel?: string;
  onRightPress?: () => void;
};

export function TextField({ label, error, helperText, leftLabel, rightLabel, onRightPress, style, ...props }: Props) {
  return (
    <View style={styles.wrap}>
      <AppText style={styles.label}>{label}</AppText>
      <View style={[styles.inputRow, error && styles.inputRowError]}>
        {leftLabel ? <AppText style={styles.sideLabel}>{leftLabel}</AppText> : null}
        <TextInput
          {...props}
          placeholderTextColor={colors.textMuted}
          autoCapitalize={props.autoCapitalize ?? "none"}
          style={[styles.input, style]}
        />
        {rightLabel ? (
          <Pressable onPress={onRightPress} hitSlop={8}>
            <AppText style={styles.rightText}>{rightLabel}</AppText>
          </Pressable>
        ) : null}
      </View>
      {error ? <AppText style={styles.error}>{error}</AppText> : helperText ? <AppText variant="muted">{helperText}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  label: {
    color: colors.fieldLabel,
    fontSize: 14,
    lineHeight: 18,
  },
  inputRow: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: layout.inputHeight,
    paddingHorizontal: spacing.md,
  },
  inputRowError: {
    borderColor: colors.critical,
  },
  input: {
    color: colors.textPrimary,
    flex: 1,
    ...typography.body,
    minHeight: layout.inputHeight - 2,
    paddingVertical: 0,
  },
  sideLabel: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "700",
    minWidth: 18,
  },
  rightText: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: "700",
  },
  error: {
    color: colors.critical,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },
});
