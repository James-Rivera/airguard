import React from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon, type AppIconName } from "./AppIcon";
import { AppText } from "./AppText";
import { getActiveAlerts } from "@/domain/selectors";
import { useAirGuard } from "@/state/airguard-store";
import { colors, fonts, layout, radius, shadows } from "@/theme/index";

const labels: Record<string, string> = {
  home: "Home",
  rooms: "Rooms",
  alerts: "Alerts",
  devices: "Devices",
  more: "More",
};

const icons: Record<string, AppIconName> = {
  home: "home",
  rooms: "rooms",
  alerts: "alert",
  devices: "device",
  more: "more",
};

export function BottomTabBar({ state, descriptors, navigation }: any) {
  const { state: appState } = useAirGuard();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const activeAlerts = getActiveAlerts(appState).length;
  const compact = width < 360;
  const margin = compact ? 16 : layout.bottomNavHorizontalMargin;
  const barWidth = Math.max(288, Math.min(width - margin * 2, layout.maxPhoneWidth - layout.bottomNavHorizontalMargin * 2));
  const activeWidth = compact ? 72 : 82;
  const inactiveWidth = compact ? 50 : 58;

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(8, insets.bottom + 4) }]}>
      <View style={[styles.bar, { width: barWidth }]}>
        {state.routes.map((route: any, index: number) => {
          const selected = state.index === index;
          const options = descriptors[route.key]?.options ?? {};
          const label = options.title ?? labels[route.name] ?? route.name;
          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={[styles.item, { width: selected ? activeWidth : inactiveWidth }, selected && styles.itemActive]}
              accessibilityRole="button"
              accessibilityState={selected ? { selected: true } : {}}
            >
              <AppIcon
                name={icons[route.name] ?? "more"}
                size={selected ? 21 : 19}
                color={selected ? colors.textPrimary : colors.textMuted}
                secondaryColor={selected ? colors.textPrimary : colors.textMuted}
              />
              <AppText style={[styles.label, selected && styles.activeText]}>{label}</AppText>
              {route.name === "alerts" && activeAlerts ? (
                <View style={styles.badge}>
                  <AppText style={styles.badgeText}>{activeAlerts}</AppText>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    left: 0,
    position: "absolute",
    right: 0,
  },
  bar: {
    alignItems: "center",
    backgroundColor: colors.navShell,
    borderColor: "rgba(255,255,255,0.78)",
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    height: layout.bottomNavHeight,
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 6,
    ...shadows.bottomNav,
  },
  item: {
    alignItems: "center",
    borderRadius: radius.pill,
    gap: 4,
    height: "100%",
    justifyContent: "center",
    position: "relative",
  },
  itemActive: {
    backgroundColor: colors.navActive,
  },
  label: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 13,
  },
  activeText: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 14,
  },
  badge: {
    alignItems: "center",
    backgroundColor: colors.critical,
    borderRadius: radius.pill,
    minWidth: 17,
    paddingHorizontal: 4,
    position: "absolute",
    right: 8,
    top: 7,
  },
  badgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: "700",
  },
});
