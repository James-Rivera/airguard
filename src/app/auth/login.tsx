import React, { useState } from "react";
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { AuthBackButton } from "@/components/ui/AuthBackButton";
import { AuthField } from "@/components/ui/AuthField";
import { AppText } from "@/components/ui/AppText";
import { routes } from "@/navigation/routes";
import { useSession } from "@/state/session";
import { colors, layout, shadows, spacing } from "@/theme/index";

export default function LoginRoute() {
  const { signIn } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(routes.welcome);
  }

  async function submit() {
    if (isSubmitting) return;
    setError("");
    setIsSubmitting(true);
    const ok = await signIn(email, password);
    setIsSubmitting(false);
    if (!ok) {
      setError("Invalid email or password.");
      return;
    }
    router.replace(routes.home);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <AuthBackButton onPress={goBack} />

          <AppText style={styles.title}>Log in</AppText>

          <View style={styles.form}>
            <AuthField
              label="Email Address"
              icon="email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
            />
            <AuthField
              label="Password"
              icon="password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
              textContentType="password"
              rightIcon="eye"
              onRightPress={() => setShowPassword((current) => !current)}
            />
            {error ? <AppText style={styles.error}>{error}</AppText> : null}
          </View>

          <Pressable
            onPress={submit}
            disabled={!email.trim() || !password || isSubmitting}
            style={[styles.signInButton, (!email.trim() || !password || isSubmitting) && styles.disabledButton]}
          >
            <AppText style={styles.signInText}>{isSubmitting ? "Signing in" : "Sign In"}</AppText>
          </Pressable>

          <Pressable onPress={() => router.replace(routes.createAccount)} style={styles.signUpWrap}>
            <AppText style={styles.newUser}>
              I'm a new user. <AppText style={styles.signUpText}>Sign up</AppText>
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
  title: {
    color: colors.black,
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 39,
    marginTop: 78,
  },
  form: {
    gap: 37,
    marginTop: 38,
  },
  error: {
    color: colors.critical,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: -20,
  },
  signInButton: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: 18,
    height: layout.buttonHeight,
    justifyContent: "center",
    marginTop: 40,
    ...shadows.button,
  },
  disabledButton: {
    opacity: 0.55,
  },
  signInText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  signUpWrap: {
    alignItems: "center",
    marginTop: 38,
  },
  newUser: {
    color: colors.fieldLabel,
    fontSize: 14,
    lineHeight: 16,
  },
  signUpText: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 16,
  },
});
