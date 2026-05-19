import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { RoomCard } from "@/components/airguard/RoomCard";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { getRooms } from "@/domain/selectors";
import { colors, radius, spacing } from "@/theme/index";

export default function RoomsRoute() {
  return (
    <AppScreen title="Rooms">
      <View style={styles.grid}>
        {getRooms().map((room) => (
          <RoomCard key={room.id} room={room} onPress={() => router.push(`/rooms/${room.id}`)} />
        ))}
      </View>
      <Pressable style={styles.add}>
        <AppText style={styles.addText}>+</AppText>
      </Pressable>
    </AppScreen>
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
    alignSelf: "flex-end",
    backgroundColor: colors.textSecondary,
    borderRadius: radius.pill,
    height: 25,
    justifyContent: "center",
    position: "absolute",
    right: 25,
    top: 9,
    width: 25,
  },
  addText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 20,
  },
});
