import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { router } from "expo-router";
import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { LogoMark } from "@/components/airguard/LogoMark";
import { useSession } from "@/state/session";
import { colors, layout, radius, spacing } from "@/theme/index";

export default function LoginRoute() {
  const { signIn } = useSession();
  const [email, setEmail] = useState("admin@airguard.demo");
  const [password, setPassword] = useState("airguard123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    const ok = await signIn(email, password);
    if (!ok) {
      setError("Use a local demo account to sign in.");
      return;
    }
    router.replace("/tabs/home");
  }

  return (
    <AppScreen noBottomPadding contentStyle={styles.screen}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <AppText style={styles.backText}>‹</AppText>
      </Pressable>
      <View style={styles.logo}>
        <LogoMark size={42} />
      </View>
      <AppText style={styles.title}>Log in</AppText>
      <View style={styles.form}>
        <Field label="Email Address" value={email} onChangeText={setEmail} icon="@" keyboardType="email-address" />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          icon="●"
          secureTextEntry={!showPassword}
          rightLabel={showPassword ? "Hide" : "Show"}
          onRightPress={() => setShowPassword((current) => !current)}
        />
        {error ? <AppText style={styles.error}>{error}</AppText> : null}
      </View>
      <AppButton label="Sign In" onPress={submit} />
      <AppText style={styles.newUser}>I'm a new user. Sign In</AppText>
    </AppScreen>
  );
}

function Field({
  label,
  icon,
  rightLabel,
  onRightPress,
  ...props
}: React.ComponentProps<typeof TextInput> & { label: string; icon: string; rightLabel?: string; onRightPress?: () => void }) {
  return (
    <View style={styles.field}>
      <AppText style={styles.fieldLabel}>{label}</AppText>
      <View style={styles.inputRow}>
        <AppText style={styles.inputIcon}>{icon}</AppText>
        <TextInput {...props} placeholderTextColor={colors.textMuted} autoCapitalize="none" style={styles.input} />
        {rightLabel ? (
          <Pressable onPress={onRightPress} hitSlop={8}>
            <AppText style={styles.rightText}>{rightLabel}</AppText>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: 19,
  },
  back: {
    alignItems: "center",
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  backText: {
    color: colors.textPrimary,
    fontSize: 26,
    lineHeight: 28,
  },
  logo: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.brand,
    borderRadius: radius.md,
    height: 58,
    justifyContent: "center",
    marginTop: spacing.xl,
    width: 58,
  },
  title: {
    color: colors.black,
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 39,
    marginTop: spacing.xxl,
  },
  form: {
    gap: spacing.xxl,
    marginTop: spacing.xs,
  },
  field: {
    gap: spacing.sm,
  },
  fieldLabel: {
    color: colors.fieldLabel,
    fontSize: 14,
    lineHeight: 16,
  },
  inputRow: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    height: 32,
    maxWidth: layout.maxPhoneWidth - 50,
  },
  inputIcon: {
    color: colors.textMuted,
    fontSize: 16,
    width: 22,
  },
  input: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 14,
    height: 32,
  },
  rightText: {
    color: colors.brand,
    fontSize: 12,
    fontWeight: "600",
  },
  error: {
    color: colors.critical,
    fontSize: 12,
    fontWeight: "600",
  },
  newUser: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: spacing.lg,
    textAlign: "center",
  },
});
