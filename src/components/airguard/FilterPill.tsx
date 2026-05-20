import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { colors, radius, spacing } from "@/theme/index";

export function FilterPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.pill, active && styles.active]}>
      <AppText style={[styles.label, active && styles.activeLabel]}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    minWidth: 74,
    paddingHorizontal: spacing.md,
  },
  active: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  activeLabel: {
    color: colors.white,
  },
});
