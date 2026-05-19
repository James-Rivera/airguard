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
import { colors, fonts, radius, spacing } from "@/theme/index";

export default function MoreRoute() {
  const { user, signOut } = useSession();
  const { actions } = useAirGuard();
  const safeUser = user ?? { name: "AirGuard User", role: "homeowner" as const };
  const canUseOperations = safeUser.role === "administrator" || safeUser.role === "member";
  const isAdministrator = safeUser.role === "administrator";

  async function logout() {
    await signOut();
    router.replace("/");
  }

  return (
    <AppScreen title="More">
      <AppCard style={styles.userCard}>
        <View>
          <AppText style={styles.role}>{roleLabel(safeUser.role)}</AppText>
          <AppText variant="caption">{accountLabel(safeUser.role)}</AppText>
        </View>
        <View style={styles.avatar}>
          <AppText style={styles.avatarText}>{initials(safeUser.name)}</AppText>
        </View>
      </AppCard>
      <View style={styles.menu}>
        {menuItems.map((item) => (
          <MenuItemCard key={item.label} label={item.label} detail={item.detail} icon={item.icon} onPress={menuAction(item.label)} />
        ))}
      </View>
      <AppButton label="Logout" onPress={logout} variant="danger" style={styles.logoutButton} />
      {canUseOperations ? (
        <AppCard subtleShadow style={styles.toolsCard}>
          <View style={styles.toolsHeader}>
            <AppText style={styles.toolsTitle}>Safety tools</AppText>
            <AppText variant="caption">Operations</AppText>
          </View>
          <AppButton label="Run Kitchen Smoke Alert" onPress={actions.triggerKitchenSmokeAlert} variant="danger" />
          <AppButton label="Set Normal Readings" onPress={actions.simulateNormalReadings} variant="secondary" />
          <AppButton label="Set Warning Readings" onPress={actions.simulateWarningReadings} variant="secondary" />
          {isAdministrator ? <AppButton label="Reset Home Data" onPress={actions.resetDemoData} variant="secondary" /> : null}
          {isAdministrator ? <AppButton label="Reset Setup Progress" onPress={actions.clearOnboarding} variant="secondary" /> : null}
        </AppCard>
      ) : null}
    </AppScreen>
  );
}

function menuAction(label: string) {
  if (label === "Rooms") return () => router.push("/tabs/rooms");
  if (label === "Devices") return () => router.push("/tabs/devices");
  if (label === "Activity") return () => router.push("/activity");
  return undefined;
}

function roleLabel(role: string) {
  if (role === "administrator") return "Administrator";
  if (role === "homeowner") return "Homeowner";
  return "Safety Officer";
}

function accountLabel(role: string) {
  if (role === "administrator") return "Admin access";
  if (role === "homeowner") return "Home monitoring";
  return "Safety operations";
}

const styles = StyleSheet.create({
  userCard: {
    alignItems: "center",
    borderRadius: radius.card,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 104,
    paddingHorizontal: 20,
  },
  role: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 26,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.iconSurface,
    borderRadius: radius.pill,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  avatarText: {
    color: colors.brand,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  menu: {
    gap: spacing.sm,
  },
  logoutButton: {
    borderRadius: 18,
    height: 58,
  },
  toolsCard: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  toolsHeader: {
    gap: 2,
  },
  toolsTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 20,
  },
});
