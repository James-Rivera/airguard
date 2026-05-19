import React, { useEffect, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, useWindowDimensions, View, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { AppButton } from "@/components/ui/AppButton";
import { AppText } from "@/components/ui/AppText";
import { colors, fonts, radius, spacing } from "@/theme/index";

type Props = {
  step: number;
  totalSteps?: number;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
  primaryLabel: string;
  onPrimaryPress: () => void;
  primaryDisabled?: boolean;
  onBack?: () => void;
  footer?: React.ReactNode;
  hero?: React.ReactNode;
  centered?: boolean;
  pillButton?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  primaryRightIcon?: "arrow-right";
  scrollable?: boolean;
};

export function OnboardingStepLayout({
  step,
  totalSteps = 4,
  title,
  subtitle,
  children,
  primaryLabel,
  onPrimaryPress,
  primaryDisabled = false,
  onBack,
  footer,
  hero,
  centered = false,
  pillButton = false,
  contentStyle,
  primaryRightIcon,
  scrollable = true,
}: Props) {
  const { width } = useWindowDimensions();
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const horizontalPadding = width < 360 ? 18 : 24;
  const shellWidth = Math.min(width, 430);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => setKeyboardOpen(true));
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => setKeyboardOpen(false));
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const content = (
    <>
      {hero}
      <View style={[styles.titleBlock, centered && styles.centeredTitleBlock]}>
        <AppText style={[styles.title, centered && styles.centeredText]}>{title}</AppText>
        <AppText style={[styles.subtitle, centered && styles.centeredText]}>{subtitle}</AppText>
      </View>
      {children}
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={[styles.shell, { width: shellWidth }]} behavior={process.env.EXPO_OS === "ios" ? "padding" : undefined}>
        <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
          {onBack ? <BackButton onPress={onBack} /> : <View style={styles.backSpace} />}
        </View>

        {scrollable ? (
          <ScrollView
            contentContainerStyle={[styles.content, { paddingHorizontal: horizontalPadding }, centered && styles.centeredContent, contentStyle]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {content}
          </ScrollView>
        ) : (
          <View style={[styles.fixedContent, { paddingHorizontal: horizontalPadding }, centered && styles.centeredContent, contentStyle]}>{content}</View>
        )}

        {keyboardOpen ? null : (
          <View style={[styles.footer, { paddingHorizontal: horizontalPadding }]}>
            {footer}
            <StepIndicator step={step} totalSteps={totalSteps} />
            <AppButton label={primaryLabel} onPress={onPrimaryPress} disabled={primaryDisabled} pill={pillButton} rightIcon={primaryRightIcon} style={styles.primaryButton} />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back">
      <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
        <Path d="M20 8 12 16l8 8" stroke={colors.textPrimary} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </Pressable>
  );
}

function StepIndicator({ step, totalSteps }: { step: number; totalSteps: number }) {
  return (
    <View style={styles.dots} accessibilityLabel={`Step ${step} of ${totalSteps}`}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const active = index + 1 === step;
        return <View key={index} style={[styles.dot, active && styles.dotActive]} />;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#FAF8FF",
    flex: 1,
  },
  shell: {
    alignSelf: "center",
    flex: 1,
    maxWidth: 430,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    height: 58,
    paddingHorizontal: 24,
  },
  backSpace: {
    height: 56,
    width: 56,
  },
  backButton: {
    alignItems: "center",
    borderRadius: radius.pill,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  content: {
    flexGrow: 1,
    gap: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.xxl,
  },
  fixedContent: {
    flex: 1,
    gap: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.xxl,
  },
  centeredContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
  },
  titleBlock: {
    gap: spacing.xs,
  },
  centeredTitleBlock: {
    alignItems: "center",
    maxWidth: 342,
  },
  title: {
    color: "#131B2E",
    fontFamily: fonts.bold,
    fontSize: 32,
    lineHeight: 40,
    textAlign: "left",
  },
  subtitle: {
    color: "#434655",
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "left",
  },
  centeredText: {
    textAlign: "center",
  },
  footer: {
    backgroundColor: "#FAF8FF",
    gap: spacing.xxl,
    paddingBottom: 32,
    paddingTop: spacing.md,
  },
  dots: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  dot: {
    backgroundColor: "#38485D",
    borderRadius: radius.pill,
    height: 8,
    opacity: 0.3,
    width: 8,
  },
  dotActive: {
    backgroundColor: colors.brand,
    opacity: 1,
    width: 24,
  },
  primaryButton: {
    height: 56,
  },
});
