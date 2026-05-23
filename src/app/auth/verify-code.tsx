import React, { useEffect, useRef, useState } from "react";
import { InteractionManager, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { AuthBackButton } from "@/components/ui/AuthBackButton";
import { AppText } from "@/components/ui/AppText";
import { routes } from "@/navigation/routes";
import { useAirGuard } from "@/state/airguard-store";
import { colors, fonts, layout, shadows, spacing } from "@/theme/index";

export default function VerifyCodeRoute() {
  const { email = "", name = "" } = useLocalSearchParams<{ email?: string; name?: string }>();
  const { actions, error: storeError } = useAirGuard();
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const inputRef = useRef<TextInput>(null);
  const keyboardOpen = keyboardHeight > 0;
  const safeEmail = Array.isArray(email) ? email[0] : email;
  const safeName = Array.isArray(name) ? name[0] : name;

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (event) => setKeyboardHeight(event.endCoordinates.height));
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setKeyboardHeight(0));
    const focusTask = InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => inputRef.current?.focus());
    });
    return () => {
      showSub.remove();
      hideSub.remove();
      focusTask.cancel();
    };
  }, []);

  function updateCode(value: string) {
    setMessage("");
    setCode(value.replace(/\D/g, "").slice(0, 6));
  }

  async function submit() {
    if (isSubmitting || code.length !== 6 || !safeEmail) return;
    setMessage("");
    setIsSubmitting(true);
    const ok = await actions.verifySignUpCode(safeName, safeEmail, code);
    setIsSubmitting(false);
    if (ok) {
      router.replace(routes.createHome);
      return;
    }
    setMessage(storeError ?? "Enter the latest verification code from your email.");
  }

  async function resend() {
    if (!safeEmail || isSubmitting) return;
    setMessage("");
    const ok = await actions.resendSignUpCode(safeEmail);
    setMessage(ok ? "A new code was sent to your email." : "We couldn't send a new code yet. Try again shortly.");
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          contentContainerStyle={[styles.screen, keyboardOpen && styles.screenKeyboard, keyboardOpen ? { paddingBottom: keyboardHeight + spacing.xl } : null]}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AuthBackButton onPress={() => router.replace(routes.createAccount)} />

          <View style={[styles.header, keyboardOpen && styles.headerKeyboard]}>
            <AppText style={styles.title}>Check your email</AppText>
            <AppText style={styles.subtitle}>Enter the 6-digit code sent to {safeEmail || "your email"} to finish creating your account.</AppText>
          </View>

          <Pressable onPress={() => inputRef.current?.focus()} style={styles.codeRow} accessibilityRole="button">
            {Array.from({ length: 6 }).map((_, index) => (
              <View key={index} style={[styles.codeBox, code[index] && styles.codeBoxFilled]}>
                <AppText style={styles.codeText}>{code[index] ?? ""}</AppText>
              </View>
            ))}
          </Pressable>

          <TextInput
            ref={inputRef}
            autoFocus
            value={code}
            onChangeText={updateCode}
            caretHidden
            contextMenuHidden
            inputMode="numeric"
            keyboardType="number-pad"
            maxLength={6}
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            style={styles.hiddenInput}
          />

          {message ? <AppText style={[styles.message, message.includes("sent") && styles.success]}>{message}</AppText> : null}

          <Pressable onPress={submit} disabled={code.length !== 6 || isSubmitting} style={[styles.primaryButton, (code.length !== 6 || isSubmitting) && styles.disabledButton]}>
            <AppText style={styles.primaryText}>{isSubmitting ? "Verifying" : "Verify Code"}</AppText>
          </Pressable>

          <Pressable onPress={resend} style={styles.resendWrap}>
            <AppText style={styles.resendText}>
              Didn't get it? <AppText style={styles.resendLink}>Send a new code</AppText>
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
    marginTop: 78,
  },
  headerKeyboard: {
    marginTop: 34,
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
  codeRow: {
    flexDirection: "row",
    gap: spacing.xs,
    justifyContent: "space-between",
    position: "relative",
    marginTop: 42,
  },
  codeBox: {
    alignItems: "center",
    borderColor: colors.borderStrong,
    borderRadius: 14,
    borderWidth: 1.5,
    height: 48,
    justifyContent: "center",
    width: 42,
  },
  codeBoxFilled: {
    borderColor: colors.brand,
    backgroundColor: colors.iconSurface,
  },
  codeText: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 26,
  },
  hiddenInput: {
    height: 48,
    left: 0,
    opacity: 0.02,
    position: "absolute",
    top: 0,
    width: "100%",
    zIndex: 1,
  },
  message: {
    color: colors.critical,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 17,
    marginTop: spacing.md,
  },
  success: {
    color: colors.success,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: 18,
    height: layout.buttonHeight,
    justifyContent: "center",
    marginTop: 36,
    ...shadows.button,
  },
  disabledButton: {
    opacity: 0.55,
  },
  primaryText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  resendWrap: {
    alignItems: "center",
    marginTop: 28,
  },
  resendText: {
    color: colors.fieldLabel,
    fontSize: 14,
    lineHeight: 18,
  },
  resendLink: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
  },
});
