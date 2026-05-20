import React, { useMemo, useState } from "react";
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import type { DeviceType, Room } from "@/domain/models";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TextField } from "@/components/ui/TextField";
import { routes } from "@/navigation/routes";
import { useAirGuard } from "@/state/airguard-store";
import { colors, fonts, layout, radius, shadows, spacing } from "@/theme/index";

type DeviceOption = {
  label: string;
  value: DeviceType;
  detail: string;
  icon: AppIconName;
  reading: string;
  power: string;
};

const deviceTypes: DeviceOption[] = [
  { label: "Air Sensor", value: "air-sensor", detail: "Overall air quality and CO2 baseline.", icon: "air", reading: "Initial CO2 reading", power: "Battery profile" },
  { label: "Smoke Detector", value: "smoke-detector", detail: "Smoke and airborne particle alerts.", icon: "smoke", reading: "Initial smoke reading", power: "Battery profile" },
  { label: "CO2 Sensor", value: "co2-sensor", detail: "Ventilation and occupancy comfort.", icon: "co2", reading: "Initial CO2 reading", power: "Battery profile" },
  { label: "Ventilation Fan", value: "ventilation-fan", detail: "Airflow response during unsafe events.", icon: "fan", reading: "No initial reading", power: "Power connected" },
  { label: "Alarm", value: "alarm", detail: "Audible notification for safety events.", icon: "alert", reading: "No initial reading", power: "Power connected" },
];

export default function AddDeviceRoute() {
  const { state, actions } = useAirGuard();
  const { width } = useWindowDimensions();
  const [type, setType] = useState<DeviceType>("air-sensor");
  const [roomId, setRoomId] = useState(state.rooms[0]?.id ?? "");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const shellWidth = Math.min(width, layout.maxPhoneWidth);
  const contentWidth = shellWidth - layout.screenPadding * 2;
  const optionWidth = contentWidth < 340 ? contentWidth : Math.floor((contentWidth - spacing.sm) / 2);
  const selectedType = useMemo(() => deviceTypes.find((item) => item.value === type) ?? deviceTypes[0], [type]);
  const selectedRoom = useMemo(() => state.rooms.find((room) => room.id === roomId), [roomId, state.rooms]);
  const suggestedName = defaultDeviceName(selectedRoom, selectedType);

  async function submit() {
    if (!roomId || isSubmitting) return;
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      const device = await actions.addDevice(name, type, roomId);
      router.replace(routes.deviceDetail(device.id));
    } catch (err) {
      console.warn("[AirGuard] Add device failed", err);
      setErrorMessage("Device could not be added. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={[styles.shell, { width: shellWidth }]} behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back">
            <AppIcon name="arrow-left" size={28} color={colors.textPrimary} secondaryColor={colors.textPrimary} />
          </Pressable>
          <View style={styles.headerCopy}>
            <AppText style={styles.headerTitle}>Add device</AppText>
            <AppText style={styles.headerSubtitle}>Pair a simulated sensor profile with a monitored room.</AppText>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {state.rooms.length === 0 ? (
            <EmptyState
              title="Add a room first"
              message="Devices need a room assignment before AirGuard can monitor them."
              iconName="rooms"
              actionLabel="Add Room"
              onAction={() => router.replace(routes.addRoom)}
            />
          ) : (
            <>
              <AppCard subtleShadow style={styles.heroCard}>
                <View style={styles.heroIcon}>
                  <AppIcon name="scan" size={28} color={colors.brand} secondaryColor={colors.accent} />
                </View>
                <View style={styles.heroCopy}>
                  <View style={styles.heroTitleRow}>
                    <AppText style={styles.heroTitle}>Setup preview</AppText>
                    <StatusBadge status="pairing" />
                  </View>
                  <AppText variant="body">AirGuard will create the device first, then attach any startup readings to the saved device record.</AppText>
                </View>
              </AppCard>

              <View style={styles.section}>
                <SectionTitle title="Device Type" />
                <View style={styles.optionGrid}>
                  {deviceTypes.map((item) => (
                    <DeviceTypeCard
                      key={item.value}
                      item={item}
                      selected={type === item.value}
                      width={optionWidth}
                      onPress={() => setType(item.value)}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <SectionTitle title="Room Assignment" />
                <AppCard subtleShadow style={styles.roomList}>
                  {state.rooms.map((room) => (
                    <RoomSelector key={room.id} room={room} selected={roomId === room.id} onPress={() => setRoomId(room.id)} />
                  ))}
                </AppCard>
              </View>

              <TextField
                label="Device Name"
                value={name}
                onChangeText={setName}
                placeholder={suggestedName}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={submit}
                helperText="Leave blank to use the suggested device name."
              />

              <AppCard subtleShadow style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <View style={styles.summaryIcon}>
                    <AppIcon name={selectedType.icon} size={24} color={colors.brand} secondaryColor={colors.brand} />
                  </View>
                  <View style={styles.summaryCopy}>
                    <AppText style={styles.summaryTitle}>{name.trim() || suggestedName}</AppText>
                    <AppText variant="caption">{selectedRoom ? `${selectedRoom.name} - ${selectedType.label}` : "Choose a room"}</AppText>
                  </View>
                </View>
                <View style={styles.summaryFacts}>
                  <SummaryFact label="Startup" value={selectedType.reading} />
                  <SummaryFact label="Power" value={selectedType.power} />
                </View>
              </AppCard>

              {errorMessage ? <ErrorBanner message={errorMessage} /> : null}

              <AppButton
                label={isSubmitting ? "Pairing Device" : "Pair and Add Device"}
                onPress={submit}
                disabled={!roomId || isSubmitting}
                style={styles.primaryButton}
              />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <AppText style={styles.sectionTitle}>{title}</AppText>;
}

function DeviceTypeCard({ item, selected, width, onPress }: { item: DeviceOption; selected: boolean; width: number; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.optionCard, { width }, selected && styles.optionCardSelected]} accessibilityRole="button" accessibilityState={{ selected }}>
      <View style={[styles.optionIcon, selected && styles.optionIconSelected]}>
        <AppIcon name={item.icon} size={23} color={selected ? colors.white : colors.brand} secondaryColor={selected ? colors.white : colors.accent} />
      </View>
      <View style={styles.optionCopy}>
        <AppText style={[styles.optionTitle, selected && styles.optionTitleSelected]} numberOfLines={1}>
          {item.label}
        </AppText>
        <AppText style={[styles.optionDetail, selected && styles.optionDetailSelected]} numberOfLines={3}>
          {item.detail}
        </AppText>
      </View>
      {selected ? (
        <View style={styles.selectedMark}>
          <AppIcon name="check" size={13} color={colors.white} secondaryColor={colors.white} />
        </View>
      ) : null}
    </Pressable>
  );
}

function RoomSelector({ room, selected, onPress }: { room: Room; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.roomOption, selected && styles.roomOptionSelected]} accessibilityRole="button" accessibilityState={{ selected }}>
      <View style={[styles.roomIcon, selected && styles.roomIconSelected]}>
        <AppIcon name={room.icon} size={20} color={selected ? colors.white : colors.brand} secondaryColor={selected ? colors.white : colors.brand} />
      </View>
      <View style={styles.roomCopy}>
        <AppText style={styles.roomName}>{room.name}</AppText>
        <AppText variant="caption">{roomStatusLabel(room.status)}</AppText>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
    </Pressable>
  );
}

function SummaryFact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryFact}>
      <AppText style={styles.summaryFactLabel}>{label}</AppText>
      <AppText style={styles.summaryFactValue}>{value}</AppText>
    </View>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <View style={styles.errorBanner}>
      <AppIcon name="alert" size={18} color={colors.critical} secondaryColor={colors.critical} />
      <AppText style={styles.errorText}>{message}</AppText>
    </View>
  );
}

function defaultDeviceName(room: Room | undefined, option: DeviceOption) {
  return `${room?.name ?? "Room"} ${option.label}`;
}

function roomStatusLabel(status: Room["status"]) {
  if (status === "critical") return "Critical room";
  if (status === "warning") return "Warning room";
  if (status === "offline") return "Offline room";
  return "Ready for pairing";
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#FAF8FF",
    flex: 1,
  },
  shell: {
    alignSelf: "center",
    flex: 1,
    maxWidth: layout.maxPhoneWidth,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 74,
    paddingHorizontal: layout.screenPadding,
  },
  backButton: {
    alignItems: "center",
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  headerTitle: {
    color: colors.textInk,
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 35,
  },
  headerSubtitle: {
    color: colors.textGraphite,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.sm,
  },
  heroCard: {
    alignItems: "center",
    borderColor: "rgba(195,198,215,0.32)",
    flexDirection: "row",
    gap: spacing.md,
  },
  heroIcon: {
    alignItems: "center",
    backgroundColor: colors.iconSurface,
    borderRadius: radius.lg,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  heroCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  heroTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  heroTitle: {
    color: colors.textPrimary,
    flex: 1,
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 24,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 18,
    lineHeight: 24,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  optionCard: {
    backgroundColor: colors.white,
    borderColor: colors.readingBorder,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.sm,
    minHeight: 164,
    padding: spacing.md,
    position: "relative",
    ...shadows.cardSubtle,
  },
  optionCardSelected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  optionIcon: {
    alignItems: "center",
    backgroundColor: colors.iconSurface,
    borderRadius: radius.md,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  optionIconSelected: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  optionCopy: {
    gap: spacing.xxs,
  },
  optionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 14,
    lineHeight: 19,
  },
  optionTitleSelected: {
    color: colors.white,
  },
  optionDetail: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  optionDetailSelected: {
    color: colors.heroText,
  },
  selectedMark: {
    alignItems: "center",
    backgroundColor: "rgba(6,38,74,0.3)",
    borderRadius: radius.pill,
    height: 22,
    justifyContent: "center",
    position: "absolute",
    right: 12,
    top: 12,
    width: 22,
  },
  roomList: {
    gap: spacing.xs,
    padding: spacing.sm,
  },
  roomOption: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 64,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  roomOptionSelected: {
    backgroundColor: colors.iconSurface,
    borderColor: colors.brand,
  },
  roomIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  roomIconSelected: {
    backgroundColor: colors.brand,
  },
  roomCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  roomName: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  radio: {
    borderColor: colors.readingBorder,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 22,
    width: 22,
  },
  radioSelected: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderColor: colors.brand,
    justifyContent: "center",
  },
  radioDot: {
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    height: 8,
    width: 8,
  },
  summaryCard: {
    borderColor: "rgba(195,198,215,0.32)",
    gap: spacing.md,
  },
  summaryHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  summaryIcon: {
    alignItems: "center",
    backgroundColor: colors.iconSurface,
    borderRadius: radius.md,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  summaryCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  summaryTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 17,
    lineHeight: 23,
  },
  summaryFacts: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  summaryFact: {
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    flex: 1,
    gap: 3,
    minHeight: 60,
    padding: spacing.sm,
  },
  summaryFactLabel: {
    color: colors.textMuted,
    fontFamily: fonts.semiBold,
    fontSize: 11,
    lineHeight: 15,
    textTransform: "uppercase",
  },
  summaryFactValue: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 17,
  },
  errorBanner: {
    alignItems: "center",
    backgroundColor: colors.criticalSurface,
    borderColor: colors.borderDanger,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  errorText: {
    color: colors.critical,
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  primaryButton: {
    height: 58,
  },
});
