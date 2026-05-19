import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { AlertCard } from "@/components/airguard/AlertCard";
import { ReadingCard } from "@/components/airguard/ReadingCard";
import { RoomCard } from "@/components/airguard/RoomCard";
import { SafetyStatusCard } from "@/components/airguard/SafetyStatusCard";
import { AppScreen, SectionHeader } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { getDashboardSummary } from "@/domain/selectors";
import { initials } from "@/lib/formatters";
import { colors, radius, spacing } from "@/theme/index";

export default function HomeRoute() {
  const summary = getDashboardSummary();
  const primaryAlert = summary.criticalAlerts[0] ?? summary.activeAlerts[0];

  return (
    <AppScreen>
      <View style={styles.header}>
        <View>
          <AppText style={styles.brand}>
            <AppText style={styles.brandAir}>Air</AppText>Guard
          </AppText>
          <AppText variant="caption">Good morning, {summary.user.name.split(" ")[0]}!</AppText>
        </View>
        <View style={styles.avatar}>
          <AppText style={styles.avatarText}>{initials(summary.user.name)}</AppText>
        </View>
      </View>
      <View style={styles.metaRow}>
        <AppText variant="muted">{summary.home.name}</AppText>
        <Pressable style={styles.addButton}>
          <AppText style={styles.addText}>Add Device</AppText>
        </Pressable>
      </View>
      <SafetyStatusCard status={summary.status} onAction={() => router.push(primaryAlert ? `/alerts/${primaryAlert.id}` : "/tabs/rooms")} />
      <SectionHeader title="Today's Readings" />
      <View style={styles.grid}>
        {summary.readings.slice(0, 4).map((reading) => (
          <ReadingCard key={reading.id} reading={reading} />
        ))}
      </View>
      <SectionHeader title="Rooms" action={<AppText style={styles.link} onPress={() => router.push("/tabs/rooms")}>See all</AppText>} />
      {summary.rooms.slice(0, 1).map((room) => (
        <RoomCard key={room.id} room={room} wide onPress={() => router.push(`/rooms/${room.id}`)} />
      ))}
      {primaryAlert ? (
        <>
          <SectionHeader title="Alerts" />
          <AlertCard alert={primaryAlert} onPress={() => router.push(`/alerts/${primaryAlert.id}`)} />
        </>
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 64,
  },
  brand: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 39,
  },
  brandAir: {
    color: colors.brandCyan,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.iconSurface,
    borderRadius: radius.pill,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  avatarText: {
    color: colors.brand,
    fontSize: 13,
    fontWeight: "700",
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  addButton: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: radius.md,
    height: 46,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  addText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  link: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: "700",
  },
});
