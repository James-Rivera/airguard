import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { getActiveAlerts } from "@/domain/selectors";
import { useAirGuard } from "@/state/airguard-store";
import { colors, radius, shadows, spacing } from "@/theme/index";

const labels: Record<string, string> = {
  home: "Home",
  rooms: "Rooms",
  alerts: "Alerts",
  devices: "Devices",
  more: "More",
};

const icons: Record<string, string> = {
  home: "H",
  rooms: "R",
  alerts: "!",
  devices: "D",
  more: "...",
};

export function BottomTabBar({ state, descriptors, navigation }: any) {
  const { state: appState } = useAirGuard();
  const activeAlerts = getActiveAlerts(appState).length;

  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        {state.routes.map((route: any, index: number) => {
          const selected = state.index === index;
          const options = descriptors[route.key]?.options ?? {};
          const label = options.title ?? labels[route.name] ?? route.name;
          return (
            <Pressable
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={[styles.item, selected && styles.itemActive]}
              accessibilityRole="button"
              accessibilityState={selected ? { selected: true } : {}}
            >
              <AppText style={[styles.icon, selected && styles.activeText]}>{icons[route.name] ?? "."}</AppText>
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
    bottom: 4,
    left: 0,
    paddingHorizontal: spacing.lg,
    position: "absolute",
    right: 0,
  },
  bar: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.98)",
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    flexDirection: "row",
    height: 78,
    justifyContent: "space-between",
    padding: spacing.xs,
    ...shadows.card,
  },
  item: {
    alignItems: "center",
    borderRadius: radius.lg,
    height: "100%",
    justifyContent: "center",
    position: "relative",
    width: 56,
  },
  itemActive: {
    backgroundColor: colors.iconSurface,
    width: 78,
  },
  icon: {
    color: colors.textMuted,
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 20,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  activeText: {
    color: colors.textPrimary,
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
