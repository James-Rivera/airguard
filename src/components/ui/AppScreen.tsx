import React from "react";
import { ScrollView, StyleSheet, View, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "./AppText";
import { IconButton } from "./IconButton";
import { colors, layout, spacing } from "@/theme/index";

export function AppScreen({
  title,
  subtitle,
  onBack,
  children,
  noBottomPadding = false,
  contentStyle,
}: {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  children: React.ReactNode;
  noBottomPadding?: boolean;
  contentStyle?: ViewStyle;
}) {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, noBottomPadding ? styles.noBottom : styles.withTabs, contentStyle]}
        showsVerticalScrollIndicator={false}
      >
        {title ? (
          <View style={styles.header}>
            {onBack ? <IconButton label="<" onPress={onBack} /> : null}
            <View style={styles.headerText}>
              <AppText variant="title">{title}</AppText>
              {subtitle ? <AppText variant="caption">{subtitle}</AppText> : null}
            </View>
          </View>
        ) : null}
        {children}
      </ScrollView>
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
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: spacing.md,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.xs,
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
    minHeight: 36,
  },
  headerText: {
    flex: 1,
  },
  section: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  },
});
