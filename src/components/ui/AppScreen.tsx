import React from "react";
import { KeyboardAvoidingView, ScrollView, StyleSheet, View, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "./AppText";
import { IconButton } from "./IconButton";
import { colors, fonts, layout, spacing } from "@/theme/index";

export function AppScreen({
  title,
  subtitle,
  onBack,
  children,
  noBottomPadding = false,
  contentStyle,
  headerAction,
}: {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  children: React.ReactNode;
  noBottomPadding?: boolean;
  contentStyle?: ViewStyle;
  headerAction?: React.ReactNode;
}) {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined}>
        <ScrollView
          style={styles.screen}
          contentContainerStyle={[styles.content, noBottomPadding ? styles.noBottom : styles.withTabs, contentStyle]}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {title ? (
            <View style={styles.header}>
              {onBack ? <IconButton label="<" onPress={onBack} /> : null}
              <View style={styles.headerText}>
                <AppText style={styles.title}>{title}</AppText>
                {subtitle ? <AppText variant="caption">{subtitle}</AppText> : null}
              </View>
              {headerAction}
            </View>
          ) : null}
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText style={styles.sectionTitle}>{title}</AppText>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    alignSelf: "center",
    gap: spacing.md,
    maxWidth: layout.maxPhoneWidth,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.xs,
    width: "100%",
  },
  withTabs: {
    paddingBottom: layout.bottomNavPadding,
  },
  noBottom: {
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 48,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 32,
    lineHeight: 40,
  },
  section: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 20,
    lineHeight: 28,
  },
});
