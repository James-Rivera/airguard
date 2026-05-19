import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors, statusColor } from "./theme";
import type { MainTab, SafetyStatus } from "./types";

export function AirGuardLogo({ size = 86 }: { size?: number }) {
  const width = size * 0.793;
  return (
    <Svg width={width} height={size} viewBox="0 0 99 124.891">
      <Path d="M48.3122 0.0551806C49.4335 -0.0343959 50.6852 -0.079183 51.7026 0.44656C53.8469 1.5544 56.2382 3.53739 58.1967 5.00858L68.6647 12.8541C70.2832 14.0644 72.2021 15.6044 73.837 16.7115C73.804 11.5084 72.7416 9.60175 79.3785 9.91482C81.1319 9.99743 86.5087 9.24923 86.6505 11.7728C86.9231 16.6228 86.5088 21.5995 86.7764 26.4497C90.1801 29.3178 95.2651 32.5308 98.3713 35.5782C99.4035 36.5908 98.9199 44.3706 98.6307 46.1099C97.8116 51.0358 94.9035 53.3883 91.203 56.1563C92.0216 49.946 91.9169 45.9511 91.902 39.7035L49.5458 8.00999C40.2694 14.8013 31.0647 21.69 21.9331 28.6746L13.0185 35.4262C11.1001 36.8763 9.18135 38.2386 7.36091 39.8126C7.27815 44.6701 7.39071 49.6383 7.24686 54.452C16.9236 50.841 23.765 50.9069 33.7398 53.4465C36.3985 53.8758 40.429 55.3636 43.0936 56.3323C54.3261 60.4155 66.3052 65.9639 78.5499 65.1841C85.7322 64.7266 94.2719 61.4308 98.9901 55.7884C97.6443 67.8311 86.7998 73.2509 75.691 73.3163C50.5621 73.4646 24.1633 47.3179 0.683455 67.3863C0.189746 63.4119 -0.520195 38.3749 0.58646 36.0894C0.92074 35.399 1.85329 34.6852 2.45304 34.1909C4.69675 32.3414 7.1036 30.6521 9.41286 28.8825L22.8283 18.559C27.7436 14.7807 32.6861 11.0379 37.6555 7.3309C40.1226 5.48064 45.647 0.937301 48.3122 0.0551806Z" fill="#FEFEFE" />
      <Path d="M18.2207 65.9434C27.4933 65.035 37.6696 68.834 45.9546 72.6056C46.9022 73.0369 55.306 76.4448 55.5381 76.6809C53.6841 77.6244 42.5932 74.9536 39.818 74.4326C32.5491 73.0681 25.1873 72.2888 17.8415 73.7861C14.9411 74.3774 12.4384 75.6111 9.87022 77.0457C10.2261 78.0912 10.6159 79.1251 11.0387 80.1456C16.6616 93.5416 25.5031 102.556 37.3838 110.65C41.1665 113.227 45.4855 115.909 49.7122 117.638C49.8381 117.606 49.963 117.57 50.0866 117.53C52.1739 116.861 55.6717 114.764 57.6066 113.619C69.2892 106.707 80.0261 97.2542 86.1237 84.944C86.9617 83.4924 87.8327 81.2914 88.3726 79.7127C88.8323 78.3677 89.2677 76.4799 89.9842 75.2918C93.7177 73.0257 94.3302 72.7039 97.6015 69.9456C97.2936 75.9559 94.1618 84.5666 91.0901 90.1461C82.5673 105.627 67.0878 117.561 51.1282 124.652C48.6932 125.735 44.2228 122.856 41.9997 121.609C22.7977 110.838 7.88174 96.1556 1.98749 74.4352C4.46878 68.846 12.6797 66.571 18.2207 65.9434Z" fill="#FEFEFE" />
      <Path d="M65.1603 81.0138C65.4724 81.3799 65.5791 82.1818 65.6465 82.6813C66.4247 88.443 64.9863 95.3025 61.5122 99.9912C59.1643 103.123 55.7739 105.313 51.9531 106.164C50.2083 106.539 46.204 106.404 45.0155 107.946C44.1175 109.111 44.8498 110.74 45.0772 111.973L44.8707 112.059C43.4833 111.644 43.1056 108.529 43.3014 107.335C44.1629 102.081 47.2749 97.4955 51.414 94.2321C52.5533 93.3881 53.8767 92.8224 54.9175 91.8803C48.5808 94.0565 43.582 98.2733 42.2667 105.112C41.8647 104.503 41.4166 103.692 41.1205 103.017C39.8005 100.065 39.7434 96.7023 40.9625 93.7072C43.9652 86.1184 52.1634 84.5869 59.2401 83.0765C61.2226 82.6534 63.3084 81.8237 65.1603 81.0138Z" fill="#97E157" />
    </Svg>
  );
}

export function Wordmark() {
  return (
    <Text style={styles.wordmark}>
      <Text style={{ color: colors.brandCyan }}>Air</Text>
      <Text style={{ color: colors.textPrimary }}>Guard</Text>
    </Text>
  );
}

export function BrandGradient({ children, style }: { children: React.ReactNode; style?: object }) {
  return (
    <LinearGradient colors={[colors.brandBlue, colors.brandCyan, colors.brandTeal]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={style}>
      {children}
    </LinearGradient>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function StatusBadge({ status }: { status: SafetyStatus | string }) {
  const tone = status in statusColor ? statusColor[status as SafetyStatus] : colors.safe;
  return (
    <View style={[styles.badge, { backgroundColor: `${tone}18` }]}>
      <Text style={[styles.badgeText, { color: tone }]}>{status}</Text>
    </View>
  );
}

export function PrimaryButton({ label, onPress, danger = false }: { label: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.primaryButton, { backgroundColor: danger ? colors.critical : colors.brandBlue }]}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.secondaryButton}>
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function MetricTile({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <Card style={styles.metricTile}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      {detail ? <Text style={styles.metricDetail}>{detail}</Text> : null}
    </Card>
  );
}

export function BottomTabs({ active, activeAlerts, onTab }: { active: MainTab; activeAlerts: number; onTab: (tab: MainTab) => void }) {
  const tabs: MainTab[] = ["Home", "Rooms", "Alerts", "Devices", "More"];
  return (
    <View style={styles.tabWrap} pointerEvents="box-none">
      <View style={styles.tabShell}>
        {tabs.map((tab) => {
          const selected = active === tab;
          return (
            <Pressable key={tab} onPress={() => onTab(tab)} style={[styles.tabItem, selected ? styles.tabItemActive : styles.tabItemIdle]}>
              <Text style={[styles.tabIcon, { color: selected ? colors.textPrimary : colors.textMuted }]}>{tabIcon(tab)}</Text>
              <Text style={[styles.tabLabel, { color: selected ? colors.textPrimary : colors.textMuted }]}>{tab}</Text>
              {tab === "Alerts" && activeAlerts > 0 ? (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>{activeAlerts}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function tabIcon(tab: MainTab) {
  if (tab === "Home") return "⌂";
  if (tab === "Rooms") return "▫";
  if (tab === "Alerts") return "△";
  if (tab === "Devices") return "▣";
  return "…";
}

const styles = StyleSheet.create({
  wordmark: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 0,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: "#0F1729",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    minHeight: 28,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    backgroundColor: "white",
    borderColor: colors.border,
    borderWidth: 1,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 12,
  },
  metricTile: {
    minHeight: 92,
    paddingHorizontal: 14,
    paddingVertical: 12,
    width: "47%",
  },
  metricLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
  metricValue: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: "800",
    marginTop: 4,
  },
  metricDetail: {
    color: colors.safe,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  tabWrap: {
    bottom: 12,
    left: 0,
    paddingHorizontal: 20,
    position: "absolute",
    right: 0,
  },
  tabShell: {
    alignItems: "center",
    backgroundColor: "#E4E4E4",
    borderColor: "rgba(255,255,255,0.78)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    height: 72,
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 6,
    shadowColor: "#0F1729",
    shadowOpacity: 0.12,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 14 },
    elevation: 8,
  },
  tabItem: {
    alignItems: "center",
    borderRadius: 999,
    height: "100%",
    justifyContent: "center",
    position: "relative",
  },
  tabItemActive: {
    backgroundColor: "#EEF2F6",
    width: 82,
  },
  tabItemIdle: {
    width: 58,
  },
  tabIcon: {
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 22,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  tabBadge: {
    alignItems: "center",
    backgroundColor: colors.critical,
    borderRadius: 99,
    minWidth: 16,
    paddingHorizontal: 4,
    position: "absolute",
    right: 10,
    top: 8,
  },
  tabBadgeText: {
    color: "white",
    fontSize: 9,
    fontWeight: "800",
  },
});
