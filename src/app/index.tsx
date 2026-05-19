import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { LogoMark } from "@/components/airguard/LogoMark";
import { routes } from "@/navigation/routes";
import { useAirGuard } from "@/state/airguard-store";
import { useSession } from "@/state/session";
import { colors, gradient, layout, spacing } from "@/theme/index";

export default function WelcomeRoute() {
  const [showWelcome, setShowWelcome] = useState(false);
  const { user, isLoading } = useSession();
  const { state } = useAirGuard();

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(true), 850);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading && user) router.replace(state.onboardingComplete && state.home ? routes.home : routes.onboarding);
  }, [isLoading, state.home, state.onboardingComplete, user]);

  if (!showWelcome) {
    return (
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.splash}>
        <LogoMark size={125} />
      </LinearGradient>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <LinearGradient colors={["rgba(2,102,244,0.96)", "rgba(10,202,197,0.82)"]} style={styles.heroOverlay}>
          <View style={styles.heroCopy}>
            <LogoMark size={78} />
            <AppText style={styles.heroTitle}>AirGuard</AppText>
            <AppText style={styles.heroBody}>Smart room-by-room air safety for your home.</AppText>
          </View>
        </LinearGradient>
      </View>
      <View style={styles.buttonArea}>
        <AppButton label="Create Account" onPress={() => router.push(routes.createAccount)} />
        <AppButton label="Log In" onPress={() => router.push(routes.login)} variant="secondary" />
        <AppText style={styles.terms}>by continuing you agree to our terms & policy</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignSelf: "center",
    backgroundColor: colors.background,
    flex: 1,
    maxWidth: layout.maxPhoneWidth,
    width: "100%",
  },
  splash: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  hero: {
    flex: 1,
  },
  heroOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: spacing.xl,
  },
  heroCopy: {
    gap: spacing.sm,
    paddingBottom: 54,
  },
  heroTitle: {
    color: colors.white,
    fontSize: 38,
    fontWeight: "700",
    lineHeight: 44,
  },
  heroBody: {
    color: colors.white,
    fontSize: 17,
    lineHeight: 24,
  },
  buttonArea: {
    gap: spacing.sm,
    minHeight: 201,
    paddingHorizontal: spacing.xl,
    paddingTop: 61,
  },
  terms: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
  },
});
