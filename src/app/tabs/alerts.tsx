import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { AlertCard } from "@/components/airguard/AlertCard";
import { FilterPill } from "@/components/airguard/FilterPill";
import { SummaryCard } from "@/components/airguard/SummaryCard";
import { AppScreen } from "@/components/ui/AppScreen";
import { getActiveAlerts, getAlerts, getCriticalAlerts } from "@/domain/selectors";
import { spacing } from "@/theme/index";

type Filter = "All" | "Active" | "Critical" | "Resolved";

export default function AlertsRoute() {
  const [filter, setFilter] = useState<Filter>("All");
  const alerts = getAlerts();
  const shown = useMemo(
    () =>
      alerts.filter((alert) => {
        if (filter === "Active") return alert.severity !== "resolved";
        if (filter === "Critical") return alert.severity === "critical";
        if (filter === "Resolved") return alert.severity === "resolved";
        return true;
      }),
    [alerts, filter],
  );

  return (
    <AppScreen title="Alerts">
      <View style={styles.summary}>
        <SummaryCard label="Total Alerts" value={alerts.length} detail={`${getActiveAlerts().length} active`} />
        <SummaryCard label="Problems Detected" value={getCriticalAlerts().length} detail="Needs attention" />
      </View>
      <View style={styles.filters}>
        {(["All", "Active", "Critical", "Resolved"] as Filter[]).map((item) => (
          <FilterPill key={item} label={item} active={filter === item} onPress={() => setFilter(item)} />
        ))}
      </View>
      {shown.map((alert) => (
        <AlertCard key={alert.id} alert={alert} onPress={() => router.push(`/alerts/${alert.id}`)} actionLabel={alert.severity === "resolved" ? "Details" : "Open Alert"} onAction={() => router.push(`/alerts/${alert.id}`)} />
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
    flexWrap: "wrap",
    gap: spacing.xs,
  },
});
