import React from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AlertCard } from "@/components/airguard/AlertCard";
import { DeviceCard } from "@/components/airguard/DeviceCard";
import { ReadingCard } from "@/components/airguard/ReadingCard";
import { AppScreen, SectionHeader } from "@/components/ui/AppScreen";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getActiveAlerts, getDevicesByRoomId, getReadingsByRoomId, getRoomById } from "@/domain/selectors";
import { colors, spacing } from "@/theme/index";

export default function RoomDetailRoute() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const room = getRoomById(roomId);

  if (!room) {
    return <AppScreen title="Room" subtitle="Room not found" onBack={() => router.back()} noBottomPadding>{null}</AppScreen>;
  }

  const roomAlerts = getActiveAlerts().filter((alert) => alert.roomId === room.id);
  const alert = roomAlerts[0];

  return (
    <AppScreen title={room.name} subtitle={room.id === "kitchen" ? "Smoke and ventilation monitor" : "Room air monitor"} onBack={() => router.back()} noBottomPadding>
      <View style={styles.statusRow}>
        <StatusBadge status={room.status} />
      </View>
      {alert ? <AlertCard alert={alert} onPress={() => router.push(`/alerts/${alert.id}`)} actionLabel="Open Alert" onAction={() => router.push(`/alerts/${alert.id}`)} /> : null}
      <SectionHeader title="Readings" />
      <View style={styles.grid}>
        {getReadingsByRoomId(room.id).map((reading) => (
          <ReadingCard key={reading.id} reading={reading} />
        ))}
      </View>
      <SectionHeader title="Devices" />
      {getDevicesByRoomId(room.id).map((device) => (
        <DeviceCard key={device.id} device={device} />
      ))}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: spacing.sm,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
});
