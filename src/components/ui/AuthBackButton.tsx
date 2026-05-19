import React from "react";
import { Pressable, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors, radius } from "@/theme/index";

export function AuthBackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.back} accessibilityRole="button" accessibilityLabel="Go back">
      <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
        <Path d="M13.7 5.5 8.2 11l5.5 5.5" stroke={colors.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  back: {
    alignItems: "center",
    backgroundColor: colors.textSecondary,
    borderRadius: radius.pill,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
});
