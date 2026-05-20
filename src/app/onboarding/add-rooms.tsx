import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { router } from "expo-router";
import { OnboardingStepLayout } from "@/components/airguard/OnboardingStepLayout";
import { AppButton } from "@/components/ui/AppButton";
import { AppIcon } from "@/components/ui/AppIcon";
import { AppText } from "@/components/ui/AppText";
import { TextField } from "@/components/ui/TextField";
import type { Room } from "@/domain/models";
import { routes } from "@/navigation/routes";
import { getOnboardingResumeRoute } from "@/navigation/onboarding-flow";
import { useAirGuard } from "@/state/airguard-store";
import { colors, fonts, spacing } from "@/theme/index";

type RoomOption = {
  key: string;
  id?: string;
  name: string;
  icon: Room["icon"];
};

const defaultRooms: RoomOption[] = [
  { key: "default-bedroom", name: "Bedroom", icon: "bedroom" },
  { key: "default-living-room", name: "Living Room", icon: "living-room" },
  { key: "default-kitchen", name: "Kitchen", icon: "kitchen" },
  { key: "default-bathroom", name: "Bathroom", icon: "bathroom" },
];

export default function AddRoomsRoute() {
  const { state, actions, isLoading } = useAirGuard();
  const { width } = useWindowDimensions();
  const roomOptions = useMemo(() => (state.rooms.length ? state.rooms.map(roomToOption) : defaultRooms), [state.rooms]);
  const [selectedKey, setSelectedKey] = useState(() => getInitialSelectedKey(roomOptions, state.pairingDraft.roomId, state.pairingDraft.roomName));
  const [customOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const shellWidth = Math.min(width, 430);
  const horizontalPadding = width < 360 ? 18 : 24;
  const gridGap = spacing.md;
  const cardWidth = Math.floor((shellWidth - horizontalPadding * 2 - gridGap) / 2);
  const selectedRoom = roomOptions.find((room) => room.key === selectedKey) ?? roomOptions[0];

  useEffect(() => {
    if (isLoading) return;
    if (!state.home || (state.onboardingComplete && state.home) || (!state.pairingDraft.type && state.devices.length === 0)) {
      router.replace(getOnboardingResumeRoute(state));
    }
  }, [isLoading, state]);

  useEffect(() => {
    if (roomOptions.some((room) => room.key === selectedKey)) return;
    setSelectedKey(getInitialSelectedKey(roomOptions, state.pairingDraft.roomId, state.pairingDraft.roomName));
  }, [roomOptions, selectedKey, state.pairingDraft.roomId, state.pairingDraft.roomName]);

  function submit(room = selectedRoom) {
    if (!room) return;
    const existingRoom = room.id ? state.rooms.find((item) => item.id === room.id) : state.rooms.find((item) => item.name.toLowerCase() === room.name.toLowerCase());
    actions.prepareSensorRoom({ id: existingRoom?.id, name: room.name, icon: existingRoom?.icon ?? room.icon });
    router.push(routes.reviewSetup);
  }

  function useCustomRoom() {
    const nextName = customName.trim();
    if (!nextName) return;
    actions.prepareSensorRoom({ name: nextName });
    router.push(routes.reviewSetup);
  }

  return (
    <OnboardingStepLayout
      step={4}
      totalSteps={5}
      title="Assign sensor to room"
      subtitle="Which room will this sensor be monitoring?"
      primaryLabel="Next"
      onPrimaryPress={() => submit()}
      onBack={() => router.back()}
    >
      <View style={styles.grid}>
        {roomOptions.map((room) => (
          <RoomOptionCard key={room.key} item={room} selected={selectedKey === room.key} cardWidth={cardWidth} onPress={() => setSelectedKey(room.key)} />
        ))}
      </View>

      {customOpen ? (
        <View style={styles.customPanel}>
          <TextField
            label="Custom room"
            value={customName}
            onChangeText={setCustomName}
            placeholder="Nursery, hallway, basement"
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={useCustomRoom}
          />
          <AppButton label="Use Custom Room" onPress={useCustomRoom} disabled={!customName.trim()} variant="secondary" />
        </View>
      ) : (
        <Pressable style={styles.customButton} onPress={() => setCustomOpen(true)} accessibilityRole="button">
          <AppIcon name="plus" size={20} color="#004AC6" />
          <AppText style={styles.customText}>Add Custom Room</AppText>
        </Pressable>
      )}
    </OnboardingStepLayout>
  );
}

function RoomOptionCard({
  item,
  selected,
  onPress,
  cardWidth,
}: {
  item: RoomOption;
  selected: boolean;
  cardWidth: number;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.roomCard, { width: cardWidth }, selected && styles.roomCardSelected]} accessibilityRole="button" accessibilityState={{ selected }}>
      <View style={[styles.roomIcon, selected && styles.roomIconSelected]}>
        <AppIcon name={item.icon} size={30} color={selected ? colors.white : colors.brand} secondaryColor={selected ? colors.white : colors.brand} />
      </View>
      <AppText style={[styles.roomName, selected && styles.roomNameSelected]}>{item.name}</AppText>
      {selected ? (
        <View style={styles.selectedMark}>
          <AppIcon name="check" size={14} color={colors.white} secondaryColor={colors.white} />
        </View>
      ) : null}
    </Pressable>
  );
}

function roomToOption(room: Room): RoomOption {
  if (room.icon === "bedroom") return { key: `room-${room.id}`, id: room.id, name: room.name, icon: "bedroom" };
  if (room.icon === "kitchen") return { key: `room-${room.id}`, id: room.id, name: room.name, icon: "kitchen" };
  if (room.icon === "bathroom") return { key: `room-${room.id}`, id: room.id, name: room.name, icon: "bathroom" };
  if (room.icon === "dining-room") return { key: `room-${room.id}`, id: room.id, name: room.name, icon: "dining-room" };
  if (room.icon === "office") return { key: `room-${room.id}`, id: room.id, name: room.name, icon: "office" };
  if (room.icon === "nursery") return { key: `room-${room.id}`, id: room.id, name: room.name, icon: "nursery" };
  return { key: `room-${room.id}`, id: room.id, name: room.name, icon: "living-room" };
}

function getInitialSelectedKey(roomOptions: RoomOption[], roomId?: string, roomName?: string) {
  if (roomId) {
    const match = roomOptions.find((room) => room.id === roomId);
    if (match) return match.key;
  }
  if (roomName) {
    const match = roomOptions.find((room) => room.name.toLowerCase() === roomName.toLowerCase());
    if (match) return match.key;
  }
  return roomOptions[0]?.key ?? "default-bedroom";
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  roomCard: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: "rgba(195, 198, 215, 0.3)",
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.md,
    height: 154,
    justifyContent: "center",
    position: "relative",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
  },
  roomCardSelected: {
    backgroundColor: "#2563EB",
    borderColor: "#004AC6",
    borderWidth: 2,
    shadowOpacity: 0.1,
  },
  roomIcon: {
    alignItems: "center",
    backgroundColor: "#EAEDFF",
    borderRadius: 32,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  roomIconSelected: {
    backgroundColor: "rgba(0, 74, 198, 0.2)",
  },
  roomName: {
    color: "#131B2E",
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  roomNameSelected: {
    color: "#EEEFFF",
  },
  selectedMark: {
    alignItems: "center",
    backgroundColor: "#004AC6",
    borderRadius: 10,
    height: 20,
    justifyContent: "center",
    position: "absolute",
    right: 12,
    top: 12,
    width: 20,
  },
  customButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#F2F3FF",
    borderRadius: 12,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: 25,
    paddingVertical: 17,
  },
  customText: {
    color: "#004AC6",
    fontFamily: fonts.bold,
    fontSize: 16,
    lineHeight: 24,
  },
  customPanel: {
    backgroundColor: colors.white,
    borderColor: "rgba(195, 198, 215, 0.3)",
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
});
