import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { router } from "expo-router";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { TextField } from "@/components/ui/TextField";
import type { Room } from "@/domain/models";
import { useAirGuard } from "@/state/airguard-store";
import { colors, fonts, layout, radius, spacing } from "@/theme/index";

type RoomTemplate = {
  key: string;
  name: string;
  icon: AppIconName;
  roomType?: Room["icon"];
  detail: string;
};

const roomTemplates: RoomTemplate[] = [
  { key: "bedroom", name: "Bedroom", icon: "bedroom", roomType: "bedroom", detail: "Sleep and overnight comfort" },
  { key: "kitchen", name: "Kitchen", icon: "kitchen", roomType: "kitchen", detail: "Smoke and cooking air" },
  { key: "living-room", name: "Living Room", icon: "living-room", roomType: "living-room", detail: "Shared family space" },
  { key: "office", name: "Office", icon: "office", roomType: "office", detail: "Work and study airflow" },
  { key: "nursery", name: "Nursery", icon: "nursery", roomType: "nursery", detail: "Sensitive room monitoring" },
  { key: "bathroom", name: "Bathroom", icon: "bathroom", roomType: "bathroom", detail: "Humidity watch" },
  { key: "custom", name: "Custom", icon: "plus", detail: "Name another room" },
];

export default function AddRoomRoute() {
  const { actions, error } = useAirGuard();
  const { width } = useWindowDimensions();
  const [selectedKey, setSelectedKey] = useState("bedroom");
  const [name, setName] = useState("Bedroom");
  const [isSaving, setIsSaving] = useState(false);
  const shellWidth = Math.min(width, layout.maxPhoneWidth);
  const contentWidth = shellWidth - layout.screenPadding * 2;
  const cardWidth = Math.floor((contentWidth - spacing.md) / 2);
  const selectedTemplate = useMemo(() => roomTemplates.find((item) => item.key === selectedKey) ?? roomTemplates[0], [selectedKey]);
  const isCustom = selectedTemplate.key === "custom";

  function selectTemplate(template: RoomTemplate) {
    setSelectedKey(template.key);
    setName(template.key === "custom" ? "" : template.name);
  }

  async function submit() {
    const roomName = name.trim();
    if (!roomName || isSaving) return;
    setIsSaving(true);
    try {
      await actions.addRoom(roomName, selectedTemplate.roomType);
      router.back();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AppScreen title="Add Room" subtitle="Choose the room AirGuard should monitor next." onBack={() => router.back()} noBottomPadding>
      <AppCard subtleShadow style={styles.hero}>
        <View style={styles.heroIcon}>
          <AppIcon name="rooms" size={28} color={colors.brand} secondaryColor={colors.accent} />
        </View>
        <View style={styles.heroCopy}>
          <AppText style={styles.heroTitle}>Room profile</AppText>
          <AppText variant="body">Start with a room type, then customize the display name before saving it to your home.</AppText>
        </View>
      </AppCard>

      <View style={styles.sectionHeader}>
        <AppText style={styles.sectionTitle}>Room Type</AppText>
      </View>

      <View style={styles.grid}>
        {roomTemplates.map((template) => (
          <RoomOptionCard key={template.key} template={template} selected={selectedKey === template.key} cardWidth={cardWidth} onPress={() => selectTemplate(template)} />
        ))}
      </View>

      <TextField
        label="Room Name"
        value={name}
        onChangeText={setName}
        placeholder={isCustom ? "Hallway, Basement, Guest Room" : selectedTemplate.name}
        autoCapitalize="words"
        returnKeyType="done"
        onSubmitEditing={submit}
      />

      <AppCard subtleShadow style={styles.summary}>
        <View style={styles.summaryIcon}>
          <AppIcon name={isCustom ? "rooms" : selectedTemplate.icon} size={22} color={colors.brand} secondaryColor={colors.brand} />
        </View>
        <View style={styles.summaryCopy}>
          <AppText style={styles.summaryTitle}>{name.trim() || "Room name"}</AppText>
          <AppText variant="caption">{isCustom ? "AirGuard will infer the best room icon from the name." : selectedTemplate.detail}</AppText>
        </View>
      </AppCard>

      {error ? <AppText style={styles.error}>{error}</AppText> : null}
      <AppButton label={isSaving ? "Adding Room" : "Add Room"} onPress={submit} disabled={!name.trim() || isSaving} />
    </AppScreen>
  );
}

function RoomOptionCard({ template, selected, cardWidth, onPress }: { template: RoomTemplate; selected: boolean; cardWidth: number; onPress: () => void }) {
  const iconName = template.key === "custom" ? "plus" : template.icon;
  return (
    <Pressable onPress={onPress} style={[styles.optionCard, { width: cardWidth }, selected && styles.optionCardSelected]} accessibilityRole="button" accessibilityState={{ selected }}>
      <View style={[styles.optionIcon, selected && styles.optionIconSelected]}>
        <AppIcon name={iconName} size={26} color={selected ? colors.white : colors.brand} secondaryColor={selected ? colors.white : colors.accent} />
      </View>
      <View style={styles.optionCopy}>
        <AppText style={[styles.optionTitle, selected && styles.optionTitleSelected]} numberOfLines={1}>
          {template.name}
        </AppText>
        <AppText style={[styles.optionDetail, selected && styles.optionDetailSelected]} numberOfLines={2}>
          {template.detail}
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

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  heroIcon: {
    alignItems: "center",
    backgroundColor: colors.iconSurface,
    borderRadius: radius.md,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  heroCopy: {
    flex: 1,
    gap: 3,
  },
  heroTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 18,
    lineHeight: 24,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  optionCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.card,
    borderWidth: 1,
    gap: spacing.sm,
    minHeight: 144,
    padding: spacing.md,
    position: "relative",
  },
  optionCardSelected: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  optionIcon: {
    alignItems: "center",
    backgroundColor: colors.iconSurface,
    borderRadius: radius.md,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  optionIconSelected: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  optionCopy: {
    gap: 3,
  },
  optionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 15,
    lineHeight: 20,
  },
  optionTitleSelected: {
    color: colors.white,
  },
  optionDetail: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
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
  summary: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  summaryIcon: {
    alignItems: "center",
    backgroundColor: colors.iconSurface,
    borderRadius: radius.md,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  summaryCopy: {
    flex: 1,
    gap: 2,
  },
  summaryTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  error: {
    color: colors.critical,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
});
