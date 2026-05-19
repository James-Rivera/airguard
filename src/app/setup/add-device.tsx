import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import type { DeviceType } from "@/domain/models";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { TextField } from "@/components/ui/TextField";
import { useAirGuard } from "@/state/airguard-store";
import { colors, radius, spacing } from "@/theme/index";

const deviceTypes: Array<{ label: string; value: DeviceType }> = [
  { label: "Air Sensor", value: "air-sensor" },
  { label: "Smoke Detector", value: "smoke-detector" },
  { label: "CO2 Sensor", value: "co2-sensor" },
  { label: "Ventilation Fan", value: "ventilation-fan" },
  { label: "Alarm", value: "alarm" },
];

export default function AddDeviceRoute() {
  const { state, actions } = useAirGuard();
  const [type, setType] = useState<DeviceType>("air-sensor");
  const [roomId, setRoomId] = useState(state.rooms[0]?.id ?? "");
  const [name, setName] = useState("");

  async function submit() {
    await actions.startDevicePairing(type, roomId);
    await actions.finishDevicePairing();
    await actions.addDevice(name, type, roomId);
    router.back();
  }

  return (
    <AppScreen title="Add Device" subtitle="Pair a device to your home." onBack={() => router.back()} noBottomPadding>
      <AppText style={styles.label}>Device Type</AppText>
      <View style={styles.wrap}>
        {deviceTypes.map((item) => (
          <Pressable key={item.value} onPress={() => setType(item.value)} style={[styles.pill, type === item.value && styles.pillActive]}>
            <AppText style={[styles.pillText, type === item.value && styles.pillTextActive]}>{item.label}</AppText>
          </Pressable>
        ))}
      </View>
      <AppText style={styles.label}>Room</AppText>
      <AppCard style={styles.rooms}>
        {state.rooms.map((room) => (
          <Pressable key={room.id} onPress={() => setRoomId(room.id)} style={[styles.room, roomId === room.id && styles.roomActive]}>
            <AppText style={styles.roomText}>{room.name}</AppText>
          </Pressable>
        ))}
      </AppCard>
      <TextField label="Device Name" value={name} onChangeText={setName} placeholder="Kitchen Smoke Detector" />
      <AppButton label="Pair and Add Device" onPress={submit} disabled={!roomId} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  pill: {
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  pillActive: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  pillText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  pillTextActive: {
    color: colors.white,
  },
  rooms: {
    gap: spacing.xs,
  },
  room: {
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.sm,
  },
  roomActive: {
    backgroundColor: colors.iconSurface,
    borderColor: colors.brand,
  },
  roomText: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
});
