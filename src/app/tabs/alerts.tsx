import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { AlertCard } from "@/components/airguard/AlertCard";
import { FilterPill } from "@/components/airguard/FilterPill";
import { SummaryCard } from "@/components/airguard/SummaryCard";
import { AppScreen } from "@/components/ui/AppScreen";
import { EmptyState } from "@/components/ui/EmptyState";
import { getActiveAlerts, getAlertsByFilter, getCriticalAlerts } from "@/domain/selectors";
import { routes } from "@/navigation/routes";
import { useAirGuard } from "@/state/airguard-store";
import { spacing } from "@/theme/index";

type Filter = "All" | "Active" | "Critical" | "Resolved";

export default function AlertsRoute() {
  const [filter, setFilter] = useState<Filter>("All");
  const { state } = useAirGuard();
  const alerts = state.alerts;
  const shown = useMemo(() => getAlertsByFilter(state, filter), [state, filter]);

  return (
    <AppScreen title="Alerts">
      <View style={styles.summary}>
        <SummaryCard label="Total Alerts" value={alerts.length} detail={`${getActiveAlerts(state).length} active`} />
        <SummaryCard label="Problems Detected" value={getCriticalAlerts(state).length} detail="Needs attention" />
      </View>
      <View style={styles.filters}>
        {(["All", "Active", "Critical", "Resolved"] as Filter[]).map((item) => (
          <FilterPill key={item} label={item} active={filter === item} onPress={() => setFilter(item)} />
        ))}
      </View>
      {shown.length === 0 ? <EmptyState title="No alerts here" message="AirGuard will show safety events here when a room needs attention." /> : null}
      {shown.map((alert) => (
        <AlertCard
          key={alert.id}
          alert={alert}
          onPress={() => router.push(routes.alertDetail(alert.id))}
          actionLabel={alert.status === "resolved" ? "Details" : alert.status === "checking" ? "Checking" : "Start Checking"}
          onAction={() => router.push(routes.alertDetail(alert.id))}
        />
      ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  summary: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  filters: {
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "space-between",
  },
});
