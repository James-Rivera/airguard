import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { AlertCard } from "@/components/airguard/AlertCard";
import { FilterPill } from "@/components/airguard/FilterPill";
import { SummaryCard } from "@/components/airguard/SummaryCard";
import { AppScreen } from "@/components/ui/AppScreen";
import { EmptyState } from "@/components/ui/EmptyState";
import { getActiveAlerts, getAlertsByFilter, getCriticalAlerts } from "@/domain/selectors";
import { useHomeDataRefresh } from "@/hooks/useHomeDataRefresh";
import { routes } from "@/navigation/routes";
import { useAirGuard } from "@/state/airguard-store";
import { spacing } from "@/theme/index";

type Filter = "All" | "Active" | "Critical" | "Resolved";

export default function AlertsRoute() {
  const [filter, setFilter] = useState<Filter>("All");
  const { state } = useAirGuard();
  const refreshControl = useHomeDataRefresh();
  const alerts = state.alerts;
  const shown = useMemo(() => getAlertsByFilter(state, filter), [state, filter]);
  const emptyCopy = getEmptyCopy(filter, alerts.length);

  return (
    <AppScreen title="Alerts" refreshControl={refreshControl}>
      <View style={styles.summary}>
        <SummaryCard label="Total Alerts" value={alerts.length} detail={`${getActiveAlerts(state).length} active`} />
        <SummaryCard label="Problems Detected" value={getCriticalAlerts(state).length} detail="Needs attention" />
      </View>
      <View style={styles.filters}>
        {(["All", "Active", "Critical", "Resolved"] as Filter[]).map((item) => (
          <FilterPill key={item} label={item} active={filter === item} onPress={() => setFilter(item)} />
        ))}
      </View>
      {shown.length === 0 ? (
        <EmptyState title={emptyCopy.title} message={emptyCopy.message} iconName="shield" />
      ) : null}
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

function getEmptyCopy(filter: Filter, alertCount: number) {
  if (alertCount === 0 || filter === "Active") {
    return {
      title: "No active alerts",
      message: "AirGuard will show safety events here when a room needs attention.",
    };
  }
  if (filter === "Critical") {
    return {
      title: "No critical alerts",
      message: "Critical safety events will appear here when immediate attention is needed.",
    };
  }
  if (filter === "Resolved") {
    return {
      title: "No resolved alerts",
      message: "Resolved safety events will appear here after someone checks and clears them.",
    };
  }
  return {
    title: "No active alerts",
    message: "AirGuard will show safety events here when a room needs attention.",
  };
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
