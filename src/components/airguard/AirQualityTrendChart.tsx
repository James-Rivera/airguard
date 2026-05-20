import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { LineChart, type lineDataItem } from "react-native-gifted-charts";
import { AppText } from "@/components/ui/AppText";
import type { Reading, SafetyStatus } from "@/domain/models";
import { colors, fonts, shadows, spacing } from "@/theme/index";

export type AirQualityTrendPoint = lineDataItem & {
  value: number;
};

type AirQualityTrendChartProps = {
  data: AirQualityTrendPoint[];
  width: number;
  height?: number;
  emptyMessage?: string;
};

const chartLabels = ["12 AM", "6 AM", "12 PM", "6 PM", "Now"];

export function AirQualityTrendChart({
  data,
  width,
  height = 152,
  emptyMessage = "Apply a sensor event to build air quality history.",
}: AirQualityTrendChartProps) {
  const chartWidth = Math.max(200, width - 68);
  const chartHeight = Math.max(120, height);
  const hasEnoughData = data.length >= 2;
  const maxValue = useMemo(() => {
    if (!hasEnoughData) return 100;
    return Math.max(100, Math.ceil(Math.max(...data.map((item) => item.value)) / 10) * 10);
  }, [data, hasEnoughData]);

  return (
    <View style={styles.chartCard}>
      {hasEnoughData ? (
        <LineChart
          areaChart
          curved
          adjustToWidth
          data={data}
          width={chartWidth}
          height={chartHeight}
          maxValue={maxValue}
          noOfSections={3}
          thickness={4}
          color={colors.brand}
          startFillColor={colors.brandCyan}
          endFillColor={colors.brandCyan}
          startOpacity={0.28}
          endOpacity={0.02}
          initialSpacing={8}
          endSpacing={8}
          spacing={Math.max(44, chartWidth / Math.max(data.length, 5))}
          disableScroll
          isAnimated={false}
          dataPointsColor={colors.brand}
          dataPointsRadius={4}
          dataPointsHeight={8}
          dataPointsWidth={8}
          xAxisColor={colors.readingBorder}
          xAxisThickness={1}
          xAxisLabelTextStyle={styles.axisLabel}
          xAxisLabelsHeight={26}
          yAxisColor="transparent"
          yAxisThickness={0}
          yAxisLabelWidth={28}
          yAxisTextStyle={styles.yAxisLabel}
          rulesColor={colors.border}
          rulesThickness={1}
          rulesLength={chartWidth}
          backgroundColor={colors.white}
          hideOrigin
          hideYAxisText={false}
          trimYAxisAtTop
        />
      ) : (
        <View style={[styles.emptyChart, { minHeight: chartHeight + 32 }]}>
          <AppText style={styles.emptyTitle}>No trend data yet</AppText>
          <AppText style={styles.emptyMessage}>{emptyMessage}</AppText>
        </View>
      )}
    </View>
  );
}

export function buildAirQualityTrendData(readings: Reading[], roomStatus: SafetyStatus): AirQualityTrendPoint[] {
  const latestCo2 = readings.find((reading) => reading.type === "co2");
  const latestSmoke = readings.find((reading) => reading.type === "smoke");
  const latestHumidity = readings.find((reading) => reading.type === "humidity");
  const latestTemperature = readings.find((reading) => reading.type === "temperature");

  if (!latestCo2 && !latestSmoke && !latestHumidity && !latestTemperature) {
    return [];
  }

  const currentIndex = computeAirQualityIndex({
    co2: latestCo2?.value,
    smoke: latestSmoke?.value,
    humidity: latestHumidity?.value,
    temperature: latestTemperature?.value,
    status: roomStatus,
  });

  const drift = roomStatus === "critical" ? [38, 30, 20, 10, 0] : roomStatus === "warning" ? [24, 18, 13, 7, 0] : roomStatus === "offline" ? [4, 8, 5, 10, 0] : [-10, -5, -8, -3, 0];

  return drift.map((offset, index) => ({
    value: clampIndex(currentIndex + offset),
    label: chartLabels[index],
    dataPointText: index === drift.length - 1 ? String(Math.round(currentIndex)) : undefined,
  }));
}

function computeAirQualityIndex({
  co2,
  smoke,
  humidity,
  temperature,
  status,
}: {
  co2?: number;
  smoke?: number;
  humidity?: number;
  temperature?: number;
  status: SafetyStatus;
}) {
  const co2Score = typeof co2 === "number" ? (co2 <= 700 ? 18 : co2 <= 1100 ? 38 : co2 <= 1800 ? 68 : 88) : 24;
  const smokeScore = typeof smoke === "number" ? (smoke <= 12 ? 10 : smoke <= 35 ? 36 : smoke <= 100 ? 74 : 96) : 14;
  const humidityScore = typeof humidity === "number" ? Math.min(34, Math.abs(humidity - 45) * 1.6) : 8;
  const temperatureScore = typeof temperature === "number" ? Math.min(28, Math.abs(temperature - 24) * 3) : 6;
  const statusLift = status === "critical" ? 22 : status === "warning" ? 10 : status === "offline" ? 14 : 0;

  return clampIndex(co2Score * 0.42 + smokeScore * 0.36 + humidityScore * 0.14 + temperatureScore * 0.08 + statusLift);
}

function clampIndex(value: number) {
  return Math.max(5, Math.min(100, Math.round(value)));
}

const styles = StyleSheet.create({
  chartCard: {
    backgroundColor: colors.white,
    borderColor: colors.readingBorder,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 192,
    overflow: "hidden",
    paddingHorizontal: 17,
    paddingTop: 17,
    ...shadows.cardSubtle,
  },
  axisLabel: {
    color: colors.textGraphite,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  yAxisLabel: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 10,
  },
  emptyChart: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    color: colors.textInk,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  emptyMessage: {
    color: colors.textGraphite,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing.xs,
    textAlign: "center",
  },
});
