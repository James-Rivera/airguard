import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { getActiveAlerts } from "@/domain/selectors";
import { routes } from "@/navigation/routes";
import { useAirGuard } from "@/state/airguard-store";
import { colors, fonts, radius, spacing } from "@/theme/index";

type ChecklistItem = {
  title: string;
  detail: string;
  complete: boolean;
  icon: AppIconName;
  actionLabel?: string;
  onAction?: () => void;
};

export default function SafetyChecklistRoute() {
  const { state } = useAirGuard();
  const activeAlerts = getActiveAlerts(state);
  const items: ChecklistItem[] = [
    {
      title: "Create a monitored home",
      detail: state.home ? state.home.name : "Set up the home AirGuard will monitor.",
      complete: Boolean(state.home),
      icon: "home",
      actionLabel: state.home ? "Settings" : "Create Home",
      onAction: () => router.push(state.home ? routes.homeSettings : routes.createHome),
    },
    {
      title: "Add rooms",
      detail: state.rooms.length ? `${state.rooms.length} room${state.rooms.length === 1 ? "" : "s"} ready for monitoring.` : "Add the first room you want to monitor.",
      complete: state.rooms.length > 0,
      icon: "rooms",
      actionLabel: "Rooms",
      onAction: () => router.push(routes.rooms),
    },
    {
      title: "Pair a device",
      detail: state.devices.length ? `${state.devices.length} device${state.devices.length === 1 ? "" : "s"} connected.` : "Pair a sensor profile to a room.",
      complete: state.devices.length > 0,
      icon: "device",
      actionLabel: "Devices",
      onAction: () => router.push(routes.devices),
    },
    {
      title: "Review active alerts",
      detail: activeAlerts.length ? `${activeAlerts.length} alert${activeAlerts.length === 1 ? "" : "s"} need attention.` : "No active alerts right now.",
      complete: activeAlerts.length === 0,
      icon: "alert",
      actionLabel: "Alerts",
      onAction: () => router.push(routes.alerts),
    },
    {
      title: "Confirm recent activity",
      detail: state.activityLogs.length ? "Recent safety activity is available." : "Activity will appear as setup and safety events happen.",
      complete: state.activityLogs.length > 0,
      icon: "note",
      actionLabel: "Activity",
      onAction: () => router.push(routes.activity),
    },
  ];

  const completeCount = items.filter((item) => item.complete).length;

  return (
    <AppScreen title="Safety Checklist" subtitle={`${completeCount} of ${items.length} ready`} onBack={() => router.back()} noBottomPadding>
      <AppCard subtleShadow style={styles.hero}>
        <View style={styles.heroIcon}>
          <AppIcon name="shield" size={32} color={colors.brand} secondaryColor={colors.brand} />
        </View>
        <View style={styles.heroCopy}>
          <AppText style={styles.heroTitle}>{completeCount === items.length ? "Home safety profile is ready" : "Finish your safety setup"}</AppText>
          <AppText variant="body">Use this checklist to keep rooms, devices, alerts, and activity connected to your home profile.</AppText>
        </View>
      </AppCard>
      <View style={styles.list}>
        {items.map((item) => (
          <ChecklistCard key={item.title} item={item} />
        ))}
      </View>
    </AppScreen>
  );
}

function ChecklistCard({ item }: { item: ChecklistItem }) {
  return (
    <AppCard subtleShadow style={styles.item}>
      <View style={[styles.itemIcon, item.complete && styles.itemIconComplete]}>
        <AppIcon name={item.complete ? "check" : item.icon} size={20} color={item.complete ? colors.white : colors.brand} secondaryColor={item.complete ? colors.white : colors.brand} />
      </View>
      <View style={styles.itemCopy}>
        <AppText style={styles.itemTitle}>{item.title}</AppText>
        <AppText variant="caption">{item.detail}</AppText>
      </View>
      {item.actionLabel && item.onAction ? <AppButton label={item.actionLabel} onPress={item.onAction} variant="secondary" style={styles.itemButton} /> : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  heroIcon: {
    alignItems: "center",
    backgroundColor: colors.iconSurface,
    borderRadius: radius.md,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  heroCopy: {
    flex: 1,
    gap: 4,
  },
  heroTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 24,
  },
  list: {
    gap: spacing.sm,
  },
  item: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  itemIcon: {
    alignItems: "center",
    backgroundColor: colors.iconSurface,
    borderRadius: radius.md,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  itemIconComplete: {
    backgroundColor: colors.success,
  },
  itemCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  itemTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  itemButton: {
    height: 38,
    paddingHorizontal: spacing.sm,
  },
});
