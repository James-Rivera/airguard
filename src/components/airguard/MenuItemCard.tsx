import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppCard } from "@/components/ui/AppCard";
import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";
import { AppText } from "@/components/ui/AppText";
import { colors, fonts, radius, spacing } from "@/theme/index";

export function MenuItemCard({ label, detail, icon, onPress }: { label: string; detail: string; icon: string; onPress?: () => void }) {
  const iconName = menuIcon(icon, label);
  return (
    <Pressable onPress={onPress} disabled={!onPress} accessibilityRole={onPress ? "button" : undefined}>
      <AppCard subtleShadow style={styles.card}>
        <View style={styles.icon}>
          <AppIcon name={iconName} size={18} color={colors.brand} secondaryColor={colors.brand} />
        </View>
        <View style={styles.copy}>
          <AppText style={styles.label}>{label}</AppText>
          <AppText variant="caption">{detail}</AppText>
        </View>
        {onPress ? <AppIcon name="chevron-right" size={20} color={colors.textMuted} secondaryColor={colors.textMuted} /> : null}
      </AppCard>
    </Pressable>
  );
}

function menuIcon(icon: string, label: string): AppIconName {
  const value = icon.toLowerCase();
  if (value === "settings" || label === "Home Settings" || label === "Settings") return "settings";
  if (value === "rooms" || label === "Rooms") return "rooms";
  if (value === "device" || value === "devices" || label === "Devices") return "device";
  if (value === "note" || label === "Activity" || label === "Reports") return "note";
  if (value === "check" || label === "Safety Checklist") return "check";
  if (value === "alert" || label === "Risks") return "alert";
  if (value === "logout" || label === "Logout") return "logout";
  return "more";
}

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    borderRadius: radius.lg,
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
  copy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  label: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 20,
  },
});
