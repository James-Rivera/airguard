import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { TextField } from "@/components/ui/TextField";
import { routes } from "@/navigation/routes";
import { useAirGuard } from "@/state/airguard-store";
import { colors, fonts, spacing } from "@/theme/index";

export default function HomeSettingsRoute() {
  const { state, actions, error } = useAirGuard();
  const [name, setName] = useState(state.home?.name ?? "");
  const [address, setAddress] = useState(state.home?.address ?? "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(state.home?.name ?? "");
    setAddress(state.home?.address ?? "");
  }, [state.home?.address, state.home?.name]);

  async function save() {
    if (!name.trim() || isSaving) return;
    setIsSaving(true);
    try {
      await actions.updateHome(name, address);
      router.back();
    } finally {
      setIsSaving(false);
    }
  }

  if (!state.home) {
    return (
      <AppScreen title="Home Settings" subtitle="Home profile" onBack={() => router.back()} noBottomPadding>
        <EmptyState title="No home yet" message="Create a home before editing home settings." actionLabel="Create Home" onAction={() => router.replace(routes.createHome)} />
      </AppScreen>
    );
  }

  return (
    <AppScreen title="Home Settings" subtitle="Home profile" onBack={() => router.back()} noBottomPadding>
      <AppCard subtleShadow style={styles.summary}>
        <AppText style={styles.summaryLabel}>Current Home</AppText>
        <AppText style={styles.summaryTitle}>{state.home.name}</AppText>
        <AppText variant="caption">{state.home.address ?? "No address label set"}</AppText>
      </AppCard>
      <View style={styles.form}>
        <TextField label="Home Name" value={name} onChangeText={setName} placeholder="My Home" autoCapitalize="words" />
        <TextField label="Address Label" value={address} onChangeText={setAddress} placeholder="Family house, Unit 12, Main Street" autoCapitalize="words" />
      </View>
      {error ? <AppText style={styles.error}>{error}</AppText> : null}
      <AppButton label={isSaving ? "Saving" : "Save Changes"} onPress={save} disabled={!name.trim() || isSaving} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  summary: {
    gap: spacing.xs,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 16,
    textTransform: "uppercase",
  },
  summaryTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 22,
    lineHeight: 28,
  },
  form: {
    gap: spacing.md,
  },
  error: {
    color: colors.critical,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
});
