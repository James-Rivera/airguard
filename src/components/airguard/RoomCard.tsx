import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppCard } from "@/components/ui/AppCard";
import { AppText } from "@/components/ui/AppText";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Reading, Room } from "@/domain/models";
import { colors, radius, spacing } from "@/theme/index";

const iconLabel = {
  bedroom: "Bed",
  "living-room": "Live",
  bathroom: "Bath",
  kitchen: "Kit",
  "dining-room": "Dine",
};

export function RoomCard({ room, readings = [], onPress, wide = false }: { room: Room; readings?: Reading[]; onPress?: () => void; wide?: boolean }) {
  const primary = readings.find((reading) => reading.type === "co2") ?? readings[0];
  const card = (
    <AppCard style={[styles.card, wide ? styles.wide : styles.grid]}>
      <View style={styles.icon}>
        <AppText style={styles.iconText}>{iconLabel[room.icon]}</AppText>
      </View>
      <AppText style={styles.name}>{room.name}</AppText>
      <StatusBadge status={room.status === "good" ? "online" : room.status} />
      <AppText variant="muted">{primary ? `${primary.label} ${primary.value}${primary.unit === "%" ? "%" : ` ${primary.unit}`}` : "No readings"}</AppText>
    </AppCard>
  );
  return onPress ? <Pressable onPress={onPress}>{card}</Pressable> : card;
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.xs,
    minHeight: 112,
  },
  grid: {
    width: 161,
  },
  wide: {
    width: "100%",
  },
  icon: {
    alignItems: "center",
    backgroundColor: colors.iconSurface,
    borderRadius: radius.md,
    height: 40,
    justifyContent: "center",
    width: 53,
  },
  iconText: {
    color: colors.brand,
    fontSize: 11,
    fontWeight: "700",
  },
  name: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
});
