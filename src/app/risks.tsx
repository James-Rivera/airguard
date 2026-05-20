import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { DetailTopBar } from "@/components/airguard/DetailTopBar";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { AirRisk, AirRiskKind } from "@/domain/selectors";
import { getAirRisks, getRooms } from "@/domain/selectors";
import { useHomeDataRefresh } from "@/hooks/useHomeDataRefresh";
import { routes } from "@/navigation/routes";
import { useAirGuard } from "@/state/airguard-store";
import { colors, fonts, radius, shadows, spacing } from "@/theme/index";

type RiskFilter = "All Risks" | "Critical" | "Warnings";

const filters: RiskFilter[] = ["All Risks", "Critical", "Warnings"];

export default function RisksRoute() {
  const { state } = useAirGuard();
  const refreshControl = useHomeDataRefresh();
  const [filter, setFilter] = useState<RiskFilter>("All Risks");
  const risks = useMemo(() => getAirRisks(state), [state]);
  const rooms = getRooms(state);
  const criticalCount = risks.filter((risk) => risk.severity === "critical").length;
  const normalRooms = rooms.filter((room) => room.status === "good").length;
  const shownRisks = risks.filter((risk) => {
    if (filter === "Critical") return risk.severity === "critical";
    if (filter === "Warnings") return risk.severity === "warning";
    return true;
  });

  return (
    <AppScreen refreshControl={refreshControl} contentStyle={styles.content}>
      <DetailTopBar title="Risks" onBack={() => router.back()} />
      <View style={styles.summaryGrid}>
        <RiskSummaryCard label="Critical Risks" value={criticalCount} detail={criticalCount ? "Requires attention" : "None active"} tone={criticalCount ? "critical" : "good"} />
        <RiskSummaryCard label="Areas Scanned" value={rooms.length} detail={`${normalRooms} normal`} tone="good" />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {filters.map((item) => (
          <Pressable key={item} style={[styles.filterPill, filter === item && styles.filterPillActive]} onPress={() => setFilter(item)} accessibilityRole="button">
            <AppText style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</AppText>
          </Pressable>
        ))}
      </ScrollView>
      {shownRisks.length === 0 ? (
        <EmptyState title="No active risks" message="AirGuard will flag unsafe room conditions here when readings, alerts, or devices need attention." iconName="shield" />
      ) : (
        <View style={styles.riskList}>
          {shownRisks.map((risk) => (
            <RiskCard key={risk.id} risk={risk} />
          ))}
        </View>
      )}
    </AppScreen>
  );
}

function RiskSummaryCard({ label, value, detail, tone }: { label: string; value: number; detail: string; tone: "critical" | "good" }) {
  const color = tone === "critical" ? colors.critical : "#006C49";
  return (
    <AppCard subtleShadow style={[styles.summaryCard, tone === "critical" && styles.criticalSummary]}>
      <AppText style={styles.summaryLabel}>{label}</AppText>
      <AppText style={[styles.summaryValue, { color }]}>{value}</AppText>
      <View style={styles.summaryDetailRow}>
        <AppIcon name={tone === "critical" ? "alert" : "check"} size={13} color={color} secondaryColor={color} />
        <AppText style={[styles.summaryDetail, { color }]}>{detail}</AppText>
      </View>
    </AppCard>
  );
}

function RiskCard({ risk }: { risk: AirRisk }) {
  const accent = risk.severity === "critical" ? colors.critical : "#F59E0B";
  const icon = riskIcon(risk.kind);

  function openTarget() {
    if (risk.alertId) {
      router.push(routes.alertDetail(risk.alertId));
      return;
    }
    if (risk.deviceId) {
      router.push(routes.deviceDetail(risk.deviceId));
      return;
    }
    router.push(routes.roomDetail(risk.roomId));
  }

  return (
    <AppCard subtleShadow padded={false} style={[styles.riskCard, { borderLeftColor: accent }]}>
      <View style={styles.riskHeader}>
        <View style={styles.riskTitleGroup}>
          <View style={styles.riskTitleRow}>
            <AppIcon name={icon} size={18} color={accent} secondaryColor={accent} />
            <AppText style={styles.riskTitle} numberOfLines={2}>
              {risk.title}
            </AppText>
          </View>
          <AppText style={styles.riskMeta}>
            {risk.roomName} • {risk.measuredValue}
          </AppText>
        </View>
        <StatusBadge status={risk.severity} />
      </View>
      <AppText style={styles.explanation}>{risk.explanation}</AppText>
      <View style={styles.recommendation}>
        <AppIcon name="shield" size={20} color={colors.brand} secondaryColor={colors.brand} />
        <View style={styles.recommendationCopy}>
          <AppText style={styles.recommendationTitle}>{risk.severity === "critical" ? "Action required" : "Recommendation"}</AppText>
          <AppText style={styles.recommendationText}>{risk.recommendation}</AppText>
        </View>
      </View>
      <AppButton label={risk.actionLabel} onPress={openTarget} variant={risk.severity === "critical" ? "danger" : "primary"} style={styles.actionButton} />
    </AppCard>
  );
}

function riskIcon(kind: AirRiskKind): AppIconName {
  if (kind === "co2") return "co2";
  if (kind === "smoke") return "smoke";
  if (kind === "humidity") return "humidity";
  if (kind === "offline") return "sensor";
  return "fan";
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  summaryCard: {
    borderColor: "rgba(195,198,215,0.3)",
    borderRadius: 12,
    flex: 1,
    gap: spacing.sm,
    minHeight: 126,
    padding: 17,
  },
  criticalSummary: {
    borderColor: "rgba(239,68,68,0.22)",
  },
  summaryLabel: {
    color: colors.textGraphite,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  summaryValue: {
    fontFamily: fonts.bold,
    fontSize: 32,
    lineHeight: 40,
  },
  summaryDetailRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xxs,
  },
  summaryDetail: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  filters: {
    gap: spacing.xs,
    paddingBottom: spacing.xs,
  },
  filterPill: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.readingBorder,
    borderRadius: radius.pill,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  filterPillActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  filterText: {
    color: colors.textGraphite,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  filterTextActive: {
    color: colors.white,
  },
  riskList: {
    gap: spacing.md,
  },
  riskCard: {
    borderLeftWidth: 4,
    borderRadius: 12,
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    ...shadows.cardSubtle,
  },
  riskHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  riskTitleGroup: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  riskTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  riskTitle: {
    color: colors.textInk,
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  riskMeta: {
    color: colors.textGraphite,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  explanation: {
    color: colors.textInk,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  recommendation: {
    alignItems: "flex-start",
    backgroundColor: "#F2F3FF",
    borderRadius: 8,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.sm,
  },
  recommendationCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  recommendationTitle: {
    color: colors.textInk,
    fontFamily: fonts.bold,
    fontSize: 14,
    lineHeight: 20,
  },
  recommendationText: {
    color: colors.textGraphite,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    borderRadius: 8,
    height: 48,
  },
});
