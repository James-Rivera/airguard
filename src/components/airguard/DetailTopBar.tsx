import React from "react";
import { Pressable, StyleSheet, View, type ViewStyle } from "react-native";
import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";
import { AppText } from "@/components/ui/AppText";
import { colors, fonts, layout, spacing } from "@/theme/index";

type Props = {
  title: string;
  onBack: () => void;
  actionIcon?: AppIconName;
  onAction?: () => void;
  style?: ViewStyle;
};

export function DetailTopBar({ title, onBack, actionIcon, onAction, style }: Props) {
  return (
    <View style={[styles.header, style]}>
      <View style={styles.left}>
        <Pressable style={styles.iconButton} onPress={onBack} accessibilityRole="button" accessibilityLabel="Go back">
          <AppIcon name="arrow-left" size={25} color={colors.textInk} secondaryColor={colors.textInk} />
        </Pressable>
        <AppText style={styles.title} numberOfLines={1}>
          {title}
        </AppText>
      </View>
      {actionIcon ? (
        <Pressable style={styles.iconButton} onPress={onAction} disabled={!onAction} accessibilityRole={onAction ? "button" : undefined}>
          <AppIcon name={actionIcon} size={21} color={colors.textInk} secondaryColor={colors.textInk} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    backgroundColor: "#FAF8FF",
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: -layout.screenPadding,
    marginTop: -spacing.xs,
    minHeight: 64,
    paddingHorizontal: layout.screenPadding,
  },
  left: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.md,
    minWidth: 0,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "#F2F3FF",
    borderRadius: 999,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  title: {
    color: colors.textInk,
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 24,
    lineHeight: 32,
  },
});
