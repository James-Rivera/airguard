import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, useWindowDimensions, View, type ViewStyle } from "react-native";
import { LineChart, type lineDataItem } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppButton } from "@/components/ui/AppButton";
import { AppIcon, type AppIconName } from "@/components/ui/AppIcon";
import { AppText } from "@/components/ui/AppText";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ActivityLog, Alert, Device, Home, Reading, Room, SafetyStatus } from "@/domain/models";
import {
  demoScenarios,
  getDemoScenarioMeta,
  type DemoScenarioMeta,
  type DemoScenarioType,
  type ScenarioRecordsAffected,
  type ScenarioRunResult,
} from "@/domain/scenarios";
import { getDeviceTypeLabel, getHomeSafetyStatus, getRoomSafetyStatus } from "@/domain/selectors";
import { formatAlertTime, formatReadingValue, formatRelativeMinutes, initials } from "@/lib/formatters";
import { useAirGuard } from "@/state/airguard-store";
import { useSession } from "@/state/session";
import { colors, fonts, radius, shadows, spacing, statusColors, statusSurfaces } from "@/theme/index";

type Notice = {
  kind: "success" | "error";
  title: string;
  details?: Array<{ label: string; value: string }>;
} | null;

type EventProfile = "live" | "warning" | "critical";

const actionLabels: Record<DemoScenarioType, string> = {
  "normal-reading": "Normalize Readings",
  "high-co2": "Apply High CO2 Condition",
  "smoke-detected": "Trigger Smoke Event",
  "sensor-offline": "Mark Sensor Offline",
  "humidity-temperature-warning": "Apply Event",
  "reset-to-normal": "Normalize Readings",
};

const eventProfiles: Array<{ value: EventProfile; label: string; scenario: DemoScenarioType }> = [
  { value: "live", label: "Live", scenario: "normal-reading" },
  { value: "warning", label: "Warning", scenario: "high-co2" },
  { value: "critical", label: "Critical", scenario: "smoke-detected" },
];

export default function SensorSimulatorRoute() {
  const { user, session, isLoading, signIn, signOut } = useSession();
  const { state, actions, error } = useAirGuard();
  const { width } = useWindowDimensions();
  const [selected, setSelected] = useState<DemoScenarioType>("normal-reading");
  const [eventProfile, setEventProfile] = useState<EventProfile>("live");
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>();
  const [runningType, setRunningType] = useState<DemoScenarioType | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [switchingHomeId, setSwitchingHomeId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessError, setAccessError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  const selectedMeta = getDemoScenarioMeta(selected);
  const homes = state.homes.length > 0 ? state.homes : state.home ? [state.home] : [];
  const activeAlerts = useMemo(() => state.alerts.filter((alert) => alert.status !== "resolved"), [state.alerts]);
  const onlineDevices = useMemo(() => state.devices.filter((device) => device.status === "online"), [state.devices]);
  const selectedRoom = useMemo(() => state.rooms.find((room) => room.id === selectedRoomId) ?? state.rooms[0], [selectedRoomId, state.rooms]);
  const roomDevices = useMemo(
    () => (selectedRoom ? state.devices.filter((device) => device.roomId === selectedRoom.id) : state.devices),
    [selectedRoom, state.devices],
  );
  const selectedDevice = useMemo(
    () => roomDevices.find((device) => device.id === selectedDeviceId) ?? roomDevices[0],
    [roomDevices, selectedDeviceId],
  );
  const targetReadings = useMemo(() => {
    const source = state.readingHistory.length > 0 ? state.readingHistory : state.readings;
    const scopedToDevice = selectedDevice ? source.filter((reading) => reading.deviceId === selectedDevice.id) : [];
    if (scopedToDevice.length > 0) return scopedToDevice;
    return selectedRoom ? source.filter((reading) => reading.roomId === selectedRoom.id) : source;
  }, [selectedDevice, selectedRoom, state.readingHistory, state.readings]);
  const recentEvents = useMemo(() => buildRecentEvents(state.activityLogs, state.rooms, state.alerts), [state.activityLogs, state.rooms, state.alerts]);
  const activeConditions = useMemo(() => buildActiveConditions(state.rooms, state.devices, activeAlerts), [activeAlerts, state.devices, state.rooms]);
  const latestReading = state.readings[0];
  const lastEventTime = state.activityLogs[0]?.createdAt ? formatAlertTime(state.activityLogs[0].createdAt) : "No events yet";
  const canOpenConsole = Boolean(user && state.home);
  const isWide = width >= 980;

  useEffect(() => {
    if (state.rooms.length === 0) {
      if (selectedRoomId) setSelectedRoomId(undefined);
      return;
    }
    if (!selectedRoomId || !state.rooms.some((room) => room.id === selectedRoomId)) {
      setSelectedRoomId(state.rooms[0].id);
    }
  }, [selectedRoomId, state.rooms]);

  useEffect(() => {
    if (roomDevices.length === 0) {
      if (selectedDeviceId) setSelectedDeviceId(undefined);
      return;
    }
    if (!selectedDeviceId || !roomDevices.some((device) => device.id === selectedDeviceId)) {
      setSelectedDeviceId(roomDevices[0].id);
    }
  }, [roomDevices, selectedDeviceId]);

  async function runEvent(type: DemoScenarioType) {
    if (runningType) return;
    const meta = getDemoScenarioMeta(type);
    setSelected(type);
    if (!selectedRoom) {
      setNotice({ kind: "error", title: "Select a room before applying this sensor event." });
      return;
    }
    if (type === "sensor-offline" && !selectedDevice) {
      setNotice({ kind: "error", title: "Select a device before applying the sensor offline event." });
      return;
    }
    setNotice(null);
    setRunningType(type);
    try {
      const result = await actions.runDemoScenario(type, {
        roomId: selectedRoom?.id,
        deviceId: selectedDevice?.id,
      });
      const appliedAt = new Date(result.appliedAt);
      setLastSync(appliedAt);
      setNotice(buildSuccessNotice(result, state.home, selectedRoom, selectedDevice, meta));
    } catch (err) {
      setNotice({ kind: "error", title: err instanceof Error ? err.message : "The event could not be applied." });
    } finally {
      setRunningType(null);
    }
  }

  async function refreshConsole() {
    if (isRefreshing) return;
    setNotice(null);
    setIsRefreshing(true);
    try {
      await actions.loadHomeData();
      const refreshedAt = new Date();
      setLastSync(refreshedAt);
      setNotice({
        kind: "success",
        title: "Console refreshed",
        details: [
          { label: "Home", value: state.home?.name ?? "No active home" },
          { label: "Last sync", value: formatAlertTime(refreshedAt.toISOString()) },
        ],
      });
    } catch (err) {
      setNotice({ kind: "error", title: err instanceof Error ? err.message : "The console could not refresh home data." });
    } finally {
      setIsRefreshing(false);
    }
  }

  async function switchHome(homeId: string) {
    if (homeId === state.home?.id || switchingHomeId) return;
    setNotice(null);
    setSwitchingHomeId(homeId);
    try {
      await actions.selectHome(homeId);
      setLastSync(new Date());
    } catch (err) {
      setNotice({ kind: "error", title: err instanceof Error ? err.message : "The selected home could not be loaded." });
    } finally {
      setSwitchingHomeId(null);
    }
  }

  function chooseProfile(profile: EventProfile) {
    setEventProfile(profile);
    const nextScenario = eventProfiles.find((item) => item.value === profile)?.scenario;
    if (nextScenario) setSelected(nextScenario);
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
      <View style={styles.shell}>
        {isWide ? <Sidebar user={user} home={state.home} onLogout={logout} /> : null}
        <ScrollView style={styles.page} contentContainerStyle={styles.pageContent} showsVerticalScrollIndicator={false}>
          {!isWide ? <MobileBrand user={user} home={state.home} onLogout={logout} /> : null}
          <ConsoleHeader
            home={state.home}
            homeStatus={getHomeSafetyStatus(state)}
            activeAlerts={activeAlerts.length}
            lastSync={lastSync}
            selectedRoom={selectedRoom}
            selectedDevice={selectedDevice}
            isRefreshing={isRefreshing}
            onRefresh={refreshConsole}
          />

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
            <EmptyState title="Console unavailable" message="Create or join a home before applying controlled sensor events." iconName="home" />
          ) : (
            <>
              {notice ? <NoticeBanner notice={notice} /> : null}
              {error && !notice ? <NoticeBanner notice={{ kind: "error", title: error }} /> : null}

              <FilterRow
                homes={homes}
                activeHome={state.home}
                selectedRoom={selectedRoom}
                rooms={state.rooms}
                selectedDevice={selectedDevice}
                devices={roomDevices}
                eventProfile={eventProfile}
                switchingHomeId={switchingHomeId}
                onHomeSelect={switchHome}
                onRoomSelect={setSelectedRoomId}
                onDeviceSelect={setSelectedDeviceId}
                onProfileSelect={chooseProfile}
              />

              <View style={styles.topDashboardGrid}>
                <View style={styles.metricsGrid}>
                  <MetricCard label="Home Status" value={homeStatusLabel(getHomeSafetyStatus(state))} detail={state.home?.name ?? "No active home"} icon="shield" tone={metricTone(getHomeSafetyStatus(state))} />
                  <MetricCard label="Rooms Monitored" value={String(state.rooms.length)} detail={`${activeConditions.roomCount} need attention`} icon="rooms" />
                  <MetricCard label="Devices Online" value={`${onlineDevices.length}/${state.devices.length}`} detail={`${state.devices.length - onlineDevices.length} offline`} icon="device" tone={state.devices.length === onlineDevices.length ? "good" : "warning"} />
                  <MetricCard label="Active Alerts" value={String(activeAlerts.length)} detail={`${activeAlerts.filter((alert) => alert.severity === "critical").length} critical`} icon="alert" tone={activeAlerts.length > 0 ? "warning" : "good"} />
                  <MetricCard label="Last Sync" value={lastSync ? formatAlertTime(lastSync.toISOString()) : lastEventTime} detail={latestReading ? `Latest reading ${formatAlertTime(latestReading.createdAt)}` : "Awaiting readings"} icon="note" />
                </View>
                <View style={styles.topChart}>
                  <Panel title="Air Quality Activity">
                    <ActivityChart readings={targetReadings} status={selectedRoom ? getRoomSafetyStatus(state, selectedRoom.id) : getHomeSafetyStatus(state)} />
                  </Panel>
                </View>
              </View>

              <View style={styles.dashboardGrid}>
                <View style={styles.controlsColumn}>
                  <View style={styles.sectionHeader}>
                    <View>
                      <AppText style={styles.sectionTitle}>Sensor Controls</AppText>
                      <AppText style={styles.sectionCaption}>Apply controlled sensor events to the selected room and device.</AppText>
                    </View>
                    <StatusBadge status={scenarioStatus(selectedMeta)} />
                  </View>
                  <View style={styles.eventGrid}>
                    {demoScenarios.map((scenario) => (
                      <EventCard
                        key={scenario.type}
                        scenario={scenario}
                        targetRoom={selectedRoom}
                        targetDevice={selectedDevice}
                        selected={selected === scenario.type}
                        isRunning={runningType === scenario.type}
                        disabled={Boolean(runningType) || !selectedRoom || (scenario.type === "sensor-offline" && !selectedDevice)}
                        onSelect={() => setSelected(scenario.type)}
                        onApply={() => runEvent(scenario.type)}
                      />
                    ))}
                  </View>
                  <View style={styles.controlsFooter}>
                    <AppText style={styles.controlsFooterText}>View All Controls</AppText>
                    <AppIcon name="chevron-right" size={15} color={colors.brand} secondaryColor={colors.brand} />
                  </View>

                  <View style={styles.secondaryGrid}>
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
                          <AppIcon name="check" size={23} color={colors.success} secondaryColor={colors.success} />
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

                <View style={styles.rightRail}>
                  <Panel title="Reading Preview">
                    <ReadingPreview scenario={selectedMeta} />
                  </Panel>

                  <Panel title="Current Target">
                    <ContextRow label="Home" value={state.home?.name ?? "No home"} icon="home" />
                    <ContextRow label="Room" value={selectedRoom?.name ?? "Add a room"} icon={selectedRoom?.icon ?? "rooms"} status={selectedRoom ? getRoomSafetyStatus(state, selectedRoom.id) : undefined} />
                    <ContextRow label="Device" value={selectedDevice?.name ?? "Add a device"} icon="sensor" status={selectedDevice?.status === "offline" ? "offline" : selectedDevice ? "online" : undefined} />
                    <ContextRow label="Latest Reading" value={latestReading ? `${latestReading.label} ${formatReadingValue(latestReading.value, latestReading.unit)}` : "Awaiting readings"} icon="air" status={latestReading?.status} />
                  </Panel>

                  <Panel title="Connected Devices">
                    {state.devices.length === 0 ? (
                      <AppText variant="caption">Connected devices appear after setup.</AppText>
                    ) : (
                      state.devices.slice(0, 7).map((device) => <DeviceRow key={device.id} device={device} room={state.rooms.find((item) => item.id === device.roomId)} />)
                    )}
                  </Panel>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function Sidebar({ user, home, onLogout }: { user: { name: string; email: string } | null; home: Home | null; onLogout: () => void }) {
  return (
    <View style={styles.sidebar}>
      <View style={styles.sidebarBrand}>
        <View style={styles.sidebarLogo}>
          <AppIcon name="shield" size={26} color={colors.white} secondaryColor={colors.white} />
        </View>
        <View>
          <AppText style={styles.sidebarName}>AirGuard</AppText>
          <AppText style={styles.sidebarMeta}>Operations</AppText>
        </View>
      </View>
      <View style={styles.navList}>
        <NavItem label="Dashboard" icon="home" active />
      </View>
      <View style={styles.sidebarFooter}>
        {user ? (
          <>
            <View style={styles.accountAvatar}>
              <AppText style={styles.accountAvatarText}>{initials(user.name)}</AppText>
            </View>
            <View style={styles.accountCopy}>
              <AppText style={styles.accountName} numberOfLines={1}>{user.name}</AppText>
              <AppText style={styles.accountDetail} numberOfLines={1}>{home?.name ?? user.email}</AppText>
            </View>
            <Pressable onPress={onLogout} style={styles.sidebarLogout} accessibilityRole="button" accessibilityLabel="Sign out">
              <AppIcon name="logout" size={18} color={colors.textSecondary} secondaryColor={colors.brand} />
            </Pressable>
          </>
        ) : (
          <AppText style={styles.sidebarFooterText}>Sign in to access your home console.</AppText>
        )}
      </View>
    </View>
  );
}

function MobileBrand({ user, home, onLogout }: { user: { name: string; email: string } | null; home: Home | null; onLogout: () => void }) {
  return (
    <View style={styles.mobileBrand}>
      <View style={styles.sidebarBrand}>
        <View style={styles.sidebarLogo}>
          <AppIcon name="shield" size={22} color={colors.white} secondaryColor={colors.white} />
        </View>
        <View>
          <AppText style={styles.sidebarName}>AirGuard</AppText>
          <AppText style={styles.sidebarMeta}>{home?.name ?? "Operations"}</AppText>
        </View>
      </View>
      {user ? (
        <Pressable onPress={onLogout} style={styles.mobileLogout} accessibilityRole="button" accessibilityLabel="Sign out">
          <AppIcon name="logout" size={18} color={colors.textSecondary} secondaryColor={colors.brand} />
        </Pressable>
      ) : null}
    </View>
  );
}

function NavItem({ label, icon, active = false, onPress }: { label: string; icon: AppIconName; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={[styles.navItem, active && styles.navItemActive]} accessibilityRole={onPress ? "button" : undefined}>
      <AppIcon name={icon} size={19} color={active ? colors.brand : colors.textSecondary} secondaryColor={active ? colors.accent : colors.textMuted} />
      <AppText style={[styles.navLabel, active && styles.navLabelActive]}>{label}</AppText>
    </Pressable>
  );
}

function ConsoleHeader({
  home,
  homeStatus,
  activeAlerts,
  lastSync,
  selectedRoom,
  selectedDevice,
  isRefreshing,
  onRefresh,
}: {
  home: Home | null;
  homeStatus: SafetyStatus;
  activeAlerts: number;
  lastSync: Date | null;
  selectedRoom?: Room;
  selectedDevice?: Device;
  isRefreshing: boolean;
  onRefresh: () => void;
}) {
  const statusLabel = homeStatusLabel(homeStatus);
  const statusColor = statusColors[homeStatus] ?? colors.success;
  const syncLabel = lastSync ? formatAlertTime(lastSync.toISOString()) : "Not synced this session";
  const targetLabel = selectedDevice?.name ?? selectedRoom?.name ?? "No target selected";
  return (
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        <AppText style={styles.headerTitle}>Sensor Console</AppText>
        <View style={styles.headerMetaRow}>
          <AppText style={styles.headerMeta} numberOfLines={1}>Home: {home?.name ?? "No home selected"}</AppText>
          <AppText style={styles.headerMetaDot}>•</AppText>
          <AppText style={styles.headerMeta} numberOfLines={1}>{targetLabel}</AppText>
          <AppText style={styles.headerMetaDot}>•</AppText>
          <AppText style={styles.headerMeta} numberOfLines={1}>Last sync: {syncLabel}</AppText>
        </View>
      </View>
      <View style={styles.headerTools}>
        <View style={styles.statusBadge}>
          <View style={[styles.liveDot, { backgroundColor: statusColor }]} />
          <AppText style={styles.statusBadgeText}>{statusLabel === "Good" ? "Operational" : statusLabel}</AppText>
        </View>
        <View style={styles.notificationButton}>
          <AppIcon name="alert" size={18} color={activeAlerts > 0 ? colors.warning : colors.textSecondary} secondaryColor={activeAlerts > 0 ? colors.warning : colors.textMuted} />
          {activeAlerts > 0 ? <View style={styles.notificationDot} /> : null}
        </View>
        <View style={styles.dateBox}>
          <AppText style={styles.dateLabel}>Active Alerts</AppText>
          <AppText style={styles.dateValue}>{activeAlerts} open</AppText>
        </View>
        <AppButton label={isRefreshing ? "Refreshing" : "Refresh"} onPress={onRefresh} disabled={isRefreshing} variant="secondary" style={styles.refreshButton} />
      </View>
    </View>
  );
}

function FilterRow({
  homes,
  activeHome,
  selectedRoom,
  rooms,
  selectedDevice,
  devices,
  eventProfile,
  switchingHomeId,
  onHomeSelect,
  onRoomSelect,
  onDeviceSelect,
  onProfileSelect,
}: {
  homes: Home[];
  activeHome: Home | null;
  selectedRoom?: Room;
  rooms: Room[];
  selectedDevice?: Device;
  devices: Device[];
  eventProfile: EventProfile;
  switchingHomeId: string | null;
  onHomeSelect: (homeId: string) => void;
  onRoomSelect: (roomId: string) => void;
  onDeviceSelect: (deviceId: string) => void;
  onProfileSelect: (profile: EventProfile) => void;
}) {
  return (
    <View style={styles.filterRow}>
      {homes.length > 1 ? (
        <SelectorGroup label="Home">
          {homes.map((home) => (
            <SelectorPill
              key={home.id}
              label={switchingHomeId === home.id ? "Loading" : home.name}
              active={activeHome?.id === home.id}
              onPress={() => onHomeSelect(home.id)}
            />
          ))}
        </SelectorGroup>
      ) : null}
      <SelectorGroup label="Room">
        {rooms.length === 0 ? <DisabledPill label="No rooms" /> : rooms.map((room) => <SelectorPill key={room.id} label={room.name} active={selectedRoom?.id === room.id} onPress={() => onRoomSelect(room.id)} />)}
      </SelectorGroup>
      <SelectorGroup label="Device">
        {devices.length === 0 ? <DisabledPill label="No devices" /> : devices.map((device) => <SelectorPill key={device.id} label={device.name} active={selectedDevice?.id === device.id} onPress={() => onDeviceSelect(device.id)} />)}
      </SelectorGroup>
      <SelectorGroup label="Event profile">
        {eventProfiles.map((profile) => (
          <SelectorPill key={profile.value} label={profile.label} active={eventProfile === profile.value} onPress={() => onProfileSelect(profile.value)} />
        ))}
      </SelectorGroup>
    </View>
  );
}

function SelectorGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.selectorGroup}>
      <AppText style={styles.selectorLabel}>{label}</AppText>
      <View style={styles.selectorOptions}>{children}</View>
    </View>
  );
}

function SelectorPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.selectorPill, active && styles.selectorPillActive]} accessibilityRole="button" accessibilityState={{ selected: active }}>
      <AppText style={[styles.selectorPillText, active && styles.selectorPillTextActive]} numberOfLines={1}>{label}</AppText>
    </Pressable>
  );
}

function DisabledPill({ label }: { label: string }) {
  return (
    <View style={[styles.selectorPill, styles.selectorPillDisabled]}>
      <AppText style={styles.selectorPillText}>{label}</AppText>
    </View>
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

function Panel({ title, children, style }: { title: string; children: React.ReactNode; style?: ViewStyle }) {
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
  const missingDevice = scenario.type === "sensor-offline" && !targetDevice;
  const actionLabel = !targetRoom ? "Select Room" : missingDevice ? "Select Device" : isRunning ? "Applying" : actionLabels[scenario.type];

  return (
    <View style={[styles.eventCard, selected && styles.eventCardSelected]}>
      <Pressable onPress={onSelect} style={styles.eventHitArea} accessibilityRole="button" accessibilityState={{ selected }}>
        <View style={styles.eventTop}>
          <View style={[styles.eventIcon, selected && styles.eventIconSelected]}>
            <AppIcon name={scenarioIcon(scenario.type)} size={21} color={selected ? colors.white : colors.brand} secondaryColor={selected ? colors.white : colors.accent} />
          </View>
          <StatusBadge status={scenarioStatus(scenario)} />
        </View>
        <View style={styles.eventCopy}>
          <AppText style={styles.eventTitle}>{scenario.title}</AppText>
          <AppText style={styles.eventSummary}>{scenario.summary}</AppText>
        </View>
        <View style={styles.eventTargetBox}>
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
        label={actionLabel}
        onPress={onApply}
        disabled={disabled}
        variant={scenario.severity === "critical" ? "danger" : "primary"}
        style={styles.eventButton}
      />
    </View>
  );
}

function ActivityChart({ readings, status }: { readings: Reading[]; status: SafetyStatus }) {
  const chart = buildActivityChart(readings, status);
  const latest = chart.latest;

  if (!chart.hasEnoughData) {
    return (
      <View style={styles.chartBox}>
        <View style={styles.chartHeader}>
          <View>
            <AppText style={styles.chartValue}>{latest.aqi ?? "--"}</AppText>
            <AppText style={styles.chartCaption}>AQI / condition trend</AppText>
          </View>
          <StatusBadge status={status} />
        </View>
        <View style={styles.chartEmpty}>
          <AppIcon name="chart" size={30} color={colors.brand} secondaryColor={colors.accent} />
          <AppText style={styles.chartEmptyTitle}>Not enough trend data</AppText>
          <AppText style={styles.chartEmptyText}>Apply sensor events or refresh after new readings to build a room/device trend.</AppText>
        </View>
        <ChartLegend latest={latest} />
      </View>
    );
  }

  return (
    <View style={styles.chartBox}>
      <View style={styles.chartHeader}>
        <View>
          <AppText style={styles.chartValue}>{latest.aqi ?? "--"}</AppText>
          <AppText style={styles.chartCaption}>AQI / condition trend</AppText>
        </View>
        <StatusBadge status={status} />
      </View>
      <View style={styles.lineChartWrap}>
        <LineChart
          data={chart.aqi}
          data2={chart.co2.length >= 2 ? chart.co2 : undefined}
          data3={chart.pm25.length >= 2 ? chart.pm25 : undefined}
          width={300}
          height={158}
          maxValue={100}
          noOfSections={4}
          thickness={4}
          thickness2={3}
          thickness3={3}
          color={colors.brand}
          color2={colors.warning}
          color3={colors.critical}
          curved
          areaChart
          startFillColor={colors.brandCyan}
          endFillColor={colors.brandCyan}
          startOpacity={0.18}
          endOpacity={0.02}
          initialSpacing={8}
          endSpacing={8}
          spacing={Math.max(42, 300 / Math.max(chart.aqi.length, 5))}
          disableScroll
          isAnimated={false}
          dataPointsColor={colors.brand}
          dataPointsColor2={colors.warning}
          dataPointsColor3={colors.critical}
          dataPointsRadius={4}
          yAxisThickness={0}
          yAxisLabelWidth={26}
          yAxisTextStyle={styles.chartAxis}
          xAxisThickness={1}
          xAxisColor={colors.border}
          xAxisLabelsHeight={26}
          xAxisLabelTextStyle={styles.chartAxis}
          rulesColor={colors.border}
          rulesThickness={1}
          rulesLength={300}
          backgroundColor={colors.white}
          hideOrigin
        />
      </View>
      <ChartLegend latest={latest} />
    </View>
  );
}

function ChartLegend({ latest }: { latest: ActivityChartData["latest"] }) {
  return (
    <View style={styles.chartLegend}>
      <LegendItem label="AQI" value={latest.aqi !== null ? String(latest.aqi) : "--"} color={colors.brand} />
      <LegendItem label="CO2" value={latest.co2 !== null ? `${latest.co2} ppm` : "--"} color={colors.warning} />
      <LegendItem label="PM2.5" value={latest.pm25 !== null ? `${latest.pm25} ug/m3` : "--"} color={colors.critical} />
    </View>
  );
}

function LegendItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <View>
        <AppText style={styles.legendLabel}>{label}</AppText>
        <AppText style={styles.legendValue}>{value}</AppText>
      </View>
    </View>
  );
}

function ReadingPreview({ scenario }: { scenario: DemoScenarioMeta }) {
  return (
    <View style={styles.previewList}>
      <View style={styles.previewHeader}>
        <View style={styles.previewIcon}>
          <AppIcon name={scenarioIcon(scenario.type)} size={22} color={colors.brand} secondaryColor={colors.accent} />
        </View>
        <View style={styles.previewTitleBlock}>
          <AppText style={styles.previewTitle}>{scenario.title}</AppText>
          <AppText variant="caption">Reading profile</AppText>
        </View>
        <StatusBadge status={scenarioStatus(scenario)} />
      </View>
      {scenario.preview.map((item) => (
        <View key={`${item.type}-${item.label}`} style={styles.previewRow}>
          <AppText style={styles.previewLabel}>{item.label}</AppText>
          <AppText style={styles.previewValue}>{formatReadingValue(item.value, item.unit)}</AppText>
          <AppText style={styles.previewStatus}>{item.statusLabel}</AppText>
        </View>
      ))}
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
  const success = notice.kind === "success";
  return (
    <View style={[styles.notice, success ? styles.noticeSuccess : styles.noticeError]}>
      <AppIcon name={success ? "check" : "alert"} size={20} color={success ? colors.success : colors.critical} secondaryColor={success ? colors.success : colors.critical} />
      <View style={styles.noticeCopy}>
        <AppText style={[styles.noticeTitle, success ? styles.noticeTextSuccess : styles.noticeTextError]}>{notice.title}</AppText>
        {notice.details ? (
          <View style={styles.noticeDetails}>
            {notice.details.map((item) => (
              <View key={item.label} style={styles.noticeDetailItem}>
                <AppText style={styles.noticeDetailLabel}>{item.label}</AppText>
                <AppText style={styles.noticeDetailValue}>{item.value}</AppText>
              </View>
            ))}
          </View>
        ) : null}
      </View>
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
            <AppIcon name="shield" size={34} color={colors.brand} secondaryColor={colors.accent} />
          </View>
          <AppText style={styles.accessTitle}>Open Sensor Console</AppText>
          <AppText style={styles.accessSubtitle}>Sign in with your AirGuard account to operate the homes available to you.</AppText>
        </View>
        <View style={styles.accessForm}>
          <View style={styles.inputGroup}>
            <AppText style={styles.inputLabel}>Email</AppText>
            <TextInput
              value={email}
              onChangeText={onEmailChange}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <View style={styles.inputGroup}>
            <AppText style={styles.inputLabel}>Password</AppText>
            <TextInput
              value={password}
              onChangeText={onPasswordChange}
              secureTextEntry
              textContentType="password"
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
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

type ActivityChartData = {
  aqi: lineDataItem[];
  co2: lineDataItem[];
  pm25: lineDataItem[];
  hasEnoughData: boolean;
  latest: {
    aqi: number | null;
    co2: number | null;
    pm25: number | null;
  };
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
  return { items, roomCount: roomItems.length };
}

function buildActivityChart(readings: Reading[], status: SafetyStatus): ActivityChartData {
  const sorted = [...readings].filter((reading) => Number.isFinite(Date.parse(reading.createdAt))).sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  const buckets = groupReadingsByTimestamp(sorted).slice(-7);
  const fallbackAqi = status === "critical" ? 86 : status === "warning" ? 58 : status === "offline" ? 35 : 18;
  let lastCo2: number | null = null;
  let lastPm25: number | null = null;

  const aqi: lineDataItem[] = [];
  const co2: lineDataItem[] = [];
  const pm25: lineDataItem[] = [];

  buckets.forEach((bucket, index) => {
    const co2Reading = latestOfType(bucket.readings, "co2");
    const smokeReading = latestOfType(bucket.readings, "smoke");
    const humidityReading = latestOfType(bucket.readings, "humidity");
    const temperatureReading = latestOfType(bucket.readings, "temperature");
    if (co2Reading) lastCo2 = Math.round(co2Reading.value);
    if (smokeReading) lastPm25 = Math.round(smokeReading.value);

    const label = index === buckets.length - 1 ? "Now" : formatChartTime(bucket.createdAt);
    const aqiValue = computeConditionScore({ co2: co2Reading, smoke: smokeReading, humidity: humidityReading, temperature: temperatureReading, status });
    aqi.push({ label, value: aqiValue, dataPointText: index === buckets.length - 1 ? String(aqiValue) : undefined });
    if (lastCo2 !== null) co2.push({ label, value: scaleCo2ForChart(lastCo2) });
    if (lastPm25 !== null) pm25.push({ label, value: scalePm25ForChart(lastPm25) });
  });

  if (aqi.length === 0) {
    aqi.push({ label: "Now", value: fallbackAqi });
  }

  return {
    aqi,
    co2,
    pm25,
    hasEnoughData: aqi.length >= 2,
    latest: {
      aqi: Math.round(aqi[aqi.length - 1]?.value ?? fallbackAqi),
      co2: lastCo2,
      pm25: lastPm25,
    },
  };
}

function groupReadingsByTimestamp(readings: Reading[]) {
  const buckets: Array<{ key: string; createdAt: string; readings: Reading[] }> = [];
  const bucketMap = new Map<string, { key: string; createdAt: string; readings: Reading[] }>();

  for (const reading of readings) {
    const date = new Date(reading.createdAt);
    date.setMilliseconds(0);
    const key = date.toISOString();
    const existing = bucketMap.get(key);
    if (existing) {
      existing.readings.push(reading);
    } else {
      const bucket = { key, createdAt: reading.createdAt, readings: [reading] };
      bucketMap.set(key, bucket);
      buckets.push(bucket);
    }
  }

  return buckets;
}

function latestOfType(readings: Reading[], type: Reading["type"]) {
  return readings
    .filter((reading) => reading.type === type)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0];
}

function computeConditionScore({
  co2,
  smoke,
  humidity,
  temperature,
  status,
}: {
  co2?: Reading;
  smoke?: Reading;
  humidity?: Reading;
  temperature?: Reading;
  status: SafetyStatus;
}) {
  const co2Score = co2 ? (co2.value <= 700 ? 18 : co2.value <= 1100 ? 42 : co2.value <= 1800 ? 70 : 90) : 20;
  const smokeScore = smoke ? (smoke.value <= 12 ? 12 : smoke.value <= 35 ? 38 : smoke.value <= 100 ? 76 : 96) : 12;
  const humidityScore = humidity ? Math.min(72, Math.abs(humidity.value - 45) * 1.7) : 10;
  const temperatureScore = temperature ? Math.min(68, Math.abs(temperature.value - 24) * 3) : 8;
  const statusLift = status === "critical" ? 18 : status === "warning" ? 9 : status === "offline" ? 12 : 0;
  return clampChartValue(co2Score * 0.4 + smokeScore * 0.36 + humidityScore * 0.14 + temperatureScore * 0.1 + statusLift);
}

function scaleCo2ForChart(value: number) {
  if (value <= 0) return 0;
  return clampChartValue((value / 2000) * 100);
}

function scalePm25ForChart(value: number) {
  return clampChartValue((value / 300) * 100);
}

function clampChartValue(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function formatChartTime(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function inferEventSeverity(item: ActivityLog, alert?: Alert): SafetyStatus {
  if (alert?.severity) return alert.severity;
  const text = `${item.title} ${item.description}`.toLowerCase();
  if (text.includes("critical") || text.includes("smoke")) return "critical";
  if (text.includes("offline")) return "offline";
  if (text.includes("warning") || text.includes("co2") || text.includes("humidity") || text.includes("temperature")) return "warning";
  return item.status;
}

function buildSuccessNotice(result: ScenarioRunResult, home: Home | null, room: Room | undefined, device: Device | undefined, meta: DemoScenarioMeta): Notice {
  return {
    kind: "success",
    title: "Event applied",
    details: [
      { label: "Event", value: meta.title },
      { label: "Target home", value: home?.name ?? result.homeId },
      { label: "Target room", value: result.roomName ?? room?.name ?? "Home" },
      { label: "Target device", value: result.deviceName ?? device?.name ?? "No device selected" },
      { label: "Records affected", value: formatRecordsAffected(result.recordsAffected) },
      { label: "Last sync", value: formatAlertTime(result.appliedAt) },
    ],
  };
}

function formatRecordsAffected(records: ScenarioRecordsAffected) {
  const parts = [
    countLabel(records.readings, "reading"),
    countLabel(records.alerts, "alert"),
    records.resolvedAlerts > 0 ? countLabel(records.resolvedAlerts, "resolved alert") : "",
    countLabel(records.rooms, "room"),
    countLabel(records.devices, "device"),
    countLabel(records.activityLogs, "activity"),
  ].filter(Boolean);
  return parts.join(", ");
}

function countLabel(count: number, label: string) {
  return `${count} ${label}${count === 1 ? "" : "s"}`;
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

function scenarioStatus(scenario: DemoScenarioMeta): SafetyStatus {
  if (scenario.severity === "good") return "good";
  if (scenario.severity === "offline") return "offline";
  return scenario.severity;
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

function homeStatusLabel(status: SafetyStatus) {
  if (status === "critical") return "Critical";
  if (status === "warning") return "Warning";
  if (status === "offline") return "Offline";
  return "Good";
}

function metricTone(status: SafetyStatus): "neutral" | "good" | "warning" {
  if (status === "good") return "good";
  if (status === "warning" || status === "critical" || status === "offline") return "warning";
  return "neutral";
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: "#F6FAFC",
    flex: 1,
  },
  shell: {
    backgroundColor: "#F6FAFC",
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "space-between",
    margin: spacing.sm,
    padding: spacing.lg,
    width: 248,
    ...shadows.cardSubtle,
  },
  sidebarBrand: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  sidebarLogo: {
    alignItems: "center",
    backgroundColor: colors.brand,
    borderRadius: 18,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  sidebarName: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 21,
    lineHeight: 27,
  },
  sidebarMeta: {
    color: colors.textMuted,
    fontFamily: fonts.semiBold,
    fontSize: 11,
    lineHeight: 15,
    textTransform: "uppercase",
  },
  navList: {
    gap: spacing.xs,
    marginTop: spacing.xxl,
  },
  navItem: {
    alignItems: "center",
    borderRadius: 10,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 46,
    paddingHorizontal: spacing.md,
  },
  navItemActive: {
    backgroundColor: "#EAF2FF",
  },
  navLabel: {
    color: colors.textSecondary,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 19,
  },
  navLabelActive: {
    color: colors.brand,
  },
  sidebarFooter: {
    alignItems: "center",
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 76,
    padding: spacing.sm,
  },
  accountAvatar: {
    alignItems: "center",
    backgroundColor: colors.iconSurface,
    borderRadius: radius.pill,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  accountAvatarText: {
    color: colors.brand,
    fontFamily: fonts.bold,
    fontSize: 12,
    lineHeight: 16,
  },
  accountCopy: {
    flex: 1,
    minWidth: 0,
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
  sidebarLogout: {
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  sidebarFooterText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 17,
  },
  mobileBrand: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  mobileLogout: {
    alignItems: "center",
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.pill,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  page: {
    flex: 1,
  },
  pageContent: {
    alignSelf: "center",
    gap: spacing.md,
    maxWidth: 1440,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    width: "100%",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    justifyContent: "space-between",
    minHeight: 72,
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 300,
  },
  statusBadge: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 42,
    paddingHorizontal: spacing.md,
    ...shadows.cardSubtle,
  },
  liveDot: {
    backgroundColor: colors.success,
    borderRadius: radius.pill,
    height: 8,
    width: 8,
  },
  statusBadgeText: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 35,
  },
  headerMetaRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  headerMeta: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 13,
    lineHeight: 18,
    maxWidth: 360,
  },
  headerMetaDot: {
    color: colors.textMuted,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  headerTools: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "flex-end",
  },
  notificationButton: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    position: "relative",
    width: 42,
    ...shadows.cardSubtle,
  },
  notificationDot: {
    backgroundColor: colors.critical,
    borderColor: colors.white,
    borderRadius: radius.pill,
    borderWidth: 2,
    height: 11,
    position: "absolute",
    right: 8,
    top: 8,
    width: 11,
  },
  dateBox: {
    backgroundColor: "transparent",
    minHeight: 46,
    minWidth: 132,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  dateLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 17,
  },
  dateValue: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 15,
  },
  refreshButton: {
    height: 42,
    minWidth: 42,
    paddingHorizontal: spacing.md,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  selectorGroup: {
    gap: spacing.xs,
    minWidth: 150,
  },
  selectorLabel: {
    color: colors.textMuted,
    fontFamily: fonts.semiBold,
    fontSize: 11,
    lineHeight: 15,
    textTransform: "uppercase",
    display: "none",
  },
  selectorOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  selectorPill: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    maxWidth: 210,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    justifyContent: "center",
    ...shadows.cardSubtle,
  },
  selectorPillActive: {
    backgroundColor: colors.white,
    borderColor: colors.brand,
  },
  selectorPillDisabled: {
    opacity: 0.55,
  },
  selectorPillText: {
    color: colors.textSecondary,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  selectorPillTextActive: {
    color: colors.brand,
  },
  topDashboardGrid: {
    alignItems: "stretch",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  metricsGrid: {
    flex: 1.55,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    minWidth: 620,
  },
  topChart: {
    flex: 0.85,
    minWidth: 320,
  },
  metricCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexBasis: 150,
    flexDirection: "row",
    flexGrow: 1,
    gap: spacing.sm,
    minHeight: 118,
    minWidth: 148,
    padding: spacing.md,
    ...shadows.cardSubtle,
  },
  metricIcon: {
    alignItems: "center",
    borderRadius: 10,
    height: 34,
    justifyContent: "center",
    width: 34,
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
    marginTop: spacing.sm,
  },
  metricDetail: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  dashboardGrid: {
    alignItems: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
  },
  controlsColumn: {
    flex: 1.65,
    gap: spacing.md,
    minWidth: 340,
  },
  rightRail: {
    flex: 0.85,
    gap: spacing.md,
    minWidth: 320,
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
  eventGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  eventCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexBasis: 330,
    flexGrow: 1,
    gap: spacing.sm,
    minHeight: 214,
    padding: spacing.sm,
    ...shadows.cardSubtle,
  },
  eventCardSelected: {
    borderColor: colors.brand,
    borderWidth: 2,
    shadowColor: colors.brand,
    shadowOpacity: 0.08,
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
    borderRadius: 10,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  eventIconSelected: {
    backgroundColor: colors.brand,
  },
  eventCopy: {
    gap: spacing.xxs,
    minHeight: 48,
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
  eventTargetBox: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
    borderRadius: 8,
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
    borderRadius: 8,
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
    borderRadius: 8,
    height: 38,
    marginTop: "auto",
  },
  controlsFooter: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xxs,
    justifyContent: "center",
    paddingTop: spacing.xs,
  },
  controlsFooterText: {
    color: colors.brand,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  secondaryGrid: {
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
    borderRadius: 16,
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
  chartBox: {
    gap: spacing.md,
  },
  chartHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chartValue: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 30,
    lineHeight: 38,
  },
  chartCaption: {
    color: colors.textMuted,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  lineChartWrap: {
    alignItems: "center",
    borderRadius: radius.md,
    minHeight: 214,
    overflow: "hidden",
    paddingTop: spacing.sm,
  },
  chartAxis: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 10,
  },
  chartEmpty: {
    alignItems: "center",
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    justifyContent: "center",
    minHeight: 190,
    padding: spacing.lg,
  },
  chartEmptyTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  chartEmptyText: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
  },
  chartLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  legendItem: {
    alignItems: "center",
    backgroundColor: colors.surfaceSubtle,
    borderRadius: 12,
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 42,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  legendDot: {
    borderRadius: radius.pill,
    height: 9,
    width: 9,
  },
  legendLabel: {
    color: colors.textMuted,
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 14,
    textTransform: "uppercase",
  },
  legendValue: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  previewList: {
    gap: spacing.xs,
  },
  previewHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xs,
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
    alignItems: "flex-start",
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md,
  },
  noticeSuccess: {
    backgroundColor: colors.successSurface,
    borderColor: "#BBF7D0",
  },
  noticeError: {
    backgroundColor: colors.criticalSurface,
    borderColor: colors.borderDanger,
  },
  noticeCopy: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  noticeTitle: {
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
  noticeDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  noticeDetailItem: {
    backgroundColor: "rgba(255,255,255,0.62)",
    borderColor: "rgba(15,23,42,0.08)",
    borderRadius: radius.sm,
    borderWidth: 1,
    minWidth: 138,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  noticeDetailLabel: {
    color: colors.textMuted,
    fontFamily: fonts.semiBold,
    fontSize: 10,
    lineHeight: 14,
    textTransform: "uppercase",
  },
  noticeDetailValue: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    lineHeight: 17,
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
    maxWidth: 900,
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
