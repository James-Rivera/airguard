import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { LogoMark } from "@/components/airguard/LogoMark";
import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { TextField } from "@/components/ui/TextField";
import { routes } from "@/navigation/routes";
import { useSession } from "@/state/session";
import { colors, radius, spacing } from "@/theme/index";

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
    router.replace(routes.home);
  }

  return (
    <AppScreen noBottomPadding contentStyle={styles.screen}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <AppText style={styles.backText}>{"<"}</AppText>
      </Pressable>
      <View style={styles.logo}>
        <LogoMark size={42} />
      </View>
      <AppText style={styles.title}>Log in</AppText>
      <View style={styles.form}>
        <TextField label="Email Address" value={email} onChangeText={setEmail} leftLabel="@" keyboardType="email-address" />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          leftLabel="*"
          secureTextEntry={!showPassword}
          rightLabel={showPassword ? "Hide" : "Show"}
          onRightPress={() => setShowPassword((current) => !current)}
        />
        {error ? <AppText style={styles.error}>{error}</AppText> : null}
      </View>
      <AppButton label="Sign In" onPress={submit} />
      <Pressable onPress={() => router.replace(routes.createAccount)}>
        <AppText style={styles.newUser}>New to AirGuard? Create an account</AppText>
      </Pressable>
    </AppScreen>
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
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 22,
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
    gap: spacing.md,
    marginTop: spacing.md,
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
