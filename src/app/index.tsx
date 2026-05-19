import React, { useEffect, useState } from "react";
import { ImageBackground, Pressable, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { AppText } from "@/components/ui/AppText";
import { AirGuardWordmark } from "@/components/airguard/AirGuardWordmark";
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
        <LogoMark size={92} />
      </LinearGradient>
    );
  }

  return (
    <View style={styles.root}>
      <ImageBackground source={require("../../assets/images/welcome-purifier-figma.jpg")} resizeMode="cover" style={styles.heroImage}>
        <View style={styles.imageOverlay}>
          <AirGuardWordmark markSize={68} titleSize={36} subtitle="Safer air, smarter homes." light style={styles.brandLockup} />
          <View style={styles.bottomContent}>
            <Pressable style={styles.getStartedButton} onPress={() => router.push(routes.login)}>
              <AppText style={styles.getStartedText}>Get Started</AppText>
            </Pressable>
            <AppText style={styles.terms}>by continuing you agree to our terms & policy</AppText>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignSelf: "center",
    backgroundColor: colors.black,
    flex: 1,
    maxWidth: layout.maxPhoneWidth,
    width: "100%",
  },
  splash: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  heroImage: {
    flex: 1,
  },
  imageOverlay: {
    backgroundColor: "rgba(0,0,0,0.28)",
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 62,
    paddingHorizontal: 18,
    paddingTop: 150,
  },
  brandLockup: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  bottomContent: {
    gap: spacing.sm,
  },
  getStartedButton: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: 18,
    height: layout.buttonHeight,
    justifyContent: "center",
  },
  getStartedText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  terms: {
    color: colors.white,
    fontSize: 12,
    lineHeight: 20,
    opacity: 0.8,
    textAlign: "center",
  },
});
