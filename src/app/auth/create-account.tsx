import React, { useEffect, useRef, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { AuthBackButton } from "@/components/ui/AuthBackButton";
import { AuthField } from "@/components/ui/AuthField";
import { AppText } from "@/components/ui/AppText";
import { routes } from "@/navigation/routes";
import { useAirGuard } from "@/state/airguard-store";
import { colors, layout, shadows, spacing } from "@/theme/index";

export default function CreateAccountRoute() {
  const { actions } = useAirGuard();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const keyboardOpen = keyboardHeight > 0;

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (event) => setKeyboardHeight(event.endCoordinates.height));
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  function scrollToField(y: number) {
    setTimeout(() => scrollRef.current?.scrollTo({ y, animated: true }), 80);
  }

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(routes.login);
  }

  async function submit() {
    if (isSubmitting) return;
    setError("");
    setIsSubmitting(true);
    const result = await actions.signUp(name, email, password);
    setIsSubmitting(false);
    if (result.ok) {
      router.replace(routes.createHome);
      return;
    }
    if (result.needsVerification) {
      router.replace({ pathname: routes.verifyCode, params: { email: email.trim(), name: name.trim() } });
      return;
    }
    setError("We couldn't create your account. Check your details or use a different email.");
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.screen,
            keyboardOpen && styles.screenKeyboard,
            keyboardOpen ? { paddingBottom: keyboardHeight + spacing.xl } : null,
          ]}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AuthBackButton onPress={goBack} />

          <View style={[styles.header, keyboardOpen && styles.headerKeyboard]}>
            <AppText style={styles.title}>Create Account</AppText>
            <AppText style={styles.subtitle}>Set up AirGuard to monitor rooms, alerts, sensors, and safety reports from one place.</AppText>
          </View>

          <View style={[styles.form, keyboardOpen && styles.formKeyboard]}>
            <AuthField label="Name" icon="name" value={name} onChangeText={setName} textContentType="name" autoComplete="name" onFocus={() => scrollToField(96)} />
            <AuthField label="Email Address" icon="email" value={email} onChangeText={setEmail} keyboardType="email-address" textContentType="emailAddress" autoComplete="email" onFocus={() => scrollToField(162)} />
            <AuthField label="Password" icon="password" value={password} onChangeText={setPassword} secureTextEntry textContentType="newPassword" autoComplete="new-password" onFocus={() => scrollToField(236)} />
            {error ? <AppText style={styles.error}>{error}</AppText> : null}
          </View>

          <Pressable
            onPress={submit}
            disabled={!name.trim() || !email.trim() || !password.trim() || isSubmitting}
            style={[styles.primaryButton, keyboardOpen && styles.primaryButtonKeyboard, (!name.trim() || !email.trim() || !password.trim() || isSubmitting) && styles.disabledButton]}
          >
            <AppText style={styles.primaryText}>{isSubmitting ? "Creating account" : "Create Account"}</AppText>
          </Pressable>

          <Pressable onPress={() => router.replace(routes.login)} style={[styles.loginWrap, keyboardOpen && styles.loginWrapKeyboard]}>
            <AppText style={styles.secondaryText}>
              I already have an account. <AppText style={styles.loginText}>Log in</AppText>
            </AppText>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.white,
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  screen: {
    alignSelf: "center",
    backgroundColor: colors.white,
    flexGrow: 1,
    maxWidth: layout.maxPhoneWidth,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
    paddingTop: 40,
    width: "100%",
  },
  screenKeyboard: {
    flexGrow: 0,
    paddingTop: 24,
  },
  header: {
    gap: spacing.xs,
    marginTop: 58,
  },
  headerKeyboard: {
    marginTop: 22,
  },
  title: {
    color: colors.black,
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 39,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  form: {
    gap: 30,
    marginTop: 34,
  },
  formKeyboard: {
    gap: 18,
    marginTop: 22,
  },
  error: {
    color: colors.critical,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: -14,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: 18,
    height: layout.buttonHeight,
    justifyContent: "center",
    marginTop: 38,
    ...shadows.button,
  },
  primaryButtonKeyboard: {
    marginTop: 24,
  },
  disabledButton: {
    opacity: 0.55,
  },
  primaryText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  loginWrap: {
    alignItems: "center",
    marginTop: 30,
  },
  loginWrapKeyboard: {
    marginTop: 18,
  },
  secondaryText: {
    color: colors.fieldLabel,
    fontSize: 14,
    lineHeight: 18,
  },
  loginText: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
  },
});
