import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { OnboardingStepLayout } from "@/components/airguard/OnboardingStepLayout";
import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";
import { AppText } from "@/components/ui/AppText";
import type { DeviceType } from "@/domain/models";
import { routes } from "@/navigation/routes";
import { getOnboardingResumeRoute } from "@/navigation/onboarding-flow";
import { useAirGuard } from "@/state/airguard-store";
import { colors, fonts, spacing } from "@/theme/index";

const sensorProfiles: Array<{ type: DeviceType; label: string; detail: string; icon: AppIconName; tint: string }> = [
  { type: "air-sensor", label: "Air Quality Sensor", detail: "Monitors overall particulate matter and VOCs.", icon: "air", tint: "rgba(0, 74, 198, 0.1)" },
  { type: "smoke-detector", label: "Smoke Sensor", detail: "Detects airborne combustion particles rapidly.", icon: "smoke", tint: "rgba(0, 108, 73, 0.1)" },
  { type: "co2-sensor", label: "CO₂ Sensor", detail: "Tracks carbon dioxide levels for ventilation.", icon: "co2", tint: "rgba(70, 86, 108, 0.1)" },
];

export default function AddFirstDeviceRoute() {
  const { state, actions, isLoading } = useAirGuard();
  const [selectedType, setSelectedType] = useState<DeviceType>(state.pairingDraft.type ?? "air-sensor");

  useEffect(() => {
    if (isLoading) return;
    if (!state.home || (state.onboardingComplete && state.home) || state.devices.length > 0) {
      router.replace(getOnboardingResumeRoute(state));
    }
  }, [isLoading, state]);

  function submit() {
    actions.prepareSensorProfile(selectedType);
    router.push(routes.assignSensorRoom);
  }

  return (
    <OnboardingStepLayout
      step={3}
      totalSteps={5}
      title="Add sensor profile"
      subtitle="Create a sensor profile for the readings AirGuard will monitor."
      primaryLabel="Next"
      onPrimaryPress={submit}
      onBack={() => router.back()}
    >
      <View style={styles.list}>
        {sensorProfiles.map((item) => (
          <SensorProfileCard key={item.type} item={item} selected={selectedType === item.type} onPress={() => setSelectedType(item.type)} />
        ))}
      </View>
    </OnboardingStepLayout>
  );
}

function SensorProfileCard({
  item,
  selected,
  onPress,
}: {
  item: (typeof sensorProfiles)[number];
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.card, selected && styles.cardSelected]} accessibilityRole="button" accessibilityState={{ selected }}>
      <View style={[styles.iconSurface, { backgroundColor: item.tint }]}>
        <AppIcon name={item.icon} size={26} color={selected ? colors.brand : colors.textSecondary} secondaryColor={colors.brand} />
      </View>
      <View style={styles.copy}>
        <AppText style={styles.cardTitle}>{item.label}</AppText>
        <AppText style={styles.cardDetail}>{item.detail}</AppText>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
  card: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: "#C3C6D7",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 122,
    padding: 24,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  cardSelected: {
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    borderColor: "#004AC6",
  },
  iconSurface: {
    alignItems: "center",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    color: "#131B2E",
    fontFamily: fonts.semiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  cardDetail: {
    color: "#434655",
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  radio: {
    borderColor: "#C3C6D7",
    borderRadius: 12,
    borderWidth: 2,
    height: 24,
    width: 24,
  },
  radioSelected: {
    alignItems: "center",
    backgroundColor: "#004AC6",
    borderColor: "#004AC6",
    justifyContent: "center",
  },
  radioDot: {
    backgroundColor: colors.white,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
});
