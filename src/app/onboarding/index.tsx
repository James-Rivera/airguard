import React, { useEffect } from "react";
import { Image, StyleSheet, useWindowDimensions, View } from "react-native";
import { router } from "expo-router";
import { OnboardingStepLayout } from "@/components/airguard/OnboardingStepLayout";
import { AppIcon } from "@/components/ui/AppIcon";
import { getOnboardingResumeRoute } from "@/navigation/onboarding-flow";
import { routes } from "@/navigation/routes";
import { useAirGuard } from "@/state/airguard-store";
import { colors } from "@/theme/index";

export default function OnboardingRoute() {
  const { state, isLoading } = useAirGuard();
  const { height } = useWindowDimensions();
  const introTop = Math.max(86, Math.min(126, height * 0.13));

  useEffect(() => {
    if (isLoading) return;
    const resumeRoute = getOnboardingResumeRoute(state);
    if (resumeRoute !== routes.onboarding) router.replace(resumeRoute);
  }, [isLoading, state]);

  return (
    <OnboardingStepLayout
      step={1}
      totalSteps={5}
      title={"Your Air,\nProtected."}
      subtitle={"Follow the steps to secure your\nliving space."}
      primaryLabel="Start Setup"
      onPrimaryPress={() => router.push(routes.createHome)}
      centered
      scrollable={false}
      pillButton
      primaryRightIcon="arrow-right"
      contentStyle={[styles.content, { paddingTop: introTop }]}
      hero={
        <View style={styles.heroGlow}>
          <Image source={require("../../../assets/images/onboarding-intro-glow.png")} style={styles.glowImage} resizeMode="contain" />
          <View style={styles.heroIcon}>
            <AppIcon name="shield" size={40} color={colors.brand} secondaryColor={colors.brand} />
          </View>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  heroGlow: {
    alignItems: "center",
    borderRadius: 70,
    height: 140,
    justifyContent: "center",
    position: "relative",
    width: 140,
  },
  glowImage: {
    height: 140,
    position: "absolute",
    width: 140,
  },
  heroIcon: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 48,
    height: 96,
    justifyContent: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    width: 96,
  },
  content: {
    justifyContent: "flex-start",
  },
});
