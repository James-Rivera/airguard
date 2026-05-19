import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SessionProvider } from "@/state/session";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/create-account" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="setup/add-room" />
          <Stack.Screen name="setup/add-device" />
          <Stack.Screen name="activity" />
          <Stack.Screen name="tabs" />
          <Stack.Screen name="rooms/[roomId]" />
          <Stack.Screen name="alerts/[alertId]" />
        </Stack>
      </SessionProvider>
    </SafeAreaProvider>
  );
}
