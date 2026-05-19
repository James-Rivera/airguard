import React from "react";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SessionProvider } from "@/state/session";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Poppins-Regular": require("../../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../../assets/fonts/Poppins-Bold.ttf"),
  });

  if (!fontsLoaded) return null;

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
