import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { OnboardingStepLayout } from "@/components/airguard/OnboardingStepLayout";
import { AppIcon } from "@/components/ui/AppIcon";
import { AppText } from "@/components/ui/AppText";
import type { DeviceType } from "@/domain/models";
import { routes } from "@/navigation/routes";
import { getOnboardingResumeRoute } from "@/navigation/onboarding-flow";
import { useAirGuard } from "@/state/airguard-store";
import { colors, fonts, spacing } from "@/theme/index";

export default function ReviewSetupRoute() {
  const { state, actions, error, isLoading } = useAirGuard();
  const sensorType = state.pairingDraft.type ?? state.devices[0]?.type ?? "air-sensor";
  const roomName = state.pairingDraft.roomName ?? state.rooms.find((room) => room.id === state.pairingDraft.roomId)?.name ?? state.rooms[0]?.name ?? "Bedroom";
  const ready = Boolean(state.home && roomName && sensorType);

  useEffect(() => {
    if (isLoading) return;
    if (!state.home || (state.onboardingComplete && state.home)) {
      router.replace(getOnboardingResumeRoute(state));
    }
  }, [isLoading, state]);

  async function finish() {
    await actions.completeOnboardingSetup();
    router.replace(routes.home);
  }

  return (
    <OnboardingStepLayout
      step={5}
      totalSteps={5}
      title="Review setup"
      subtitle="Everything looks good"
      primaryLabel="Start Monitoring"
      primaryDisabled={!ready}
      onPrimaryPress={finish}
      onBack={() => router.back()}
      centered
      hero={
        <View style={styles.successHalo}>
          <View style={styles.successIcon}>
            <AppIcon name="check" size={34} color={colors.white} secondaryColor={colors.white} />
          </View>
        </View>
      }
    >
      <View style={styles.summaryCard}>
        <View style={styles.homeRow}>
          <View style={styles.homeIcon}>
            <AppIcon name="home" size={18} color={colors.brand} />
          </View>
          <View style={styles.summaryCopy}>
            <AppText style={styles.label}>HOME LOCATION</AppText>
            <AppText style={styles.homeValue}>{state.home?.name ?? "Home not set"}</AppText>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailGrid}>
          <SummaryDetail label="ASSIGNED ROOM" value={roomName} icon="living-room" />
          <SummaryDetail label="SENSOR PROFILE" value={sensorLabel(sensorType)} icon="air" />
        </View>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusIcon}>
          <AppIcon name="check" size={20} color={colors.white} secondaryColor={colors.white} />
        </View>
        <View>
          <AppText style={styles.statusTitle}>Ready to monitor</AppText>
          <AppText style={styles.statusDetail}>System initialized</AppText>
        </View>
      </View>

      {error ? <AppText style={styles.error}>{error}</AppText> : null}
    </OnboardingStepLayout>
  );
}

function SummaryDetail({ label, value, icon }: { label: string; value: string; icon: "living-room" | "air" }) {
  return (
    <View style={styles.detail}>
      <AppText style={styles.label}>{label}</AppText>
      <View style={styles.detailValueRow}>
        <AppIcon name={icon} size={17} color={colors.brand} />
        <AppText style={styles.detailValue}>{value}</AppText>
      </View>
    </View>
  );
}

function sensorLabel(type: DeviceType) {
  if (type === "smoke-detector") return "Smoke Sensor";
  if (type === "co2-sensor") return "CO₂ Sensor";
  return "Air Quality";
}

const styles = StyleSheet.create({
  successHalo: {
    alignItems: "center",
    backgroundColor: "rgba(108, 248, 187, 0.2)",
    borderColor: "rgba(0, 108, 73, 0.1)",
    borderRadius: 48,
    borderWidth: 4,
    height: 96,
    justifyContent: "center",
    width: 96,
  },
  successIcon: {
    alignItems: "center",
    backgroundColor: colors.success,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  summaryCard: {
    alignSelf: "stretch",
    backgroundColor: colors.white,
    borderColor: "rgba(195, 198, 215, 0.2)",
    borderRadius: 12,
    borderWidth: 1,
    gap: 24,
    padding: 25,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  homeRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
  },
  homeIcon: {
    alignItems: "center",
    backgroundColor: "rgba(0, 74, 198, 0.1)",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  summaryCopy: {
    flex: 1,
    gap: 4,
  },
  label: {
    color: "#434655",
    fontFamily: fonts.semiBold,
    fontSize: 12,
    letterSpacing: 0.6,
    lineHeight: 16,
  },
  homeValue: {
    color: "#131B2E",
    fontFamily: fonts.semiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  divider: {
    backgroundColor: "rgba(195, 198, 215, 0.3)",
    height: 1,
  },
  detailGrid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  detail: {
    flex: 1,
    gap: spacing.xs,
  },
  detailValueRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  detailValue: {
    color: "#131B2E",
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  statusCard: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: "rgba(108, 248, 187, 0.1)",
    borderColor: "rgba(0, 108, 73, 0.2)",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: 21,
  },
  statusIcon: {
    alignItems: "center",
    backgroundColor: colors.success,
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  statusTitle: {
    color: "#131B2E",
    fontFamily: fonts.semiBold,
    fontSize: 16,
    lineHeight: 24,
  },
  statusDetail: {
    color: "#434655",
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  error: {
    alignSelf: "stretch",
    color: colors.critical,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
});
