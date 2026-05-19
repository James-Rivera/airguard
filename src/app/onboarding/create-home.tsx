import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { TextField } from "@/components/ui/TextField";
import { routes } from "@/navigation/routes";
import { useAirGuard } from "@/state/airguard-store";
import { colors, spacing } from "@/theme/index";

export default function CreateHomeRoute() {
  const { actions, error } = useAirGuard();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  async function submit() {
    await actions.createHome(name, address);
    router.replace(routes.addRooms);
  }

  return (
    <AppScreen title="Create Home" subtitle="This becomes your active Supabase home." onBack={() => router.back()} noBottomPadding>
      <View style={styles.form}>
        <TextField label="Home Name" value={name} onChangeText={setName} placeholder="My Home" />
        <TextField label="Address Label" value={address} onChangeText={setAddress} placeholder="City, neighborhood, or building" />
      </View>
      {error ? <AppText style={styles.error}>{error}</AppText> : null}
      <AppButton label="Create Home" onPress={submit} disabled={!name.trim()} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  error: {
    color: colors.critical,
    fontSize: 12,
    fontWeight: "600",
  },
});
