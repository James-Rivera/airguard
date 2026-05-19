import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { TextField } from "@/components/ui/TextField";
import { routes } from "@/navigation/routes";
import { useAirGuard } from "@/state/airguard-store";
import { colors, spacing } from "@/theme/index";

export default function CreateAccountRoute() {
  const { actions, error } = useAirGuard();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function submit() {
    const ok = await actions.signUp(name, email, password);
    if (ok) router.replace(routes.createHome);
  }

  return (
    <AppScreen title="Create Account" subtitle="Use your real email for Supabase auth." onBack={() => router.back()} noBottomPadding>
      <View style={styles.form}>
        <TextField label="Name" value={name} onChangeText={setName} placeholder="Your name" />
        <TextField label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="you@example.com" />
        <TextField label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="At least 6 characters" />
      </View>
      {error ? <AppText style={styles.error}>{error}</AppText> : null}
      <AppButton label="Create Account" onPress={submit} disabled={!name.trim() || !email.trim() || !password.trim()} />
      <AppButton label="I already have an account" onPress={() => router.replace(routes.login)} variant="secondary" />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  error: {
    color: colors.critical,
    fontSize: 12,
    fontWeight: "600",
  },
});
