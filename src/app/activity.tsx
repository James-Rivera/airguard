import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { AppCard } from "@/components/ui/AppCard";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatAlertTime } from "@/lib/formatters";
import { useAirGuard } from "@/state/airguard-store";
import { colors, spacing } from "@/theme/index";

export default function ActivityRoute() {
  const { state } = useAirGuard();
  return (
    <AppScreen title="Activity" subtitle="Recent Supabase-backed app events." onBack={() => router.back()} noBottomPadding>
      {state.activityLogs.length === 0 ? (
        <EmptyState title="No activity yet" message="Create rooms, add devices, or run demo controls to build a real activity history." />
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
