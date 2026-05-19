import React, { useState } from "react";
import { router } from "expo-router";
import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { TextField } from "@/components/ui/TextField";
import { useAirGuard } from "@/state/airguard-store";

export default function AddRoomRoute() {
  const { actions } = useAirGuard();
  const [name, setName] = useState("");

  async function submit() {
    await actions.addRoom(name);
    router.back();
  }

  return (
    <AppScreen title="Add Room" subtitle="Create a monitored room." onBack={() => router.back()} noBottomPadding>
      <TextField label="Room Name" value={name} onChangeText={setName} placeholder="Kitchen, Nursery, Office" />
      <AppButton label="Add Room" onPress={submit} disabled={!name.trim()} />
    </AppScreen>
  );
}
