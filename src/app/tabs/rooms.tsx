import React from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { router } from "expo-router";
import { RoomCard } from "@/components/airguard/RoomCard";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppIcon } from "@/components/ui/AppIcon";
import { EmptyState } from "@/components/ui/EmptyState";
import { getReadingsByRoomId, getRooms } from "@/domain/selectors";
import { routes } from "@/navigation/routes";
import { useAirGuard } from "@/state/airguard-store";
import { colors, layout, radius, spacing } from "@/theme/index";

export default function RoomsRoute() {
  const { state } = useAirGuard();
  const { width } = useWindowDimensions();
  const rooms = getRooms(state);
  const shellWidth = Math.min(width, layout.maxPhoneWidth);
  const contentWidth = shellWidth - layout.screenPadding * 2;
  const gap = spacing.md;
  const cardWidth = Math.floor((contentWidth - gap) / 2);

  return (
    <AppScreen title="Rooms" headerAction={<AddButton onPress={() => router.push(routes.addRoom)} />}>
      {rooms.length === 0 ? (
        <EmptyState title="No rooms yet" message="Add the first room you want AirGuard to monitor." actionLabel="Add Room" onAction={() => router.push(routes.addRoom)} />
      ) : null}
      <View style={styles.grid}>
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            readings={getReadingsByRoomId(state, room.id)}
            cardWidth={cardWidth}
            onPress={() => router.push(routes.roomDetail(room.id))}
          />
        ))}
      </View>
    </AppScreen>
  );
}

function AddButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={styles.add} onPress={onPress} accessibilityRole="button" accessibilityLabel="Add room">
      <AppIcon name="plus" size={18} color={colors.white} secondaryColor={colors.white} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  add: {
    alignItems: "center",
    backgroundColor: colors.textSecondary,
    borderRadius: radius.pill,
    height: 25,
    justifyContent: "center",
    width: 25,
  },
});
