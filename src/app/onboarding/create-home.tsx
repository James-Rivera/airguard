import React, { useEffect, useState } from "react";
import { Keyboard, KeyboardAvoidingView, StyleSheet, TextInput, useWindowDimensions, View } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "@/components/ui/AppButton";
import { AppIcon } from "@/components/ui/AppIcon";
import { AppText } from "@/components/ui/AppText";
import { getOnboardingResumeRoute, shouldLeaveCreateHome } from "@/navigation/onboarding-flow";
import { routes } from "@/navigation/routes";
import { useAirGuard } from "@/state/airguard-store";
import { colors, fonts, radius, spacing } from "@/theme/index";

const BASE_WIDTH = 390;
const BASE_HEIGHT = 844;

export default function CreateHomeRoute() {
  const { state, actions, error, isLoading } = useAirGuard();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const { width, height } = useWindowDimensions();
  const frameWidth = Math.min(width, 430);
  const scale = Math.min(frameWidth / BASE_WIDTH, height / BASE_HEIGHT);
  const horizontalPadding = Math.max(24, 24 * scale);
  const compactHeight = height < 760;
  const heroTop = keyboardOpen ? Math.max(18, height * 0.035) : compactHeight ? Math.max(88, height * 0.12) : Math.max(132, Math.min(180, height * 0.205));
  const copyGap = keyboardOpen ? 14 : compactHeight ? 24 : 38;
  const formGap = keyboardOpen ? 18 : compactHeight ? 36 : 58;

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => setKeyboardOpen(true));
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => setKeyboardOpen(false));
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (isLoading || !shouldLeaveCreateHome(state)) return;
    router.replace(getOnboardingResumeRoute(state));
  }, [isLoading, state]);

  async function submit() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await actions.createHome(name);
      router.push(routes.addSensorProfile);
    } catch {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={[styles.shell, { width: frameWidth }]} behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined}>
        <View style={[styles.content, { paddingHorizontal: horizontalPadding, paddingTop: heroTop }]}>
          <View style={[styles.iconSurface, keyboardOpen && styles.iconSurfaceCompact]}>
            <AppIcon name="home" size={keyboardOpen ? 24 : 30} color={colors.brand} />
          </View>

          <View style={[styles.copyBlock, { paddingTop: copyGap }]}>
            <AppText style={[styles.title, keyboardOpen && styles.titleCompact]}>What should we call{"\n"}your home?</AppText>
            <AppText style={[styles.subtitle, keyboardOpen && styles.subtitleCompact]}>Naming your home helps us organize{"\n"}your sensors and tailor your alerts.</AppText>
          </View>

          <View style={[styles.form, { paddingTop: formGap }]}>
            <View style={styles.inputWrap}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Home Name"
                placeholderTextColor="#434655"
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
                style={styles.input}
              />
            </View>
            <AppText style={styles.helper}>e.g., My Apartment, The Lake House</AppText>
            {error ? <AppText style={styles.error}>{error}</AppText> : null}
          </View>
        </View>

        {!keyboardOpen ? (
          <View style={[styles.footer, { paddingHorizontal: horizontalPadding }]}>
            <StepIndicator />
            <AppButton label={isSubmitting ? "Saving" : "Next"} onPress={submit} disabled={!name.trim() || isSubmitting} style={styles.primaryButton} />
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function StepIndicator() {
  return (
    <View style={styles.dots} accessibilityLabel="Step 2 of 5">
      {[1, 2, 3, 4, 5].map((step) => (
        <View key={step} style={[styles.dot, step === 2 && styles.dotActive]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#FAF8FF",
    flex: 1,
  },
  shell: {
    alignSelf: "center",
    flex: 1,
    maxWidth: 430,
  },
  content: {
    alignItems: "center",
    flex: 1,
  },
  iconSurface: {
    alignItems: "center",
    backgroundColor: "#DBE1FF",
    borderRadius: 32,
    height: 64,
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    width: 64,
  },
  iconSurfaceCompact: {
    borderRadius: 26,
    height: 52,
    width: 52,
  },
  copyBlock: {
    alignItems: "center",
    gap: spacing.lg,
    width: "100%",
  },
  title: {
    color: "#131B2E",
    fontFamily: fonts.bold,
    fontSize: 32,
    lineHeight: 40,
    textAlign: "center",
  },
  titleCompact: {
    fontSize: 26,
    lineHeight: 32,
  },
  subtitle: {
    color: "#434655",
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  subtitleCompact: {
    fontSize: 14,
    lineHeight: 20,
  },
  form: {
    alignSelf: "stretch",
    gap: 12,
  },
  inputWrap: {
    backgroundColor: colors.white,
    borderColor: "#C3C6D7",
    borderRadius: 12,
    borderWidth: 1,
    height: 58,
    justifyContent: "center",
    paddingHorizontal: 38,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  input: {
    color: "#131B2E",
    fontFamily: fonts.medium,
    fontSize: 13,
    height: "100%",
    letterSpacing: 0.6,
    padding: 0,
  },
  helper: {
    color: "#434655",
    fontFamily: fonts.semiBold,
    fontSize: 12,
    letterSpacing: 0.6,
    lineHeight: 16,
    paddingHorizontal: 4,
  },
  error: {
    color: colors.critical,
    fontFamily: fonts.bold,
    fontSize: 12,
  },
  footer: {
    gap: 36,
    paddingBottom: 30,
    paddingTop: 26,
  },
  dots: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  dot: {
    backgroundColor: "#38485D",
    borderRadius: radius.pill,
    height: 8,
    opacity: 0.3,
    width: 8,
  },
  dotActive: {
    backgroundColor: colors.brand,
    opacity: 1,
    width: 24,
  },
  primaryButton: {
    height: 56,
  },
});
