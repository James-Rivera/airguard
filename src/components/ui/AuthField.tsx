import React from "react";
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { AppText } from "./AppText";
import { colors, spacing, typography } from "@/theme/index";

type AuthIcon = "email" | "password" | "name";

type Props = TextInputProps & {
  label: string;
  icon: AuthIcon;
  rightIcon?: "eye";
  onRightPress?: () => void;
};

const iconColor = "#A2A2A7";

export function AuthField({ label, icon, rightIcon, onRightPress, style, ...props }: Props) {
  return (
    <View style={styles.field}>
      <AppText style={styles.label}>{label}</AppText>
      <View style={styles.inputRow}>
        <View style={styles.leftIcon}>{renderIcon(icon)}</View>
        <TextInput
          {...props}
          placeholder={label}
          placeholderTextColor="transparent"
          autoCapitalize={props.autoCapitalize ?? "none"}
          style={[styles.input, style]}
        />
        {rightIcon ? (
          <Pressable onPress={onRightPress} hitSlop={10} style={styles.rightIcon}>
            <EyeIcon />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function renderIcon(icon: AuthIcon) {
  if (icon === "email") return <MailIcon />;
  if (icon === "password") return <LockIcon />;
  return <UserIcon />;
}

function MailIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Rect x={3.25} y={5.75} width={15.5} height={10.5} rx={2} stroke={iconColor} strokeWidth={1.4} />
      <Path d="M4.2 7.2 11 12.1l6.8-4.9" stroke={iconColor} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function LockIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Rect x={5} y={9.5} width={12} height={8.25} rx={1.8} stroke={iconColor} strokeWidth={1.4} />
      <Path d="M7.5 9.5V7.6A3.5 3.5 0 0 1 11 4.1a3.5 3.5 0 0 1 3.5 3.5v1.9" stroke={iconColor} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}

function UserIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Circle cx={11} cy={7.3} r={3.2} stroke={iconColor} strokeWidth={1.4} />
      <Path d="M4.8 17.6c1.1-3 3.2-4.5 6.2-4.5s5.1 1.5 6.2 4.5" stroke={iconColor} strokeWidth={1.4} strokeLinecap="round" />
    </Svg>
  );
}

function EyeIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path d="M3.4 11s2.5-4.1 7.6-4.1 7.6 4.1 7.6 4.1-2.5 4.1-7.6 4.1S3.4 11 3.4 11Z" stroke={iconColor} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={11} cy={11} r={2.1} stroke={iconColor} strokeWidth={1.4} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 15,
  },
  label: {
    color: colors.fieldLabel,
    fontSize: 14,
    lineHeight: 16,
  },
  inputRow: {
    alignItems: "center",
    borderBottomColor: colors.textSecondary,
    borderBottomWidth: 1.5,
    flexDirection: "row",
    minHeight: 36,
  },
  leftIcon: {
    alignItems: "center",
    height: 22,
    justifyContent: "center",
    width: 22,
  },
  input: {
    color: colors.textPrimary,
    flex: 1,
    marginLeft: spacing.md,
    minHeight: 36,
    padding: 0,
    ...typography.body,
  },
  rightIcon: {
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    width: 28,
  },
});
