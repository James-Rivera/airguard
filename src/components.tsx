import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, ScrollView, StyleProp, StyleSheet, Text, TextInput, View, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";
import { backgroundForStatus, colors, gradient, layout, radii, shadows, spacing, toneForStatus, typography } from "./theme";
import type { Account, ActivityItem, Alert, ChecklistItem, Device, MainTab, ReportSummary, Room, SafetyStatus, Session } from "./types";

export function AirGuardLogo({ size = 86, color = "white" }: { size?: number; color?: string }) {
  const width = size * 0.793;
  return (
    <Svg width={width} height={size} viewBox="0 0 99 125">
      <Path
        d="M48.3122 0.0551806C49.4335 -0.0343959 50.6852 -0.079183 51.7026 0.44656C53.8469 1.5544 56.2382 3.53739 58.1967 5.00858L68.6647 12.8541C70.2832 14.0644 72.2021 15.6044 73.837 16.7115C73.804 11.5084 72.7416 9.60175 79.3785 9.91482C81.1319 9.99743 86.5087 9.24923 86.6505 11.7728C86.9231 16.6228 86.5088 21.5995 86.7764 26.4497C90.1801 29.3178 95.2651 32.5308 98.3713 35.5782C99.4035 36.5908 98.9199 44.3706 98.6307 46.11C97.8116 51.0358 94.9035 53.3883 91.203 56.1563C92.0216 49.946 91.9169 45.9511 91.902 39.7035L49.5458 8.00999C40.2694 14.8013 31.0647 21.69 21.9331 28.6746L13.0185 35.4262C11.1001 36.8763 9.18135 38.2386 7.36091 39.8126C7.27815 44.6701 7.39071 49.6383 7.24686 54.452C16.9236 50.841 23.765 50.9069 33.7398 53.4465C36.3985 53.8758 40.429 55.3636 43.0936 56.3323C54.3261 60.4155 66.3052 65.9639 78.5499 65.1841C85.7322 64.7266 94.2719 61.4308 98.9901 55.7884C97.6443 67.8311 86.7998 73.2509 75.691 73.3163C50.5621 73.4646 24.1633 47.3179 0.683455 67.3863C0.189746 63.4119 -0.520195 38.3749 0.58646 36.0894C0.92074 35.399 1.85329 34.6852 2.45304 34.1909C4.69675 32.3414 7.1036 30.6521 9.41286 28.8825L22.8283 18.559C27.7436 14.7807 32.6861 11.0379 37.6555 7.3309C40.1226 5.48064 45.647 0.937301 48.3122 0.0551806Z"
        fill={color}
      />
      <Path
        d="M18.2207 65.9434C27.4934 65.035 37.6696 68.834 45.9546 72.6056C46.9022 73.0369 55.306 76.4448 55.5381 76.6809C53.6841 77.6244 42.5932 74.9535 39.818 74.4325C32.5491 73.0681 25.1873 72.2888 17.8415 73.7861C14.9411 74.3774 12.4384 75.6111 9.87022 77.0457C10.2262 78.0912 10.6159 79.1251 11.0387 80.1456C16.6616 93.5416 25.5031 102.556 37.3838 110.65C41.1665 113.227 45.4855 115.909 49.7122 117.638C49.8381 117.606 49.963 117.57 50.0866 117.53C52.1739 116.861 55.6717 114.764 57.6066 113.619C69.2892 106.707 80.0261 97.2542 86.1237 84.944C86.9617 83.4924 87.8327 81.2914 88.3726 79.7127C88.8323 78.3677 89.2677 76.4799 89.9842 75.2918C93.7177 73.0257 94.3302 72.7039 97.6015 69.9456C97.2936 75.9559 94.1618 84.5666 91.0901 90.1461C82.5673 105.627 67.0878 117.561 51.1282 124.652C48.6932 125.735 44.2228 122.856 41.9997 121.609C22.7977 110.838 7.88174 96.1556 1.98749 74.4352C4.46879 68.846 12.6797 66.571 18.2207 65.9434Z"
        fill={color}
      />
      <Path
        d="M65.1602 81.0138C65.4724 81.3799 65.579 82.1818 65.6465 82.6813C66.4247 88.443 64.9863 95.3025 61.5122 99.9912C59.1642 103.123 55.7738 105.313 51.953 106.164C50.2082 106.539 46.204 106.404 45.0155 107.946C44.1175 109.111 44.8498 110.74 45.0772 111.973L44.8707 112.059C43.4833 111.644 43.1056 108.529 43.3013 107.335C44.1629 102.081 47.2749 97.4955 51.4139 94.2321C52.5532 93.3881 53.8767 92.8224 54.9175 91.8802C48.5807 94.0565 43.5819 98.2733 42.2666 105.112C41.8647 104.503 41.4165 103.692 41.1205 103.017C39.8005 100.065 39.7434 96.7022 40.9624 93.7072C43.9652 86.1184 52.1633 84.5869 59.24 83.0765C61.2226 82.6534 63.3083 81.8237 65.1602 81.0138Z"
        fill="#97E157"
      />
    </Svg>
  );
}

export function Wordmark({ size = 30 }: { size?: number }) {
  return (
    <Text style={[styles.wordmark, { fontSize: size }]}>
      <Text style={{ color: colors.brandCyan }}>Air</Text>
      <Text style={{ color: colors.textPrimary }}>Guard</Text>
    </Text>
  );
}

export function BrandGradient({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={style}>
      {children}
    </LinearGradient>
  );
}

export function Screen({
  children,
  title,
  subtitle,
  onBack,
  headerRight,
  noBottomNav = false,
  contentStyle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  headerRight?: React.ReactNode;
  noBottomNav?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.screenContent, noBottomNav && styles.screenContentNoNav, contentStyle]}
      showsVerticalScrollIndicator={false}
    >
      {title ? <AppHeader title={title} subtitle={subtitle} onBack={onBack} right={headerRight} /> : null}
      {children}
    </ScrollView>
  );
}

export function AppHeader({ title, subtitle, onBack, right }: { title: string; subtitle?: string; onBack?: () => void; right?: React.ReactNode }) {
  return (
    <View style={styles.appHeader}>
      {onBack ? <IconButton label="<" onPress={onBack} /> : null}
      <View style={styles.headerTitleRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.screenTitle}>{title}</Text>
          {subtitle ? <Text style={styles.screenSubtitle}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionHeader({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function PrimaryButton({ label, onPress, danger = false, disabled = false, style }: { label: string; onPress: () => void; danger?: boolean; disabled?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable onPress={disabled ? undefined : onPress} style={[styles.primaryButton, danger && styles.dangerButton, disabled && styles.disabledButton, style]}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, danger = false, style }: { label: string; onPress: () => void; danger?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable onPress={onPress} style={[styles.secondaryButton, danger && styles.secondaryDangerButton, style]}>
      <Text style={[styles.secondaryButtonText, danger && { color: colors.critical }]}>{label}</Text>
    </Pressable>
  );
}

export function IconButton({ label, onPress, style }: { label: string; onPress: () => void; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable onPress={onPress} style={[styles.iconButton, style]} hitSlop={8}>
      <Text style={styles.iconButtonText}>{label}</Text>
    </Pressable>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone = toneForStatus(status);
  return (
    <View style={[styles.badge, { backgroundColor: backgroundForStatus(status) }]}>
      <Text style={[styles.badgeText, { color: tone }]}>{status}</Text>
    </View>
  );
}

export function RiskBadge({ level }: { level: SafetyStatus }) {
  return <StatusBadge status={level} />;
}

export function ReadingCard({ label, value, detail, status = "Good" }: { label: string; value: string | number; detail?: string; status?: string }) {
  return (
    <Card style={styles.readingCard}>
      <Text style={styles.readingLabel}>{label}</Text>
      <Text style={styles.readingValue} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      {detail ? <Text style={[styles.readingDetail, { color: toneForStatus(status) }]}>{detail}</Text> : null}
    </Card>
  );
}

export function RoomCard({ room, onPress, compact = false }: { room: Room; onPress?: () => void; compact?: boolean }) {
  const content = (
    <Card style={[compact ? styles.roomCardCompact : styles.roomCard, room.status === "Critical" && styles.criticalCard]}>
      <View style={styles.cardTopRow}>
        <View style={styles.roomIcon}>
          <Text style={styles.roomIconText}>{roomInitial(room.name)}</Text>
        </View>
        <StatusBadge status={room.status === "Good" ? "Online" : room.status} />
      </View>
      <Text style={styles.cardTitle}>{room.name}</Text>
      <Text style={styles.cardBody} numberOfLines={compact ? 1 : 2}>{room.summary}</Text>
      {!compact ? (
        <View style={styles.miniMetricRow}>
          <MiniMetric label="CO2" value={`${room.co2Ppm}`} />
          <MiniMetric label="Humidity" value={`${room.humidityPercent}%`} />
          <MiniMetric label="Temp" value={`${room.temperatureC} C`} />
        </View>
      ) : null}
    </Card>
  );
  return onPress ? <Pressable onPress={onPress}>{content}</Pressable> : content;
}

export function DeviceCard({ device, onPress }: { device: Device; onPress?: () => void }) {
  const status = device.status === "Online" ? "Good" : device.status;
  return (
    <Pressable onPress={onPress} style={styles.deviceCard}>
      <View style={styles.deviceIcon}>
        <Text style={styles.deviceIconText}>{device.type === "Ventilation" ? "Fan" : "AQ"}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{device.name}</Text>
        <Text style={styles.cardBody}>{device.roomName}</Text>
        <Text style={styles.deviceMeta}>{device.powerStatus} - {device.latestReading}</Text>
        <Text style={styles.deviceMeta}>Signal {device.signalStrength} - Firmware {device.firmwareVersion}</Text>
      </View>
      <StatusBadge status={status} />
    </Pressable>
  );
}

export function AlertCard({ alert, actionLabel, onAction, compact = false }: { alert: Alert; actionLabel?: string; onAction?: () => void; compact?: boolean }) {
  return (
    <Card style={[styles.alertCard, alert.riskLevel === "Critical" && styles.criticalCard]}>
      <View style={styles.cardTopRow}>
        <StatusBadge status={alert.riskLevel} />
        <StatusBadge status={alert.status} />
      </View>
      <Text style={styles.cardTitle}>{alert.title}</Text>
      <Text style={styles.cardBody}>{alert.location}</Text>
      {!compact ? <Text style={styles.cardBody}>{alert.description}</Text> : null}
      <Text style={styles.recommendedText}>Recommended action: {alert.recommendedAction}</Text>
      {actionLabel && onAction ? <PrimaryButton label={actionLabel} onPress={onAction} danger={alert.riskLevel === "Critical"} /> : null}
    </Card>
  );
}

export function HeroStatusCard({ title, subtitle, actionLabel, onAction }: { title: string; subtitle: string; actionLabel: string; onAction: () => void }) {
  return (
    <BrandGradient style={styles.heroStatus}>
      <View style={styles.heroTopRow}>
        <View style={styles.heroLogoMark}>
          <Text style={styles.heroLogoText}>OK</Text>
        </View>
        <View style={styles.heroPill}>
          <View style={styles.heroDot} />
          <Text style={styles.heroPillText}>Good</Text>
        </View>
      </View>
      <Text style={styles.heroTitle}>{title}</Text>
      <Text style={styles.heroSubtitle}>{subtitle}</Text>
      <Pressable onPress={onAction} style={styles.heroButton}>
        <Text style={styles.heroButtonText}>{actionLabel}</Text>
      </Pressable>
    </BrandGradient>
  );
}

export function HeroAlertCard({ alert, primaryLabel, onPrimary, secondaryLabel, onSecondary }: { alert: Alert; primaryLabel: string; onPrimary: () => void; secondaryLabel?: string; onSecondary?: () => void }) {
  return (
    <Card style={[styles.heroAlert, alert.riskLevel === "Critical" && styles.criticalCard]}>
      <View style={styles.heroTopRow}>
        <View style={styles.alertIcon}>
          <Text style={styles.alertIconText}>!</Text>
        </View>
        <StatusBadge status={alert.riskLevel} />
      </View>
      <Text style={styles.alertHeroTitle}>{alert.location} needs attention</Text>
      <Text style={styles.cardBody}>{alert.title}. {alert.recommendedAction}</Text>
      <View style={styles.actionRow}>
        <PrimaryButton label={primaryLabel} onPress={onPrimary} danger={alert.riskLevel === "Critical"} style={{ flex: 1 }} />
        {secondaryLabel && onSecondary ? <SecondaryButton label={secondaryLabel} onPress={onSecondary} danger={alert.riskLevel === "Critical"} style={{ flex: 1 }} /> : null}
      </View>
    </Card>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <Card style={styles.emptyState}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardBody}>{body}</Text>
    </Card>
  );
}

export function BottomNav({ active, activeAlerts, onTab }: { active: MainTab; activeAlerts: number; onTab: (tab: MainTab) => void }) {
  const tabs: MainTab[] = ["Home", "Rooms", "Alerts", "Devices", "More"];
  return (
    <View style={styles.bottomNavWrap} pointerEvents="box-none">
      <View style={styles.bottomNav}>
        {tabs.map((tab) => {
          const selected = active === tab;
          return (
            <Pressable key={tab} onPress={() => onTab(tab)} style={[styles.navItem, selected && styles.navItemActive]}>
              <TabIcon tab={tab} selected={selected} />
              <Text style={[styles.navLabel, selected && styles.navLabelActive]}>{tab}</Text>
              {tab === "Alerts" && activeAlerts > 0 ? (
                <View style={styles.navBadge}>
                  <Text style={styles.navBadgeText}>{activeAlerts}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function AccountCard({ session, homeName }: { session: Session; homeName: string }) {
  return (
    <Card style={styles.accountCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{session.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.roleLabel}>{session.role}</Text>
        <Text style={styles.cardTitle}>{session.name}</Text>
        <Text style={styles.cardBody}>{session.email}</Text>
        <Text style={styles.cardCaption}>{homeName}</Text>
      </View>
    </Card>
  );
}

export function DemoAccountCard({ account, onPress }: { account: Account; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.demoAccountCard}>
      <View style={styles.demoInitials}>
        <Text style={styles.demoInitialsText}>{account.initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{account.role}</Text>
        <Text style={styles.cardBody}>{account.email}</Text>
      </View>
      <Text style={styles.sectionAction}>Use</Text>
    </Pressable>
  );
}

export function ActivityTimelineItem({ item }: { item: ActivityItem }) {
  return (
    <View style={styles.timelineItem}>
      <View style={[styles.timelineDot, { backgroundColor: toneForStatus(item.level) }]} />
      <Card style={styles.timelineCard}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <StatusBadge status={item.level} />
        </View>
        <Text style={styles.cardBody}>{item.description}</Text>
        <Text style={styles.cardCaption}>{item.actorName} - {new Date(item.timestamp).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</Text>
      </Card>
    </View>
  );
}

export function SafetyChecklistItem({ item, onToggle }: { item: ChecklistItem; onToggle: () => void }) {
  return (
    <Pressable onPress={onToggle} style={styles.checklistItem}>
      <View style={[styles.checkCircle, item.checked && { backgroundColor: colors.safe }]}>
        <Text style={styles.checkMark}>{item.checked ? "OK" : ""}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.label}</Text>
        <Text style={styles.cardBody}>{item.group}</Text>
      </View>
    </Pressable>
  );
}

export function ReportSummaryCard({ report }: { report: ReportSummary }) {
  return (
    <Card style={styles.reportCard}>
      <Text style={styles.cardCaption}>Safety readiness</Text>
      <Text style={styles.reportValue}>{report.readiness}%</Text>
      <Text style={styles.cardBody}>Highest risk: {report.highestRisk} - {report.highestRiskLabel}</Text>
      <View style={styles.reportMetricRow}>
        <MiniMetric label="Total" value={report.totalAlerts} />
        <MiniMetric label="Active" value={report.activeAlerts} />
        <MiniMetric label="Resolved" value={report.resolvedAlerts} />
      </View>
    </Card>
  );
}

export function MenuRow({ label, description, onPress, danger = false }: { label: string; description: string; onPress: () => void; danger?: boolean }) {
  return (
    <Pressable onPress={onPress} style={styles.menuRow}>
      <View style={[styles.menuIcon, danger && { backgroundColor: colors.softRed }]}>
        <Text style={[styles.menuIconText, danger && { color: colors.critical }]}>{menuInitial(label)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.cardTitle, danger && { color: colors.critical }]}>{label}</Text>
        <Text style={styles.cardBody}>{description}</Text>
      </View>
      <Text style={styles.chevron}>{">"}</Text>
    </Pressable>
  );
}

export function TextField({
  label,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  right,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "email-address" | "default";
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldRow}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
          placeholderTextColor={colors.textMuted}
          style={styles.textInput}
        />
        {right}
      </View>
    </View>
  );
}

function MiniMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.miniMetric}>
      <Text style={styles.miniMetricLabel}>{label}</Text>
      <Text style={styles.miniMetricValue}>{value}</Text>
    </View>
  );
}

function TabIcon({ tab, selected }: { tab: MainTab; selected: boolean }) {
  const stroke = selected ? colors.textPrimary : "#8CA0BC";
  if (tab === "Home") {
    return (
      <Svg width={21} height={21} viewBox="0 0 24 24">
        <Path d="M4 10.5 12 4l8 6.5V20h-5v-6H9v6H4v-9.5Z" fill="none" stroke={stroke} strokeWidth={1.8} strokeLinejoin="round" />
      </Svg>
    );
  }
  if (tab === "Rooms") {
    return (
      <Svg width={21} height={21} viewBox="0 0 24 24">
        <Path d="M5 5h5v5H5V5Zm9 0h5v5h-5V5ZM5 14h5v5H5v-5Zm9 0h5v5h-5v-5Z" fill="none" stroke={stroke} strokeWidth={1.8} strokeLinejoin="round" />
      </Svg>
    );
  }
  if (tab === "Alerts") {
    return (
      <Svg width={21} height={21} viewBox="0 0 24 24">
        <Path d="M12 4 21 20H3L12 4Z" fill="none" stroke={stroke} strokeWidth={1.8} strokeLinejoin="round" />
        <Path d="M12 9v5M12 17h.01" fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    );
  }
  if (tab === "Devices") {
    return (
      <Svg width={21} height={21} viewBox="0 0 24 24">
        <Path d="M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" fill="none" stroke={stroke} strokeWidth={1.8} />
        <Path d="M10 7h4M10 11h4M12 17h.01" fill="none" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" />
      </Svg>
    );
  }
  return (
    <Svg width={21} height={21} viewBox="0 0 24 24">
      <Path d="M5 12h.01M12 12h.01M19 12h.01" fill="none" stroke={stroke} strokeWidth={3} strokeLinecap="round" />
    </Svg>
  );
}

function roomInitial(name: string) {
  if (name.includes("Bathroom")) return "Ba";
  return name[0] ?? "R";
}

function menuInitial(label: string) {
  if (label === "Safety Checklist") return "OK";
  if (label === "Simulation Tools") return "Sim";
  if (label === "Settings") return "Set";
  return label.slice(0, 2);
}

const styles = StyleSheet.create({
  wordmark: {
    fontWeight: "900",
    letterSpacing: 0,
  },
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  screenContent: {
    gap: spacing.md,
    paddingBottom: layout.screenBottomPadding,
    paddingHorizontal: spacing.page,
    paddingTop: spacing.xl,
  },
  screenContentNoNav: {
    paddingBottom: spacing.xxl,
  },
  appHeader: {
    gap: spacing.md,
  },
  headerTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  screenTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },
  screenSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: layout.cardRadius,
    borderWidth: 1,
    ...shadows.card,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  sectionTitle: {
    ...typography.section,
    color: colors.textPrimary,
  },
  sectionAction: {
    ...typography.caption,
    color: colors.brandBlue,
    fontWeight: "900",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.brandBlue,
    borderRadius: radii.md,
    height: layout.buttonHeight,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  dangerButton: {
    backgroundColor: colors.critical,
  },
  disabledButton: {
    opacity: 0.48,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "900",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    height: layout.buttonHeight,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  secondaryDangerButton: {
    borderColor: "#FECACA",
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "900",
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: layout.iconButton,
    justifyContent: "center",
    width: layout.iconButton,
  },
  iconButtonText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "900",
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: radii.pill,
    minHeight: 28,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "900",
  },
  readingCard: {
    minHeight: 96,
    padding: spacing.md,
    width: "47.8%",
  },
  readingLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  readingValue: {
    ...typography.metric,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  readingDetail: {
    ...typography.caption,
    marginTop: spacing.xxs,
  },
  cardTopRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  cardTitle: {
    ...typography.cardTitle,
    color: colors.textPrimary,
  },
  cardBody: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  cardCaption: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xxs,
  },
  criticalCard: {
    backgroundColor: colors.softRed,
    borderColor: "#FECACA",
  },
  roomCard: {
    gap: spacing.sm,
    padding: spacing.md,
  },
  roomCardCompact: {
    gap: spacing.xs,
    minHeight: 122,
    padding: spacing.md,
    width: "47.8%",
  },
  roomIcon: {
    alignItems: "center",
    backgroundColor: colors.softBlue,
    borderRadius: radii.md,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  roomIconText: {
    color: colors.brandBlue,
    fontSize: 13,
    fontWeight: "900",
  },
  miniMetricRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  miniMetric: {
    backgroundColor: colors.slate50,
    borderRadius: radii.sm,
    flex: 1,
    minHeight: 54,
    padding: spacing.xs,
  },
  miniMetricLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "800",
  },
  miniMetricValue: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 3,
  },
  deviceCard: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 108,
    padding: spacing.md,
    ...shadows.card,
  },
  deviceIcon: {
    alignItems: "center",
    backgroundColor: colors.softBlue,
    borderRadius: radii.lg,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  deviceIconText: {
    color: colors.brandBlue,
    fontSize: 12,
    fontWeight: "900",
  },
  deviceMeta: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
  },
  alertCard: {
    gap: spacing.sm,
    padding: spacing.md,
  },
  recommendedText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
  heroStatus: {
    borderRadius: radii.xxl,
    gap: spacing.md,
    minHeight: 220,
    padding: spacing.lg,
    ...shadows.elevated,
  },
  heroTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroLogoMark: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: radii.md,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  heroLogoText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "900",
  },
  heroPill: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: radii.pill,
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 34,
    paddingHorizontal: spacing.sm,
  },
  heroDot: {
    backgroundColor: colors.leafGreen,
    borderRadius: radii.pill,
    height: 8,
    width: 8,
  },
  heroPillText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "900",
  },
  heroTitle: {
    ...typography.hero,
    color: colors.white,
  },
  heroSubtitle: {
    ...typography.body,
    color: "#EAF7FF",
  },
  heroButton: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: radii.md,
    height: layout.buttonHeight,
    justifyContent: "center",
  },
  heroButtonText: {
    color: colors.brandBlue,
    fontSize: 15,
    fontWeight: "900",
  },
  heroAlert: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  alertIcon: {
    alignItems: "center",
    backgroundColor: colors.critical,
    borderRadius: radii.md,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  alertIconText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "900",
  },
  alertHeroTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  emptyState: {
    padding: spacing.lg,
  },
  bottomNavWrap: {
    bottom: layout.bottomNavBottom,
    left: 0,
    paddingHorizontal: spacing.lg,
    position: "absolute",
    right: 0,
  },
  bottomNav: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.97)",
    borderColor: colors.border,
    borderRadius: radii.xxl,
    borderWidth: 1,
    flexDirection: "row",
    height: layout.bottomNavHeight,
    justifyContent: "space-between",
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    ...shadows.elevated,
  },
  navItem: {
    alignItems: "center",
    borderRadius: radii.lg,
    height: "100%",
    justifyContent: "center",
    position: "relative",
    width: 56,
  },
  navItemActive: {
    backgroundColor: colors.softBlue,
    width: 78,
  },
  navLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 3,
  },
  navLabelActive: {
    color: colors.textPrimary,
  },
  navBadge: {
    alignItems: "center",
    backgroundColor: colors.critical,
    borderRadius: radii.pill,
    minWidth: 17,
    paddingHorizontal: 4,
    position: "absolute",
    right: 8,
    top: 7,
  },
  navBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: "900",
  },
  accountCard: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.lg,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.softBlue,
    borderRadius: radii.pill,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  avatarText: {
    color: colors.brandBlue,
    fontSize: 14,
    fontWeight: "900",
  },
  roleLabel: {
    color: colors.brandBlue,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: spacing.xxs,
    textTransform: "uppercase",
  },
  demoAccountCard: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 70,
    padding: spacing.sm,
  },
  demoInitials: {
    alignItems: "center",
    backgroundColor: colors.softBlue,
    borderRadius: radii.md,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  demoInitialsText: {
    color: colors.brandBlue,
    fontSize: 12,
    fontWeight: "900",
  },
  timelineItem: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  timelineDot: {
    borderRadius: radii.pill,
    height: 12,
    marginTop: spacing.lg,
    width: 12,
  },
  timelineCard: {
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  checklistItem: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 76,
    padding: spacing.md,
  },
  checkCircle: {
    alignItems: "center",
    backgroundColor: colors.slate50,
    borderRadius: radii.pill,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  checkMark: {
    color: colors.white,
    fontSize: 9,
    fontWeight: "900",
  },
  reportCard: {
    gap: spacing.sm,
    padding: spacing.lg,
  },
  reportValue: {
    color: colors.textPrimary,
    fontSize: 42,
    fontWeight: "900",
    lineHeight: 48,
  },
  reportMetricRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  menuRow: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 76,
    padding: spacing.md,
  },
  menuIcon: {
    alignItems: "center",
    backgroundColor: colors.softBlue,
    borderRadius: radii.md,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  menuIconText: {
    color: colors.brandBlue,
    fontSize: 11,
    fontWeight: "900",
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 20,
    fontWeight: "900",
  },
  fieldWrap: {
    gap: spacing.xs,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: "900",
  },
  fieldRow: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: layout.buttonHeight,
    paddingHorizontal: spacing.sm,
  },
  textInput: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 15,
    minHeight: layout.buttonHeight,
  },
});
