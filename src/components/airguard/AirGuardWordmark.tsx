import React from "react";
import { StyleSheet, Text, View, type ViewStyle } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { colors } from "@/theme/index";
import { LogoMark } from "./LogoMark";

type Props = {
  markSize?: number;
  titleSize?: number;
  subtitle?: string;
  light?: boolean;
  style?: ViewStyle;
};

export function AirGuardWordmark({ markSize = 68, titleSize = 36, subtitle, light = false, style }: Props) {
  const lineHeight = Math.round(titleSize * 1.1);
  return (
    <View style={[styles.wrap, style]}>
      <LogoMark size={markSize} />
      <View style={styles.copy}>
        <AppText style={[styles.title, { fontSize: titleSize, lineHeight }]}>
          <Text style={[styles.titlePart, { color: light ? colors.white : colors.textPrimary, fontSize: titleSize, lineHeight }]}>Air</Text>
          <Text style={[styles.titlePart, { color: colors.success, fontSize: titleSize, lineHeight }]}>Guard</Text>
        </AppText>
        {subtitle ? <AppText style={[styles.subtitle, light && styles.subtitleLight]}>{subtitle}</AppText> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
  },
  copy: {
    flexShrink: 1,
  },
  title: {
    fontWeight: "700",
  },
  titlePart: {
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 17,
    fontWeight: "500",
    lineHeight: 22,
  },
  subtitleLight: {
    color: colors.white,
  },
});
