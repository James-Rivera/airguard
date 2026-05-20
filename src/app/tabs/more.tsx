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
import { routes } from "@/navigation/routes";
import { useSession } from "@/state/session";
import { colors, fonts, radius, spacing } from "@/theme/index";

export default function MoreRoute() {
  const { user, session, signOut } = useSession();
  const safeUser = user ?? { name: "AirGuard User", role: "homeowner" as const };
  const canUseOperations = process.env.EXPO_OS === "web" && Boolean(user || session?.isDemo);

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
        {canUseOperations ? (
          <MenuItemCard
            label="AirGuard Sensor Console"
            detail="Apply controlled sensor events"
            icon="sensor"
            onPress={() => router.push(routes.simulator)}
          />
        ) : null}
      </View>
      <AppButton label="Logout" onPress={logout} variant="danger" style={styles.logoutButton} />
    </AppScreen>
  );
}

function menuAction(label: string) {
  if (label === "Home Settings") return () => router.push(routes.homeSettings);
  if (label === "Rooms") return () => router.push("/tabs/rooms");
  if (label === "Devices") return () => router.push("/tabs/devices");
  if (label === "Risks") return () => router.push(routes.risks);
  if (label === "Reports") return () => router.push(routes.reports);
  if (label === "Activity") return () => router.push("/activity");
  if (label === "Safety Checklist") return () => router.push(routes.safetyChecklist);
  return undefined;
}

function roleLabel(role: string) {
  if (role === "administrator") return "Administrator";
  if (role === "homeowner") return "Homeowner";
  return "Household Member";
}

function accountLabel(role: string) {
  if (role === "administrator") return "Admin access";
  if (role === "homeowner") return "Home monitoring";
  return "Shared home monitoring";
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
});
