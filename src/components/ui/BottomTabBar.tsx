import React from "react";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Platform, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon, type AppIconName } from "./AppIcon";
import { AppText } from "./AppText";
import { getActiveAlerts } from "@/domain/selectors";
import { useAirGuard } from "@/state/airguard-store";
import { colors, fonts, layout, radius, shadows, spacing } from "@/theme/index";

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

export function BottomTabBar({ state, descriptors, navigation, blurTarget }: any & { blurTarget?: React.RefObject<View | null> }) {
  const { state: appState } = useAirGuard();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const activeAlerts = getActiveAlerts(appState).length;
  const routeCount = state.routes.length;
  const baseBarWidth = layout.maxPhoneWidth - layout.bottomNavHorizontalMargin * 2;
  const margin = width < 360 ? spacing.md : layout.bottomNavHorizontalMargin;
  const barWidth = Math.max(288, Math.min(width - margin * 2, baseBarWidth));
  const scale = Math.min(1, barWidth / baseBarWidth);
  const shellPaddingHorizontal = Math.round(8 * scale);
  const shellPaddingVertical = Math.round(6 * scale);
  const itemGap = Math.round(5 * scale);
  const activeWidth = Math.round(82 * scale);
  const inactiveWidth = Math.floor((barWidth - shellPaddingHorizontal * 2 - itemGap * (routeCount - 1) - activeWidth) / Math.max(1, routeCount - 1));
  const itemHeight = Math.round(layout.bottomNavItemHeight * scale);
  const iconSize = Math.max(18, Math.round(19 * scale));
  const activeIconSize = Math.max(19, Math.round(21 * scale));
  const safeBottom = Math.max(0, insets.bottom);

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { height: layout.bottomNavRegionHeight + safeBottom, paddingBottom: spacing.xs + safeBottom }]}>
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.28)", "rgba(246,250,252,0.64)"]}
        locations={[0, 0.46, 1]}
        style={styles.bottomGlassFade}
      />
      <View style={[styles.shadowShell, Platform.OS === "ios" && styles.iosShadow, { width: barWidth }]}>
        <BlurView
          blurMethod={Platform.OS === "android" ? "dimezisBlurViewSdk31Plus" : undefined}
          blurTarget={blurTarget}
          intensity={72}
          tint="systemThinMaterialLight"
          style={[styles.bar, { columnGap: itemGap, paddingHorizontal: shellPaddingHorizontal, paddingVertical: shellPaddingVertical }]}
        >
          <View pointerEvents="none" style={styles.glassTint} />
          {state.routes.map((route: any, index: number) => {
            const selected = state.index === index;
            const options = descriptors[route.key]?.options ?? {};
            const label = options.title ?? labels[route.name] ?? route.name;
            return (
              <Pressable
                key={route.key}
                onPress={() => navigation.navigate(route.name)}
                style={[styles.item, { height: itemHeight, width: selected ? activeWidth : inactiveWidth }, selected && styles.itemActive]}
                accessibilityRole="button"
                accessibilityState={selected ? { selected: true } : {}}
              >
                <AppIcon
                  name={icons[route.name] ?? "more"}
                  size={selected ? activeIconSize : iconSize}
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
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    backgroundColor: "transparent",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    paddingTop: spacing.xs,
    position: "absolute",
    right: 0,
  },
  bottomGlassFade: {
    ...StyleSheet.absoluteFillObject,
  },
  shadowShell: {
    backgroundColor: "transparent",
    borderRadius: radius.pill,
    height: layout.bottomNavHeight,
    elevation: 0,
  },
  iosShadow: {
    ...shadows.bottomNav,
  },
  bar: {
    alignItems: "center",
    backgroundColor: "rgba(228,228,228,0.5)",
    borderColor: "rgba(255,255,255,0.86)",
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    height: "100%",
    justifyContent: "center",
    overflow: "hidden",
  },
  glassTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: radius.pill,
  },
  item: {
    alignItems: "center",
    alignSelf: "center",
    borderRadius: radius.pill,
    gap: 4,
    height: layout.bottomNavItemHeight,
    justifyContent: "center",
    position: "relative",
  },
  itemActive: {
    backgroundColor: "rgba(238,242,246,0.94)",
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
    top: 6,
  },
  badgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: "700",
  },
});
