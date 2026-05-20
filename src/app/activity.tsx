import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { AppCard } from "@/components/ui/AppCard";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { useHomeDataRefresh } from "@/hooks/useHomeDataRefresh";
import { formatAlertTime } from "@/lib/formatters";
import { useAirGuard } from "@/state/airguard-store";
import { colors, spacing } from "@/theme/index";

export default function ActivityRoute() {
  const { state } = useAirGuard();
  const refreshControl = useHomeDataRefresh();
  return (
    <AppScreen title="Activity" subtitle="Recent home safety activity." onBack={() => router.back()} noBottomPadding refreshControl={refreshControl}>
      {state.activityLogs.length === 0 ? (
        <EmptyState title="No activity yet" message="Create rooms, add devices, or run safety actions to build an activity history." />
      ) : (
        state.activityLogs.map((item) => (
          <AppCard key={item.id} style={styles.item}>
            <View>
              <AppText style={styles.title}>{item.title}</AppText>
              <AppText variant="body">{item.description}</AppText>
            </View>
            <AppText variant="muted">{formatAlertTime(item.createdAt)}</AppText>
          </AppCard>
        ))
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  item: {
    gap: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
});
