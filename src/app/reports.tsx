import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { router } from "expo-router";
import { BarChart, type barDataItem } from "react-native-gifted-charts";
import { DetailTopBar } from "@/components/airguard/DetailTopBar";
import { AppCard } from "@/components/ui/AppCard";
import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ReportMetric, ReportRange } from "@/domain/selectors";
import { getAirQualityReport } from "@/domain/selectors";
import { useHomeDataRefresh } from "@/hooks/useHomeDataRefresh";
import { useAirGuard } from "@/state/airguard-store";
import { colors, fonts, layout, radius, shadows, spacing, statusColors } from "@/theme/index";

const ranges: Array<{ key: ReportRange; label: string }> = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
];

export default function ReportsRoute() {
  const { state } = useAirGuard();
  const refreshControl = useHomeDataRefresh();
  const { width } = useWindowDimensions();
  const [range, setRange] = useState<ReportRange>("day");
  const report = useMemo(() => getAirQualityReport(state, range), [range, state]);
  const shellWidth = Math.min(width, layout.maxPhoneWidth);
  const contentWidth = shellWidth - layout.screenPadding * 2;
  const hasReportData = report.chartPoints.length > 0 || state.readings.length > 0 || state.readingHistory.length > 0;

  return (
    <AppScreen refreshControl={refreshControl} contentStyle={styles.content}>
      <DetailTopBar title="Reports" onBack={() => router.back()} />
      <View style={styles.segmented}>
        {ranges.map((item) => (
          <Pressable key={item.key} style={[styles.segment, range === item.key && styles.segmentActive]} onPress={() => setRange(item.key)} accessibilityRole="button">
            <AppText style={[styles.segmentText, range === item.key && styles.segmentTextActive]}>{item.label}</AppText>
          </Pressable>
        ))}
      </View>
      {!hasReportData ? (
        <EmptyState title="No report data yet" message="Pair a device and apply sensor readings to build air quality reports." iconName="chart" />
      ) : (
        <>
          <OverallQualityCard report={report} width={contentWidth} />
          <View style={styles.highlightGrid}>
            <HighlightCard icon="air" label="Cleanest Room" value={report.cleanestRoom.roomName} detail={report.cleanestRoom.detail} tone="good" />
            <HighlightCard icon="chart" label="Most Improved" value={report.mostImproved.roomName} detail={report.mostImproved.detail} tone="brand" />
          </View>
          <View style={styles.metricsSection}>
            <AppText style={styles.sectionTitle}>Key Metrics Breakdown</AppText>
            <View style={styles.metricList}>
              {report.metrics.map((metric) => (
                <MetricRow key={metric.id} metric={metric} />
              ))}
            </View>
          </View>
        </>
      )}
    </AppScreen>
  );
}

function OverallQualityCard({ report, width }: { report: ReturnType<typeof getAirQualityReport>; width: number }) {
  const chartWidth = Math.max(220, width - 62);
  const chartData = report.chartPoints.map<barDataItem>((point) => ({
    value: point.value,
    label: point.label,
    frontColor: chartColor(point.value),
    labelTextStyle: styles.axisLabel,
  }));
  const trend = trendLabel(report.trendDirection, report.trendPercent);
  const trendTone = report.trendDirection === "better" ? "good" : report.trendDirection === "worse" ? "warning" : "steady";

  return (
    <AppCard subtleShadow style={styles.overallCard}>
      <View style={styles.overallHeader}>
        <View style={styles.overallCopy}>
          <AppText style={styles.overallTitle}>Overall Air Quality</AppText>
          <AppText style={styles.overallSubtitle}>{report.rangeLabel} average</AppText>
        </View>
        <View style={[styles.trendBadge, trendTone === "warning" && styles.trendBadgeWarning, trendTone === "steady" && styles.trendBadgeSteady]}>
          <AppText style={[styles.trendText, trendTone === "warning" && styles.trendTextWarning, trendTone === "steady" && styles.trendTextSteady]}>{trend}</AppText>
        </View>
      </View>
      {chartData.length > 0 ? (
        <View style={styles.chartWrap}>
          <BarChart
            data={chartData}
            width={chartWidth}
            height={190}
            maxValue={100}
            noOfSections={4}
            barWidth={Math.max(20, Math.min(32, Math.floor(chartWidth / Math.max(chartData.length * 2, 8))))}
            spacing={Math.max(10, Math.min(22, Math.floor(chartWidth / Math.max(chartData.length * 3, 12))))}
            initialSpacing={8}
            endSpacing={8}
            roundedTop
            disableScroll
            isAnimated={false}
            hideYAxisText
            yAxisThickness={0}
            xAxisThickness={0}
            hideRules={false}
            rulesColor={colors.border}
            rulesThickness={1}
            xAxisLabelsHeight={28}
            labelsDistanceFromXaxis={8}
            backgroundColor={colors.white}
          />
        </View>
      ) : (
        <View style={styles.emptyChart}>
          <AppIcon name="chart" size={28} color={colors.brand} secondaryColor={colors.brand} />
          <AppText style={styles.emptyChartText}>Reports will appear after readings are available.</AppText>
        </View>
      )}
      <View style={styles.overallFooter}>
        <AppText style={styles.aqiLabel}>Average AQI</AppText>
        <AppText style={[styles.aqiValue, { color: statusColors[report.overallStatus] }]}>{report.overallAqi ?? "--"}</AppText>
        <StatusBadge status={report.overallStatus} />
      </View>
    </AppCard>
  );
}

function HighlightCard({ icon, label, value, detail, tone }: { icon: AppIconName; label: string; value: string; detail: string; tone: "good" | "brand" }) {
  const color = tone === "good" ? "#006C49" : colors.brand;
  return (
    <AppCard subtleShadow style={styles.highlightCard}>
      <View style={[styles.highlightIcon, { backgroundColor: tone === "good" ? "#D1FAE5" : "#DAE2FD" }]}>
        <AppIcon name={icon} size={19} color={color} secondaryColor={color} />
      </View>
      <View style={styles.highlightCopy}>
        <AppText style={styles.highlightLabel}>{label}</AppText>
        <AppText style={styles.highlightValue} numberOfLines={1}>
          {value}
        </AppText>
        <AppText style={[styles.highlightDetail, { color }]} numberOfLines={1}>
          {detail}
        </AppText>
      </View>
    </AppCard>
  );
}

function MetricRow({ metric }: { metric: ReportMetric }) {
  return (
    <AppCard subtleShadow padded={false} style={styles.metricRow}>
      <View style={styles.metricLeft}>
        <View style={styles.metricIcon}>
          <AppIcon name={metricIcon(metric.kind)} size={20} color={colors.brand} secondaryColor={colors.brand} />
        </View>
        <View style={styles.metricCopy}>
          <AppText style={styles.metricTitle}>{metric.title}</AppText>
          <AppText style={styles.metricValue}>{metric.value}</AppText>
          <AppText style={styles.metricDetail}>{metric.detail}</AppText>
        </View>
      </View>
      <StatusBadge status={metric.status} />
    </AppCard>
  );
}

function metricIcon(kind: ReportMetric["kind"]): AppIconName {
  if (kind === "smoke") return "smoke";
  if (kind === "co2") return "co2";
  if (kind === "humidity") return "humidity";
  if (kind === "temperature") return "temperature";
  return "alert";
}

function chartColor(value: number) {
  if (value >= 70) return colors.critical;
  if (value >= 45) return colors.warning;
  if (value >= 25) return "#7EA2E6";
  return colors.brand;
}

function trendLabel(direction: "better" | "worse" | "steady", percent: number) {
  if (direction === "better") return percent ? `Better ${percent}%` : "Stable";
  if (direction === "worse") return percent ? `Higher ${percent}%` : "Stable";
  return "Stable";
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
  },
  segmented: {
    backgroundColor: "#EAEDFF",
    borderRadius: 8,
    flexDirection: "row",
    gap: spacing.xs,
    padding: 4,
  },
  segment: {
    alignItems: "center",
    borderRadius: 6,
    flex: 1,
    minHeight: 44,
    justifyContent: "center",
  },
  segmentActive: {
    backgroundColor: colors.brand,
    ...shadows.button,
  },
  segmentText: {
    color: colors.textGraphite,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 24,
  },
  segmentTextActive: {
    color: colors.white,
  },
  overallCard: {
    borderColor: "rgba(195,198,215,0.3)",
    borderRadius: 12,
    gap: spacing.md,
    padding: spacing.xl,
  },
  overallHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  overallCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  overallTitle: {
    color: colors.textInk,
    fontFamily: fonts.semiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  overallSubtitle: {
    color: colors.textGraphite,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  trendBadge: {
    backgroundColor: colors.successSurface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  trendBadgeWarning: {
    backgroundColor: colors.warningSurface,
  },
  trendBadgeSteady: {
    backgroundColor: colors.offlineSurface,
  },
  trendText: {
    color: "#006C49",
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  trendTextWarning: {
    color: "#92400E",
  },
  trendTextSteady: {
    color: colors.textGraphite,
  },
  chartWrap: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 8,
    minHeight: 228,
    overflow: "hidden",
    paddingTop: spacing.md,
  },
  axisLabel: {
    color: colors.textGraphite,
    fontFamily: fonts.semiBold,
    fontSize: 11,
  },
  emptyChart: {
    alignItems: "center",
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 8,
    gap: spacing.xs,
    minHeight: 180,
    justifyContent: "center",
    padding: spacing.lg,
  },
  emptyChartText: {
    color: colors.textGraphite,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  overallFooter: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  aqiLabel: {
    color: colors.textGraphite,
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  aqiValue: {
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 26,
  },
  highlightGrid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  highlightCard: {
    borderColor: "rgba(195,198,215,0.3)",
    borderRadius: 12,
    flex: 1,
    gap: spacing.md,
    minHeight: 162,
    padding: 17,
  },
  highlightIcon: {
    alignItems: "center",
    borderRadius: radius.pill,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  highlightCopy: {
    gap: 4,
    minWidth: 0,
  },
  highlightLabel: {
    color: colors.textGraphite,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  highlightValue: {
    color: colors.textInk,
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 28,
  },
  highlightDetail: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  metricsSection: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.textInk,
    fontFamily: fonts.semiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  metricList: {
    gap: spacing.xs,
  },
  metricRow: {
    alignItems: "center",
    borderColor: "rgba(195,198,215,0.2)",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 96,
    padding: 17,
  },
  metricLeft: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.md,
    minWidth: 0,
    paddingRight: spacing.sm,
  },
  metricIcon: {
    alignItems: "center",
    backgroundColor: "#DAE2FD",
    borderRadius: radius.pill,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  metricCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  metricTitle: {
    color: colors.textInk,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  metricValue: {
    color: colors.textGraphite,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  metricDetail: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
  },
});
