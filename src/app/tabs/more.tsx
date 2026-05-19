import React from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { MenuItemCard } from "@/components/airguard/MenuItemCard";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";
import { AppScreen } from "@/components/ui/AppScreen";
import { AppText } from "@/components/ui/AppText";
import { menuItems } from "@/domain/seed";
import { initials } from "@/lib/formatters";
import { useAirGuard } from "@/state/airguard-store";
import { useSession } from "@/state/session";
import { colors, radius, spacing } from "@/theme/index";

export default function MoreRoute() {
  const { user, signOut } = useSession();
  const { actions } = useAirGuard();
  const safeUser = user ?? { name: "AirGuard User", role: "homeowner" as const };

  async function logout() {
    await signOut();
    router.replace("/");
  }

  return (
    <AppScreen title="More">
      <AppCard style={styles.userCard}>
        <View>
          <AppText style={styles.role}>{roleLabel(safeUser.role)}</AppText>
          <AppText variant="caption">Prototype mode</AppText>
        </View>
        <View style={styles.avatar}>
          <AppText style={styles.avatarText}>{initials(safeUser.name)}</AppText>
        </View>
      </AppCard>
      <View style={styles.menu}>
        {menuItems.map((item) => (
          <MenuItemCard key={item.label} label={item.label} detail={item.detail} icon={item.icon} onPress={() => navigateMenu(item.label)} />
        ))}
      </View>
      <AppButton label="Trigger Kitchen Smoke Alert" onPress={actions.triggerKitchenSmokeAlert} variant="danger" />
      <AppButton label="Simulate Normal Readings" onPress={actions.simulateNormalReadings} variant="secondary" />
      <AppButton label="Simulate Warning Readings" onPress={actions.simulateWarningReadings} variant="secondary" />
      <AppButton label="Reset Demo Data" onPress={actions.resetDemoData} variant="secondary" />
      <AppButton label="Clear Onboarding" onPress={actions.clearOnboarding} variant="secondary" />
      <AppButton label="Logout" onPress={logout} variant="danger" />
    </AppScreen>
  );
}

function navigateMenu(label: string) {
  if (label === "Rooms") router.push("/tabs/rooms");
  if (label === "Devices") router.push("/tabs/devices");
  if (label === "Activity") router.push("/activity");
}

function roleLabel(role: string) {
  if (role === "administrator") return "Administrator";
  if (role === "homeowner") return "Homeowner";
  return "Member";
}

const styles = StyleSheet.create({
  userCard: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 104,
  },
  role: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 26,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.iconSurface,
    borderRadius: radius.pill,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  avatarText: {
    color: colors.brand,
    fontSize: 13,
    fontWeight: "700",
  },
  menu: {
    gap: spacing.sm,
  },
});
