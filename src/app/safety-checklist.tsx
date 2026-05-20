import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { DetailTopBar } from "@/components/airguard/DetailTopBar";
import { AppCard } from "@/components/ui/AppCard";
import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { getActiveAlerts, getAirRisks } from "@/domain/selectors";
import { useHomeDataRefresh } from "@/hooks/useHomeDataRefresh";
import { routes } from "@/navigation/routes";
import { useAirGuard } from "@/state/airguard-store";
import { colors, fonts, radius, shadows, spacing } from "@/theme/index";

type ChecklistStatus = "complete" | "warning" | "incomplete";

type ChecklistItem = {
  title: string;
  detail: string;
  meta: string;
  status: ChecklistStatus;
  icon: AppIconName;
  route: string;
  actionLabel: string;
};

export default function SafetyChecklistRoute() {
  const { state } = useAirGuard();
  const refreshControl = useHomeDataRefresh();
  const activeAlerts = getActiveAlerts(state);
  const risks = getAirRisks(state);
  const hasRecentActivity = state.activityLogs.length > 0;
  const hasReadings = state.readings.length > 0 || state.readingHistory.length > 0;

  const setupItems: ChecklistItem[] = [
    {
      title: "Create a monitored home",
      detail: state.home ? state.home.name : "Set up the home AirGuard will monitor.",
      meta: state.home ? "Home profile ready" : "Required setup",
      status: state.home ? "complete" : "incomplete",
      icon: "home",
      route: state.home ? routes.homeSettings : routes.createHome,
      actionLabel: state.home ? "Settings" : "Create",
    },
    {
      title: "Add rooms",
      detail: state.rooms.length ? `${state.rooms.length} monitored room${state.rooms.length === 1 ? "" : "s"} ready.` : "Add the first room you want AirGuard to monitor.",
      meta: state.rooms.length ? "Room coverage active" : "Room coverage needed",
      status: state.rooms.length > 0 ? "complete" : "incomplete",
      icon: "rooms",
      route: routes.rooms,
      actionLabel: "Rooms",
    },
    {
      title: "Pair a device",
      detail: state.devices.length ? `${state.devices.length} sensor profile${state.devices.length === 1 ? "" : "s"} connected.` : "Pair a sensor profile to start collecting readings.",
      meta: state.devices.length ? "Sensor coverage active" : "Device needed",
      status: state.devices.length > 0 ? "complete" : "incomplete",
      icon: "sensor",
      route: routes.devices,
      actionLabel: "Devices",
    },
  ];

  const reviewItems: ChecklistItem[] = [
    {
      title: "Review active alerts",
      detail: activeAlerts.length ? `${activeAlerts.length} active alert${activeAlerts.length === 1 ? "" : "s"} need attention.` : "No active alerts right now.",
      meta: activeAlerts.length ? "Attention required" : "Alert queue clear",
      status: activeAlerts.length ? "warning" : "complete",
      icon: "alert",
      route: routes.alerts,
      actionLabel: "Alerts",
    },
    {
      title: "Confirm recent activity",
      detail: hasRecentActivity ? "Recent setup and safety activity is available." : "Activity will appear after setup or sensor events.",
      meta: hasRecentActivity ? "Audit trail available" : "Awaiting events",
      status: hasRecentActivity ? "complete" : "incomplete",
      icon: "note",
      route: routes.activity,
      actionLabel: "Activity",
    },
    {
      title: "Review reports and safety status",
      detail: risks.length ? `${risks.length} risk signal${risks.length === 1 ? "" : "s"} should be reviewed.` : hasReadings ? "Reports are ready from current readings." : "Apply readings to build air quality history.",
      meta: risks.length ? "Safety review needed" : hasReadings ? "Report ready" : "Awaiting readings",
      status: risks.length ? "warning" : hasReadings ? "complete" : "incomplete",
      icon: "chart",
      route: routes.reports,
      actionLabel: "Reports",
    },
  ];

  const items = [...setupItems, ...reviewItems];
  const completeCount = items.filter((item) => item.status === "complete").length;
  const warningCount = items.filter((item) => item.status === "warning").length;
  const percent = Math.round((completeCount / items.length) * 100);
  const readinessStatus: ChecklistStatus = warningCount > 0 ? "warning" : completeCount === items.length ? "complete" : "incomplete";

  return (
    <AppScreen refreshControl={refreshControl} contentStyle={styles.content}>
      <DetailTopBar title="Safety Checklist" onBack={() => router.back()} />
      <ReadinessSummary percent={percent} status={readinessStatus} completeCount={completeCount} totalCount={items.length} warningCount={warningCount} />
      <ChecklistSection title="Setup Readiness" icon="checklist" items={setupItems} />
      <ChecklistSection title="Safety Review" icon="shield" items={reviewItems} />
    </AppScreen>
  );
}

function ReadinessSummary({
  percent,
  status,
  completeCount,
  totalCount,
  warningCount,
}: {
  percent: number;
  status: ChecklistStatus;
  completeCount: number;
  totalCount: number;
  warningCount: number;
}) {
  const color = statusColor(status);
  const title = status === "complete" ? "Home safety profile is ready" : status === "warning" ? "Review safety warnings" : "Finish your safety setup";
  const detail = warningCount > 0 ? `${warningCount} item${warningCount === 1 ? "" : "s"} need attention before the home is fully ready.` : `${completeCount} of ${totalCount} readiness items complete.`;

  return (
    <AppCard subtleShadow style={styles.summary}>
      <View style={styles.summaryCopy}>
        <AppText style={styles.eyebrow}>OVERALL READINESS</AppText>
        <View style={styles.percentRow}>
          <AppText style={[styles.percent, { color }]}>{percent}%</AppText>
          <AppText style={styles.percentLabel}>Complete</AppText>
        </View>
        <AppText style={styles.summaryTitle}>{title}</AppText>
        <AppText style={styles.summaryDetail}>{detail}</AppText>
      </View>
      <View style={[styles.progressRing, { borderColor: statusSurface(status) }]}>
        <View style={[styles.progressInner, { backgroundColor: statusSurface(status) }]}>
          <AppIcon name={status === "warning" ? "alert" : status === "complete" ? "check" : "checklist"} size={24} color={color} secondaryColor={color} />
        </View>
      </View>
    </AppCard>
  );
}

function ChecklistSection({ title, icon, items }: { title: string; icon: AppIconName; items: ChecklistItem[] }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <AppIcon name={icon} size={20} color={colors.brand} secondaryColor={colors.brand} />
        <AppText style={styles.sectionTitle}>{title}</AppText>
      </View>
      <View style={styles.itemList}>
        {items.map((item) => (
          <ChecklistCard key={item.title} item={item} />
        ))}
      </View>
    </View>
  );
}

function ChecklistCard({ item }: { item: ChecklistItem }) {
  const color = statusColor(item.status);
  const surface = statusSurface(item.status);
  const borderColor = item.status === "warning" ? colors.borderDanger : item.status === "incomplete" ? colors.readingBorder : "rgba(195,198,215,0.3)";

  return (
    <Pressable onPress={() => router.push(item.route)} accessibilityRole="button" accessibilityLabel={item.title}>
      <AppCard subtleShadow padded={false} style={[styles.item, { borderColor }]}>
        <View style={[styles.statusIcon, { backgroundColor: item.status === "incomplete" ? colors.white : surface, borderColor: color }]}>
          <AppIcon name={item.status === "complete" ? "check" : item.status === "warning" ? "alert" : item.icon} size={18} color={color} secondaryColor={color} />
        </View>
        <View style={styles.itemCopy}>
          <AppText style={styles.itemTitle} numberOfLines={2}>
            {item.title}
          </AppText>
          <AppText style={styles.itemDetail}>{item.detail}</AppText>
          <AppText style={[styles.itemMeta, { color }]} numberOfLines={1}>
            {item.meta}
          </AppText>
        </View>
        <View style={[styles.actionPill, { backgroundColor: item.status === "warning" ? colors.criticalSurface : colors.iconSurface }]}>
          <AppText style={[styles.actionText, { color }]} numberOfLines={1}>
            {item.actionLabel}
          </AppText>
        </View>
      </AppCard>
    </Pressable>
  );
}

function statusColor(status: ChecklistStatus) {
  if (status === "complete") return "#006C49";
  if (status === "warning") return colors.critical;
  return colors.brand;
}

function statusSurface(status: ChecklistStatus) {
  if (status === "complete") return "#D1FAE5";
  if (status === "warning") return colors.criticalSurface;
  return "#EAEDFF";
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  summary: {
    alignItems: "center",
    borderColor: "rgba(195,198,215,0.3)",
    borderRadius: 16,
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    minHeight: 136,
    padding: spacing.xl,
  },
  summaryCopy: {
    flex: 1,
    gap: spacing.xxs,
    minWidth: 0,
  },
  eyebrow: {
    color: colors.textGraphite,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    letterSpacing: 0.6,
    lineHeight: 16,
  },
  percentRow: {
    alignItems: "baseline",
    flexDirection: "row",
    gap: spacing.xs,
  },
  percent: {
    fontFamily: fonts.bold,
    fontSize: 32,
    lineHeight: 40,
  },
  percentLabel: {
    color: colors.textGraphite,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  summaryTitle: {
    color: colors.textInk,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  summaryDetail: {
    color: colors.textGraphite,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  progressRing: {
    alignItems: "center",
    borderRadius: radius.pill,
    borderWidth: 5,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  progressInner: {
    alignItems: "center",
    borderRadius: radius.pill,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  sectionTitle: {
    color: colors.textInk,
    fontFamily: fonts.semiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  itemList: {
    gap: spacing.md,
  },
  item: {
    alignItems: "flex-start",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 112,
    padding: 17,
    ...shadows.cardSubtle,
  },
  statusIcon: {
    alignItems: "center",
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 28,
    justifyContent: "center",
    marginTop: 2,
    width: 28,
  },
  itemCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  itemTitle: {
    color: colors.textInk,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  itemDetail: {
    color: colors.textGraphite,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  itemMeta: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  actionPill: {
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 36,
    minWidth: 62,
    paddingHorizontal: spacing.sm,
  },
  actionText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
});
