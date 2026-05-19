import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { TextField } from "@/components/ui/TextField";
import { routes } from "@/navigation/routes";
import { useAirGuard } from "@/state/airguard-store";
import { colors, spacing } from "@/theme/index";

const suggestions = ["Kitchen", "Living Room", "Bedroom"];

export default function AddRoomsRoute() {
  const { state, actions, error } = useAirGuard();
  const [name, setName] = useState("");

  async function add(nameToAdd = name) {
    await actions.addRoom(nameToAdd);
    setName("");
  }

  return (
    <AppScreen title="Add Rooms" subtitle="Add the rooms you want to monitor first." onBack={() => router.back()} noBottomPadding>
      <View style={styles.suggestions}>
        {suggestions.map((item) => (
          <AppButton key={item} label={item} onPress={() => add(item)} variant={state.rooms.some((room) => room.name === item) ? "secondary" : "primary"} />
        ))}
      </View>
      <TextField label="Custom Room" value={name} onChangeText={setName} placeholder="Nursery, Office, Hallway" />
      <AppButton label="Add Room" onPress={() => add()} disabled={!name.trim()} variant="secondary" />
      <AppCard style={styles.list}>
        {state.rooms.length ? state.rooms.map((room) => <AppText key={room.id} style={styles.room}>{room.name}</AppText>) : <AppText variant="muted">No rooms added yet.</AppText>}
      </AppCard>
      {error ? <AppText style={styles.error}>{error}</AppText> : null}
      <AppButton label="Continue" onPress={() => router.replace(routes.addFirstDevice)} disabled={state.rooms.length === 0} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  suggestions: {
    gap: spacing.sm,
  },
  list: {
    gap: spacing.xs,
  },
  room: {
    color: colors.textPrimary,
    fontWeight: "600",
  },
  error: {
    color: colors.critical,
    fontSize: 12,
    fontWeight: "600",
  },
});
