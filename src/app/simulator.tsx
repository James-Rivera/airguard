import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "@/components/ui/AppButton";
import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ActivityLog, Alert, Device, Reading, Room, SafetyStatus } from "@/domain/models";
import { demoScenarios, getDemoScenarioMeta, type DemoScenarioMeta, type DemoScenarioType } from "@/domain/scenarios";
import { getDeviceTypeLabel, getHomeSafetyStatus, getRoomSafetyStatus } from "@/domain/selectors";
import { formatAlertTime, formatReadingValue, formatRelativeMinutes } from "@/lib/formatters";
import { useAirGuard } from "@/state/airguard-store";
import { useSession } from "@/state/session";
import { colors, fonts, radius, shadows, spacing, statusColors, statusSurfaces } from "@/theme/index";

type Notice = { kind: "success" | "error"; text: string } | null;

const actionLabels: Record<DemoScenarioType, string> = {
  "normal-reading": "Normalize Readings",
  "high-co2": "Apply High CO2 Condition",
  "smoke-detected": "Trigger Smoke Event",
  "sensor-offline": "Mark Sensor Offline",
  "humidity-temperature-warning": "Apply Event",
  "reset-to-normal": "Normalize Readings",
};

export default function SensorSimulatorRoute() {
  const { user, session, isLoading, signIn, signOut } = useSession();
  const { state, actions, error } = useAirGuard();
  const [selected, setSelected] = useState<DemoScenarioType>("normal-reading");
  const [runningType, setRunningType] = useState<DemoScenarioType | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessError, setAccessError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  const selectedMeta = getDemoScenarioMeta(selected);
  const activeAlerts = useMemo(() => state.alerts.filter((alert) => alert.status !== "resolved"), [state.alerts]);
  const onlineDevices = useMemo(() => state.devices.filter((device) => device.status === "online"), [state.devices]);
  const recentEvents = useMemo(() => buildRecentEvents(state.activityLogs, state.rooms, state.alerts), [state.activityLogs, state.rooms, state.alerts]);
  const activeConditions = useMemo(() => buildActiveConditions(state.rooms, state.devices, activeAlerts), [activeAlerts, state.devices, state.rooms]);
  const displayTarget = useMemo(() => getDisplayTarget(state.rooms, state.devices, selected), [selected, state.devices, state.rooms]);
  const latestReading = state.readings[0];
  const lastEventTime = state.activityLogs[0]?.createdAt ? formatAlertTime(state.activityLogs[0].createdAt) : "No events yet";
  const canOpenConsole = Boolean(user && state.home);

  async function runEvent(type: DemoScenarioType) {
    if (runningType) return;
    const meta = getDemoScenarioMeta(type);
    setSelected(type);
    setNotice(null);
    setRunningType(type);
    try {
      await actions.runDemoScenario(type);
      setNotice({ kind: "success", text: `${meta.title} applied. Readings, alerts, devices, rooms, and activity are refreshing from AirGuard data.` });
    } catch (err) {
      setNotice({ kind: "error", text: err instanceof Error ? err.message : "The event could not be applied." });
    } finally {
      setRunningType(null);
    }
  }

  async function submitAccess() {
    if (isSigningIn || !email.trim() || !password) return;
    setAccessError("");
    setIsSigningIn(true);
    const ok = await signIn(email, password);
    setIsSigningIn(false);
    if (!ok) setAccessError("Unable to open the console with those credentials.");
  }

  async function logout() {
    await signOut();
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBar}>
          <View style={styles.brandBlock}>
            <View style={styles.logoMark}>
              <AppIcon name="shield" size={24} color={colors.brand} secondaryColor={colors.accent} />
            </View>
            <View style={styles.brandCopy}>
              <AppText style={styles.brandName}>AirGuard</AppText>
              <AppText style={styles.headerMeta}>AIRGUARD OPERATIONS</AppText>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.operationBadge}>
              <View style={styles.liveDot} />
              <AppText style={styles.operationBadgeText}>Operations</AppText>
            </View>
            {user ? (
              <View style={styles.accountCluster}>
                <AppText style={styles.accountName}>{user.name}</AppText>
                <AppText style={styles.accountDetail}>{state.home?.name ?? user.email}</AppText>
              </View>
            ) : null}
            {user ? (
              <Pressable onPress={logout} style={styles.logoutAction} accessibilityRole="button">
                <AppIcon name="logout" size={18} color={colors.textSecondary} secondaryColor={colors.brand} />
              </Pressable>
            ) : null}
          </View>
        </View>

        <View style={styles.pageIntro}>
          <View style={styles.pageIntroCopy}>
            <AppText style={styles.eyebrow}>AIRGUARD OPERATIONS</AppText>
            <AppText style={styles.title}>AirGuard Sensor Console</AppText>
            <AppText style={styles.subtitle}>Monitor sensor conditions and apply controlled sensor events across your home.</AppText>
          </View>
          {state.home ? (
            <View style={styles.homePill}>
              <AppIcon name="home" size={18} color={colors.brand} secondaryColor={colors.accent} />
              <AppText style={styles.homePillText}>{state.home.name}</AppText>
            </View>
          ) : null}
        </View>

        {!user ? (
          <AccessPanel
            email={email}
            password={password}
            isLoading={isLoading || isSigningIn}
            error={accessError}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={submitAccess}
          />
        ) : !canOpenConsole ? (
          <EmptyState title="Console unavailable" message="Your account does not have access to sensor controls for this home." />
        ) : (
          <>
            {notice ? <NoticeBanner notice={notice} /> : null}
            {error && !notice ? <NoticeBanner notice={{ kind: "error", text: error }} /> : null}

            <View style={styles.sectionHeader}>
              <AppText style={styles.sectionTitle}>System Overview</AppText>
              <StatusBadge status={getHomeSafetyStatus(state)} />
            </View>
            <View style={styles.metricsGrid}>
              <MetricCard label="Active home" value={state.home?.name ?? "No home"} detail={state.home?.address ?? "Primary monitored home"} icon="home" />
              <MetricCard label="Rooms monitored" value={String(state.rooms.length)} detail={`${activeConditions.rooms} need attention`} icon="rooms" />
              <MetricCard label="Devices online" value={`${onlineDevices.length}/${state.devices.length}`} detail={`${state.devices.length - onlineDevices.length} offline`} icon="device" />
              <MetricCard label="Active alerts" value={String(activeAlerts.length)} detail={`${activeAlerts.filter((alert) => alert.severity === "critical").length} critical`} icon="alert" tone={activeAlerts.length > 0 ? "warning" : "good"} />
              <MetricCard label="Last event time" value={lastEventTime} detail={latestReading ? `Latest reading ${formatAlertTime(latestReading.createdAt)}` : "Awaiting readings"} icon="note" />
            </View>

            <View style={styles.mainGrid}>
              <View style={styles.mainColumn}>
                <View style={styles.sectionHeader}>
                  <View>
                    <AppText style={styles.sectionTitle}>Sensor Controls</AppText>
                    <AppText style={styles.sectionCaption}>Apply condition profiles through the shared AirGuard event flow.</AppText>
                  </View>
                  <StatusBadge status={selectedMeta.severity === "good" ? "good" : selectedMeta.severity === "offline" ? "offline" : selectedMeta.severity} />
                </View>
                <View style={styles.eventGrid}>
                  {demoScenarios.map((scenario) => (
                    <EventCard
                      key={scenario.type}
                      scenario={scenario}
                      targetRoom={displayTarget.room}
                      targetDevice={displayTarget.device}
                      selected={selected === scenario.type}
                      isRunning={runningType === scenario.type}
                      disabled={Boolean(runningType)}
                      onSelect={() => setSelected(scenario.type)}
                      onApply={() => runEvent(scenario.type)}
                    />
                  ))}
                </View>

                <View style={styles.splitSection}>
                  <Panel title="Recent Sensor Events" style={styles.recentPanel}>
                    {recentEvents.length === 0 ? (
                      <AppText variant="caption">Sensor events will appear here after activity is recorded.</AppText>
                    ) : (
                      recentEvents.map((item) => <RecentEventRow key={item.id} item={item} />)
                    )}
                  </Panel>

                  <Panel title="Active Conditions" style={styles.conditionsPanel}>
                    {activeConditions.items.length === 0 ? (
                      <View style={styles.clearState}>
                        <AppIcon name="check" size={24} color={colors.success} secondaryColor={colors.success} />
                        <View style={styles.clearStateCopy}>
                          <AppText style={styles.clearStateTitle}>No active conditions</AppText>
                          <AppText variant="caption">Rooms and connected devices are reporting normal status.</AppText>
                        </View>
                      </View>
                    ) : (
                      activeConditions.items.map((item) => <ConditionRow key={item.id} item={item} />)
                    )}
                  </Panel>
                </View>
              </View>

              <View style={styles.sideColumn}>
                <Panel title="Reading Preview">
                  <View style={styles.previewHeader}>
                    <View style={styles.previewIcon}>
                      <AppIcon name={scenarioIcon(selectedMeta.type)} size={22} color={colors.brand} secondaryColor={colors.accent} />
                    </View>
                    <View style={styles.previewTitleBlock}>
                      <AppText style={styles.previewTitle}>{selectedMeta.title}</AppText>
                      <AppText variant="caption">Condition profile</AppText>
                    </View>
                    <StatusBadge status={selectedMeta.severity === "good" ? "good" : selectedMeta.severity === "offline" ? "offline" : selectedMeta.severity} />
                  </View>
                  <View style={styles.previewList}>
                    {selectedMeta.preview.map((item) => (
                      <View key={`${item.type}-${item.label}`} style={styles.previewRow}>
                        <AppText style={styles.previewLabel}>{item.label}</AppText>
                        <AppText style={styles.previewValue}>{formatReadingValue(item.value, item.unit)}</AppText>
                        <AppText style={styles.previewStatus}>{item.statusLabel}</AppText>
                      </View>
                    ))}
                  </View>
                </Panel>

                <Panel title="Current Target">
                  <ContextRow label="Home" value={state.home?.name ?? "No home"} icon="home" />
                  <ContextRow label="Room" value={displayTarget.room?.name ?? "Add a room"} icon={displayTarget.room?.icon ?? "rooms"} status={displayTarget.room ? getRoomSafetyStatus(state, displayTarget.room.id) : undefined} />
                  <ContextRow label="Device" value={displayTarget.device?.name ?? "Add a device"} icon="sensor" status={displayTarget.device?.status === "offline" ? "offline" : "online"} />
                  <ContextRow label="Latest status" value={latestReading ? `${latestReading.label} ${formatReadingValue(latestReading.value, latestReading.unit)}` : "Awaiting readings"} icon="air" status={latestReading?.status} />
                </Panel>

                <Panel title="Connected Devices">
                  {state.devices.length === 0 ? (
                    <AppText variant="caption">Connected devices appear after setup.</AppText>
                  ) : (
                    state.devices.slice(0, 6).map((device) => <DeviceRow key={device.id} device={device} room={state.rooms.find((item) => item.id === device.roomId)} />)
                  )}
                </Panel>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  detail: string;
  icon: AppIconName;
  tone?: "neutral" | "good" | "warning";
}) {
  const iconColor = tone === "good" ? colors.success : tone === "warning" ? colors.warning : colors.brand;
  const iconSurface = tone === "good" ? colors.successSurface : tone === "warning" ? colors.warningSurface : colors.iconSurface;
  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, { backgroundColor: iconSurface }]}>
        <AppIcon name={icon} size={20} color={iconColor} secondaryColor={colors.accent} />
      </View>
      <View style={styles.metricCopy}>
        <AppText style={styles.metricLabel}>{label}</AppText>
        <AppText style={styles.metricValue} numberOfLines={1}>{value}</AppText>
        <AppText style={styles.metricDetail} numberOfLines={1}>{detail}</AppText>
      </View>
    </View>
  );
}

function Panel({ title, children, style }: { title: string; children: React.ReactNode; style?: object }) {
  return (
    <View style={[styles.panel, style]}>
      <View style={styles.panelHeader}>
        <AppText style={styles.panelTitle}>{title}</AppText>
      </View>
      {children}
    </View>
  );
}

function EventCard({
  scenario,
  targetRoom,
  targetDevice,
  selected,
  isRunning,
  disabled,
  onSelect,
  onApply,
}: {
  scenario: DemoScenarioMeta;
  targetRoom?: Room;
  targetDevice?: Device;
  selected: boolean;
  isRunning: boolean;
  disabled: boolean;
  onSelect: () => void;
  onApply: () => void;
}) {
  const status = scenario.severity === "good" ? "good" : scenario.severity === "offline" ? "offline" : scenario.severity;
  return (
    <View style={[styles.eventCard, selected && styles.eventCardSelected]}>
      <Pressable onPress={onSelect} style={styles.eventHitArea} accessibilityRole="button" accessibilityState={{ selected }}>
        <View style={styles.eventTop}>
          <View style={[styles.eventIcon, selected && styles.eventIconSelected]}>
            <AppIcon name={scenarioIcon(scenario.type)} size={21} color={selected ? colors.white : colors.brand} secondaryColor={selected ? colors.white : colors.accent} />
          </View>
          <StatusBadge status={status} />
        </View>
        <View style={styles.eventCopy}>
          <AppText style={styles.eventTitle}>{scenario.title}</AppText>
          <AppText style={styles.eventSummary}>{scenario.summary}</AppText>
        </View>
        <View style={styles.eventPreview}>
          <AppText style={styles.eventTarget} numberOfLines={1}>{targetRoom?.name ?? "No room selected"}</AppText>
          <AppText style={styles.eventDevice} numberOfLines={1}>{targetDevice?.name ?? "No device selected"}</AppText>
        </View>
        <View style={styles.miniPreviewGrid}>
          {scenario.preview.slice(0, 2).map((item) => (
            <View key={`${scenario.type}-${item.label}`} style={styles.miniPreviewItem}>
              <AppText style={styles.miniPreviewLabel}>{item.label}</AppText>
              <AppText style={styles.miniPreviewValue}>{formatReadingValue(item.value, item.unit)}</AppText>
            </View>
          ))}
        </View>
      </Pressable>
      <AppButton
        label={isRunning ? "Applying" : actionLabels[scenario.type]}
        onPress={onApply}
        disabled={disabled}
        variant={scenario.severity === "critical" ? "danger" : "primary"}
        style={styles.eventButton}
      />
    </View>
  );
}

function RecentEventRow({ item }: { item: RecentEvent }) {
  return (
    <View style={styles.eventRow}>
      <View style={[styles.eventDot, { backgroundColor: statusColors[item.severity] ?? colors.brand }]} />
      <View style={styles.eventRowMain}>
        <View style={styles.eventRowTop}>
          <AppText style={styles.eventRowTitle} numberOfLines={1}>{item.title}</AppText>
          <AppText style={styles.eventTime}>{formatAlertTime(item.createdAt)}</AppText>
        </View>
        <AppText style={styles.eventRowDetail} numberOfLines={2}>{item.roomName} | {item.typeLabel} | {item.statusLabel}</AppText>
      </View>
    </View>
  );
}

function ConditionRow({ item }: { item: ConditionItem }) {
  return (
    <View style={styles.conditionRow}>
      <View style={[styles.conditionIcon, { backgroundColor: statusSurfaces[item.status] ?? colors.surfaceSubtle }]}>
        <AppIcon name={item.icon} size={18} color={statusColors[item.status] ?? colors.brand} secondaryColor={colors.accent} />
      </View>
      <View style={styles.conditionCopy}>
        <AppText style={styles.conditionTitle} numberOfLines={1}>{item.title}</AppText>
        <AppText variant="caption" numberOfLines={1}>{item.detail}</AppText>
      </View>
      <StatusBadge status={item.status} />
    </View>
  );
}

function ContextRow({ label, value, icon, status }: { label: string; value: string; icon: AppIconName; status?: SafetyStatus | "online" }) {
  return (
    <View style={styles.contextRow}>
      <View style={styles.contextIcon}>
        <AppIcon name={icon} size={18} color={colors.brand} secondaryColor={colors.accent} />
      </View>
      <View style={styles.contextCopy}>
        <AppText style={styles.contextLabel}>{label}</AppText>
        <AppText style={styles.contextValue} numberOfLines={1}>{value}</AppText>
      </View>
      {status ? <StatusBadge status={status} /> : null}
    </View>
  );
}

function DeviceRow({ device, room }: { device: Device; room?: Room }) {
  return (
    <View style={styles.deviceRow}>
      <View style={styles.deviceIcon}>
        <AppIcon name={deviceIcon(device)} size={18} color={device.status === "offline" ? colors.offline : colors.brand} secondaryColor={colors.accent} />
      </View>
      <View style={styles.deviceCopy}>
        <AppText style={styles.deviceName} numberOfLines={1}>{device.name}</AppText>
        <AppText variant="caption" numberOfLines={1}>{room?.name ?? "Unassigned"} | {getDeviceTypeLabel(device.type)} | {formatRelativeMinutes(device.lastUpdatedMinutesAgo)}</AppText>
      </View>
      <StatusBadge status={device.status} />
    </View>
  );
}

function NoticeBanner({ notice }: { notice: NonNullable<Notice> }) {
  return (
    <View style={[styles.notice, notice.kind === "success" ? styles.noticeSuccess : styles.noticeError]}>
      <AppIcon name={notice.kind === "success" ? "check" : "alert"} size={20} color={notice.kind === "success" ? colors.success : colors.critical} secondaryColor={notice.kind === "success" ? colors.success : colors.critical} />
      <AppText style={[styles.noticeText, notice.kind === "success" ? styles.noticeTextSuccess : styles.noticeTextError]}>{notice.text}</AppText>
    </View>
  );
}

function AccessPanel({
  email,
  password,
  isLoading,
  error,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: {
  email: string;
  password: string;
  isLoading: boolean;
  error: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <View style={styles.accessShell}>
      <View style={styles.accessCard}>
        <View style={styles.accessCopy}>
          <View style={styles.accessIcon}>
            <AppIcon name="shield" size={32} color={colors.brand} secondaryColor={colors.accent} />
          </View>
          <AppText style={styles.accessTitle}>Secure console access</AppText>
          <AppText style={styles.accessSubtitle}>Sign in with your AirGuard account to manage controlled sensor events for homes you can access.</AppText>
        </View>
        <View style={styles.accessForm}>
          <View style={styles.inputGroup}>
            <AppText style={styles.inputLabel}>Email</AppText>
            <TextInput
              value={email}
              onChangeText={onEmailChange}
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              style={styles.input}
            />
          </View>
          <View style={styles.inputGroup}>
            <AppText style={styles.inputLabel}>Password</AppText>
            <TextInput
              value={password}
              onChangeText={onPasswordChange}
              placeholder="Enter password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              style={styles.input}
              onSubmitEditing={onSubmit}
            />
          </View>
          {error ? <AppText style={styles.error}>{error}</AppText> : null}
          <AppButton label={isLoading ? "Opening Console" : "Open Console"} onPress={onSubmit} disabled={isLoading || !email.trim() || !password} />
        </View>
      </View>
    </View>
  );
}

type RecentEvent = {
  id: string;
  title: string;
  roomName: string;
  typeLabel: string;
  statusLabel: string;
  severity: SafetyStatus;
  createdAt: string;
};

type ConditionItem = {
  id: string;
  title: string;
  detail: string;
  status: SafetyStatus;
  icon: AppIconName;
};

function buildRecentEvents(activityLogs: ActivityLog[], rooms: Room[], alerts: Alert[]): RecentEvent[] {
  const sensorCategories = new Set(["demo", "alert", "reading", "device"]);
  return activityLogs
    .filter((item) => sensorCategories.has(item.category))
    .slice(0, 8)
    .map((item) => {
      const alert = alerts.find((candidate) => item.title.includes(candidate.title) || item.description.includes(candidate.roomName));
      const room = rooms.find((candidate) => item.title.includes(candidate.name) || item.description.includes(candidate.name));
      const severity = inferEventSeverity(item, alert);
      return {
        id: item.id,
        title: item.title,
        roomName: alert?.roomName ?? room?.name ?? "Home",
        typeLabel: item.category === "demo" ? "System event" : labelFromCategory(item.category),
        statusLabel: item.category === "alert" ? alertStatusLabel(alert?.status) : severity === "good" ? "Recorded" : "Applied",
        severity,
        createdAt: item.createdAt,
      };
    });
}

function buildActiveConditions(rooms: Room[], devices: Device[], alerts: Alert[]) {
  const alertItems: ConditionItem[] = alerts.map((alert) => ({
    id: `alert-${alert.id}`,
    title: alert.title,
    detail: `${alert.roomName} | ${alert.status === "checking" ? "Checking in progress" : "Active alert"}`,
    status: alert.severity,
    icon: alert.severity === "critical" ? "alert" : "air",
  }));
  const roomItems: ConditionItem[] = rooms
    .filter((room) => room.status !== "good")
    .map((room) => ({
      id: `room-${room.id}`,
      title: room.name,
      detail: "Room condition requires attention",
      status: room.status,
      icon: room.icon,
    }));
  const deviceItems: ConditionItem[] = devices
    .filter((device) => device.status === "offline")
    .map((device) => ({
      id: `device-${device.id}`,
      title: device.name,
      detail: "Device connection is offline",
      status: "offline",
      icon: "sensor",
    }));
  const items = [...alertItems, ...roomItems, ...deviceItems].slice(0, 7);
  return { items, rooms: roomItems.length };
}

function getDisplayTarget(rooms: Room[], devices: Device[], selected: DemoScenarioType) {
  const room =
    selected === "smoke-detected"
      ? rooms.find((item) => item.icon === "kitchen" || item.name.toLowerCase().includes("kitchen")) ?? rooms[0]
      : selected === "sensor-offline"
        ? rooms.find((item) => item.status !== "offline") ?? rooms[0]
        : rooms.find((item) => item.icon === "living-room") ?? rooms.find((item) => item.icon === "bedroom") ?? rooms[0];
  const roomDevices = devices.filter((device) => device.roomId === room?.id);
  const device =
    selected === "smoke-detected"
      ? roomDevices.find((item) => item.type === "smoke-detector") ?? roomDevices[0]
      : selected === "sensor-offline"
        ? roomDevices[0] ?? devices[0]
        : roomDevices.find((item) => item.type === "air-sensor" || item.type === "co2-sensor") ?? roomDevices[0];
  return { room, device };
}

function inferEventSeverity(item: ActivityLog, alert?: Alert): SafetyStatus {
  if (alert?.severity) return alert.severity;
  const text = `${item.title} ${item.description}`.toLowerCase();
  if (text.includes("critical") || text.includes("smoke")) return "critical";
  if (text.includes("offline")) return "offline";
  if (text.includes("warning") || text.includes("co2") || text.includes("humidity") || text.includes("temperature")) return "warning";
  return item.status;
}

function labelFromCategory(category: ActivityLog["category"]) {
  if (category === "alert") return "Alert";
  if (category === "device") return "Device";
  if (category === "reading") return "Reading";
  return "System";
}

function alertStatusLabel(status?: Alert["status"]) {
  if (status === "checking") return "Checking";
  if (status === "resolved") return "Resolved";
  return "Active";
}

function scenarioIcon(type: DemoScenarioType): AppIconName {
  if (type === "smoke-detected") return "smoke";
  if (type === "high-co2") return "co2";
  if (type === "sensor-offline") return "alert";
  if (type === "humidity-temperature-warning") return "humidity";
  if (type === "reset-to-normal") return "check";
  return "air";
}

function deviceIcon(device: Device): AppIconName {
  if (device.type === "smoke-detector") return "smoke";
  if (device.type === "co2-sensor") return "co2";
  if (device.type === "ventilation-fan") return "fan";
  if (device.type === "alarm") return "alert";
  return "sensor";
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: "#F4F8FB",
    flex: 1,
  },
  content: {
    alignSelf: "center",
    gap: spacing.lg,
    maxWidth: 1320,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    width: "100%",
  },
  headerBar: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    justifyContent: "space-between",
    minHeight: 76,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...shadows.cardSubtle,
  },
  brandBlock: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  logoMark: {
    alignItems: "center",
    backgroundColor: colors.iconSurface,
    borderRadius: 16,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  brandCopy: {
    gap: 2,
  },
  brandName: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 18,
    lineHeight: 23,
  },
  headerMeta: {
    color: colors.textMuted,
    fontFamily: fonts.semiBold,
    fontSize: 10,
    lineHeight: 14,
    textTransform: "uppercase",
  },
  headerRight: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "flex-end",
  },
  operationBadge: {
    alignItems: "center",
    backgroundColor: colors.iconSurface,
    borderColor: "#CFE4FF",
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 34,
    paddingHorizontal: spacing.sm,
  },
  liveDot: {
    backgroundColor: colors.success,
    borderRadius: radius.pill,
    height: 8,
    width: 8,
  },
  operationBadgeText: {
    color: colors.brand,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  accountCluster: {
    alignItems: "flex-end",
    maxWidth: 220,
  },
  accountName: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  accountDetail: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  logoutAction: {
    alignItems: "center",
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  pageIntro: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    justifyContent: "space-between",
  },
  pageIntroCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 300,
  },
  eyebrow: {
    color: colors.brand,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 16,
    textTransform: "uppercase",
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 30,
    lineHeight: 38,
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 720,
  },
  homePill: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 42,
    paddingHorizontal: spacing.md,
  },
  homePillText: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 20,
    lineHeight: 27,
  },
  sectionCaption: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  metricCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexBasis: 210,
    flexDirection: "row",
    flexGrow: 1,
    gap: spacing.sm,
    minHeight: 106,
    minWidth: 190,
    padding: spacing.md,
    ...shadows.cardSubtle,
  },
  metricIcon: {
    alignItems: "center",
    borderRadius: 14,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  metricCopy: {
    flex: 1,
    minWidth: 0,
  },
  metricLabel: {
    color: colors.textMuted,
    fontFamily: fonts.semiBold,
    fontSize: 11,
    lineHeight: 15,
    textTransform: "uppercase",
  },
  metricValue: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 22,
    lineHeight: 29,
    marginTop: 2,
  },
  metricDetail: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  mainGrid: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
  },
  mainColumn: {
    flex: 1.65,
    gap: spacing.md,
    minWidth: 320,
  },
  sideColumn: {
    flex: 0.85,
    gap: spacing.md,
    minWidth: 300,
  },
  eventGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  eventCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexBasis: 265,
    flexGrow: 1,
    gap: spacing.sm,
    minHeight: 254,
    padding: spacing.md,
    ...shadows.cardSubtle,
  },
  eventCardSelected: {
    borderColor: colors.brand,
  },
  eventHitArea: {
    gap: spacing.sm,
  },
  eventTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  eventIcon: {
    alignItems: "center",
    backgroundColor: colors.iconSurface,
    borderRadius: 14,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  eventIconSelected: {
    backgroundColor: colors.brand,
  },
  eventCopy: {
    gap: spacing.xxs,
    minHeight: 72,
  },
  eventTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  eventSummary: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  eventPreview: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    gap: 2,
    padding: spacing.sm,
  },
  eventTarget: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 17,
  },
  eventDevice: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 16,
  },
  miniPreviewGrid: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  miniPreviewItem: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  miniPreviewLabel: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 14,
  },
  miniPreviewValue: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 17,
  },
  eventButton: {
    borderRadius: radius.sm,
    height: 42,
    marginTop: "auto",
  },
  splitSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  recentPanel: {
    flex: 1.2,
    minWidth: 300,
  },
  conditionsPanel: {
    flex: 0.8,
    minWidth: 280,
  },
  panel: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
    ...shadows.cardSubtle,
  },
  panelHeader: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingBottom: spacing.sm,
  },
  panelTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 15,
    lineHeight: 21,
  },
  previewHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  previewIcon: {
    alignItems: "center",
    backgroundColor: colors.iconSurface,
    borderRadius: 14,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  previewTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
  previewTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  previewList: {
    gap: spacing.xs,
  },
  previewRow: {
    alignItems: "center",
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.sm,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  previewLabel: {
    color: colors.textSecondary,
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 17,
  },
  previewValue: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 14,
    lineHeight: 19,
  },
  previewStatus: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 16,
    minWidth: 64,
    textAlign: "right",
  },
  contextRow: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  contextIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 12,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  contextCopy: {
    flex: 1,
    minWidth: 0,
  },
  contextLabel: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 14,
    textTransform: "uppercase",
  },
  contextValue: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  deviceRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  deviceIcon: {
    alignItems: "center",
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 12,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  deviceCopy: {
    flex: 1,
    minWidth: 0,
  },
  deviceName: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  eventRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  eventDot: {
    borderRadius: radius.pill,
    height: 9,
    marginTop: 6,
    width: 9,
  },
  eventRowMain: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  eventRowTop: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  eventRowTitle: {
    color: colors.textPrimary,
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  eventTime: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 11,
    lineHeight: 15,
  },
  eventRowDetail: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  conditionRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  conditionIcon: {
    alignItems: "center",
    borderRadius: 12,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  conditionCopy: {
    flex: 1,
    minWidth: 0,
  },
  conditionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  clearState: {
    alignItems: "center",
    backgroundColor: colors.successSurface,
    borderColor: "#BBF7D0",
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  clearStateCopy: {
    flex: 1,
    minWidth: 0,
  },
  clearStateTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  notice: {
    alignItems: "center",
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  noticeSuccess: {
    backgroundColor: colors.successSurface,
    borderColor: "#BBF7D0",
  },
  noticeError: {
    backgroundColor: colors.criticalSurface,
    borderColor: colors.borderDanger,
  },
  noticeText: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  noticeTextSuccess: {
    color: "#15803D",
  },
  noticeTextError: {
    color: colors.critical,
  },
  accessShell: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 420,
  },
  accessCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xl,
    maxWidth: 880,
    padding: spacing.xl,
    width: "100%",
    ...shadows.cardSubtle,
  },
  accessCopy: {
    flex: 1,
    gap: spacing.sm,
    minWidth: 280,
  },
  accessIcon: {
    alignItems: "center",
    backgroundColor: colors.iconSurface,
    borderRadius: radius.lg,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  accessTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 24,
    lineHeight: 31,
  },
  accessSubtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  accessForm: {
    flex: 1,
    gap: spacing.md,
    minWidth: 280,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  inputLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  input: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 15,
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  error: {
    color: colors.critical,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
});
