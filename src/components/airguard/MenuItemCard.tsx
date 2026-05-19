import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { colors, radius, spacing } from "@/theme/index";

export function MenuItemCard({ label, detail, icon, onPress }: { label: string; detail: string; icon: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <AppCard style={styles.card}>
        <View style={styles.icon}>
          <AppText style={styles.iconText}>{icon}</AppText>
        </View>
        <View style={styles.copy}>
          <AppText style={styles.label}>{label}</AppText>
          <AppText variant="caption">{detail}</AppText>
        </View>
        <AppText style={styles.more}>›</AppText>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  icon: {
    alignItems: "center",
    backgroundColor: colors.iconSurface,
    borderRadius: radius.sm,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  iconText: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: "700",
  },
  copy: {
    flex: 1,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
  more: {
    color: colors.textMuted,
    fontSize: 24,
    fontWeight: "600",
  },
});
