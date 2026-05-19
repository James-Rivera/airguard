import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  AccountCard,
  ActivityTimelineItem,
  AirGuardLogo,
  AlertCard,
  BottomNav,
  BrandGradient,
  Card,
  DemoAccountCard,
  DeviceCard,
  EmptyState,
  HeroAlertCard,
  HeroStatusCard,
  IconButton,
  MenuRow,
  PrimaryButton,
  ReadingCard,
  ReportSummaryCard,
  RiskBadge,
  RoomCard,
  SafetyChecklistItem,
  Screen,
  SecondaryButton,
  SectionHeader,
  StatusBadge,
  TextField,
  Wordmark,
} from "./src/components";
import { accounts } from "./src/data";
import { actionNoteExamples, createActivity, updateAlertStatus } from "./src/alerts";
import { deriveReport, getActiveAlerts, getReadiness, getUrgentAlert } from "./src/reports";
import { simulateScenario } from "./src/simulations";
import { clearSession, loadAppData, loadSession, resetAppData, saveAppData, saveSession } from "./src/storage";
import { authenticateDemoAccount, createSession, firstName, formatDateTime, formatTime, getActiveTab, getInitialScreen, getPermissions, initials } from "./src/state";
import { colors, layout, spacing, typography } from "./src/theme";
import type { Alert, AlertStatus, AppData, DemoScenario, MainTab, ScreenName, Session } from "./src/types";

export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [screen, setScreen] = useState<ScreenName>("Splash");
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([loadAppData(), loadSession()]).then(([storedData, storedSession]) => {
      setData(storedData);
      setSession(storedSession);
      setScreen(getInitialScreen(storedSession));
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded && data) {
      saveAppData(data);
    }
  }, [data, loaded]);

  const permissions = getPermissions(session?.role);
  const activeAlerts = useMemo(() => (data ? getActiveAlerts(data) : []), [data]);
  const urgentAlert = useMemo(() => (data ? getUrgentAlert(data) : undefined), [data]);
  const selectedAlert = data?.alerts.find((alert) => alert.id === selectedAlertId) ?? urgentAlert ?? data?.alerts[0];
  const activeTab = getActiveTab(screen);
  const showTabs = !["Splash", "Accounts"].includes(screen);

  function update(updater: (current: AppData) => AppData) {
    setData((current) => (current ? updater(current) : current));
  }

  async function login(email: string, password: string) {
    const account = authenticateDemoAccount(email, password);
    if (!account) {
      setLoginError("Invalid email or password.");
      return;
    }

    const nextSession = createSession(account);
    await saveSession(nextSession);
    setSession(nextSession);
    setLoginError("");
    update((current) => ({
      ...current,
      selectedAccountId: account.id,
      activityItems: [
        createActivity(account.name, "Account", "Signed in", `${account.name} signed in to ${account.homeName}.`, "Good"),
        ...current.activityItems,
      ],
    }));
    setScreen("Home");
  }

  async function logout() {
    await clearSession();
    setSession(null);
    setSelectedAlertId(null);
    setNote("");
    setNoteError("");
    setLoginError("");
    setScreen("Accounts");
  }

  function openAlert(alert: Alert) {
    setSelectedAlertId(alert.id);
    setNote("");
    setNoteError("");
    setScreen("AlertDetail");
  }

  function changeAlertStatus(alertId: string, status: AlertStatus, text?: string) {
    update((current) => updateAlertStatus(current, alertId, status, session?.name ?? "AirGuard", text));
  }

  function startAlert(alert: Alert) {
    changeAlertStatus(alert.id, "Checking", session?.role === "Homeowner" ? "Alert acknowledged." : undefined);
    openAlert(alert);
  }

  function runSimulation(scenario: DemoScenario) {
    if (!permissions.canUseSimulationTools) return;
    update((current) => simulateScenario(current, scenario, session?.name ?? "AirGuard"));
    setScreen("Home");
  }

  function markDeviceChecked(deviceId: string) {
    update((current) => {
      const device = current.devices.find((item) => item.id === deviceId);
      if (!device) return current;
      const checkedAt = new Date().toISOString();
      return {
        ...current,
        home: { ...current.home, lastSystemSync: checkedAt },
        devices: current.devices.map((item) =>
          item.id === deviceId
            ? {
                ...item,
                status: "Online",
                latestReading: item.latestReading === "No signal" ? "Connected" : item.latestReading,
                signalStrength: item.signalStrength === "No signal" ? "Good" : item.signalStrength,
                lastChecked: checkedAt,
              }
            : item,
        ),
        activityItems: [
          createActivity(session?.name ?? "AirGuard", "Devices", "Device checked", `${device.name} was checked and is ready.`, "Good", checkedAt),
          ...current.activityItems,
        ],
      };
    });
  }

  function toggleChecklist(itemId: string) {
    update((current) => {
      const item = current.checklistItems.find((entry) => entry.id === itemId);
      if (!item) return current;
      const nextChecked = !item.checked;
      return {
        ...current,
        checklistItems: current.checklistItems.map((entry) => (entry.id === itemId ? { ...entry, checked: nextChecked } : entry)),
        activityItems: [
          createActivity(
            session?.name ?? "AirGuard",
            "Checklist",
            nextChecked ? "Checklist item completed" : "Checklist item reopened",
            item.label,
            nextChecked ? "Good" : "Moderate",
          ),
          ...current.activityItems,
        ],
      };
    });
  }

  async function resetDemo() {
    if (!permissions.canResetDemo) return;
    const fresh = await resetAppData();
    setData({ ...fresh, selectedAccountId: session?.userId ?? null });
    setSelectedAlertId(null);
    setNote("");
    setNoteError("");
    setScreen("Home");
  }

  if (!loaded || !data) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.app}>
          <View style={styles.loading}>
            <ActivityIndicator color={colors.brandBlue} />
            <Text style={styles.loadingText}>Loading AirGuard</Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.app}>
        <StatusBar style={screen === "Splash" ? "light" : "dark"} />
        <View style={styles.phone}>
          {screen === "Splash" ? <WelcomeScreen onGetStarted={() => setScreen("Accounts")} /> : null}
          {screen === "Accounts" ? <LoginScreen error={loginError} onLogin={login} onClearError={() => setLoginError("")} /> : null}
          {screen === "Home" ? (
            <HomeScreen
              data={data}
              session={session}
              urgentAlert={urgentAlert}
              onOpenRooms={() => setScreen("Rooms")}
              onOpenAlert={openAlert}
              onStartAlert={startAlert}
              onResolveAlert={(alert) => changeAlertStatus(alert.id, "Resolved", "Sensor reading returned to normal.")}
            />
          ) : null}
          {screen === "Rooms" ? <RoomsScreen data={data} onRoom={(roomId) => roomId === "kitchen" && setScreen("Kitchen")} /> : null}
          {screen === "Kitchen" ? (
            <KitchenScreen
              data={data}
              role={session?.role}
              onBack={() => setScreen("Rooms")}
              onOpenAlert={openAlert}
              onResolve={(alert) => changeAlertStatus(alert.id, "Resolved", "No visible smoke after inspection.")}
            />
          ) : null}
          {screen === "Alerts" ? <AlertsScreen data={data} role={session?.role} onOpen={openAlert} onStart={startAlert} /> : null}
          {screen === "AlertDetail" && selectedAlert ? (
            <AlertDetailScreen
              alert={selectedAlert}
              note={note}
              noteError={noteError}
              role={session?.role}
              setNote={(value) => {
                setNote(value);
                if (noteError) setNoteError("");
              }}
              onBack={() => setScreen("Alerts")}
              onStart={() => changeAlertStatus(selectedAlert.id, "Checking", session?.role === "Homeowner" ? "Alert acknowledged." : undefined)}
              onActionTaken={() => {
                const actionNote = note.trim();
                if (!actionNote) {
                  setNoteError("Add an action note before marking Action Taken.");
                  return;
                }
                changeAlertStatus(selectedAlert.id, "Action Taken", actionNote);
                setNote("");
                setNoteError("");
              }}
              onResolve={() => {
                changeAlertStatus(selectedAlert.id, "Resolved", note.trim() || "Sensor reading returned to normal.");
                setNote("");
                setNoteError("");
                setScreen("Alerts");
              }}
            />
          ) : null}
          {screen === "Devices" ? <DevicesScreen data={data} onCheck={markDeviceChecked} /> : null}
          {screen === "More" ? (
            <MoreScreen
              session={session}
              data={data}
              permissions={permissions}
              onNavigate={setScreen}
              onReset={resetDemo}
              onLogout={logout}
            />
          ) : null}
          {screen === "DemoControls" && permissions.canUseSimulationTools ? <SimulationToolsScreen onBack={() => setScreen("More")} onRun={runSimulation} /> : null}
          {screen === "Risks" ? <RisksScreen data={data} onBack={() => setScreen("More")} /> : null}
          {screen === "Activity" ? <ActivityScreen data={data} onBack={() => setScreen("More")} /> : null}
          {screen === "Checklist" ? <ChecklistScreen data={data} onBack={() => setScreen("More")} onToggle={toggleChecklist} /> : null}
          {screen === "Reports" ? <ReportsScreen data={data} onBack={() => setScreen("More")} /> : null}
          {screen === "Settings" ? <SettingsScreen onBack={() => setScreen("More")} /> : null}
          {showTabs ? <BottomNav active={activeTab} activeAlerts={activeAlerts.length} onTab={(tab: MainTab) => setScreen(tab)} /> : null}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function WelcomeScreen({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <BrandGradient style={styles.welcome}>
      <View style={styles.logoLockup}>
        <AirGuardLogo size={96} />
        <Text style={styles.welcomeTitle}>AirGuard</Text>
        <Text style={styles.welcomeTagline}>Safer air, smarter homes.</Text>
      </View>
      <Text style={styles.welcomeBody}>Monitor room air, safety alerts, and device health from one calm home view.</Text>
      <Pressable onPress={onGetStarted} style={styles.welcomeButton}>
        <Text style={styles.welcomeButtonText}>Get Started</Text>
      </Pressable>
      <Text style={styles.welcomeFooter}>Demo environment</Text>
    </BrandGradient>
  );
}

function LoginScreen({ error, onLogin, onClearError }: { error: string; onLogin: (email: string, password: string) => void; onClearError: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function fillDemo(accountId: string) {
    const account = accounts.find((item) => item.id === accountId);
    if (!account) return;
    setEmail(account.email);
    setPassword(account.password);
    onClearError();
  }

  return (
    <Screen noBottomNav contentStyle={styles.loginScreen}>
      <View style={styles.loginBrand}>
        <View style={styles.loginLogo}>
          <AirGuardLogo size={38} />
        </View>
        <View>
          <Wordmark size={30} />
          <Text style={styles.demoLabel}>Demo environment</Text>
        </View>
      </View>
      <Text style={styles.loginTitle}>Log in</Text>
      <Text style={styles.loginSubtitle}>Use a local demo account to review Rivera Residence.</Text>
      <View style={styles.formStack}>
        <TextField
          label="Email Address"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            if (error) onClearError();
          }}
          keyboardType="email-address"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            if (error) onClearError();
          }}
          secureTextEntry={!showPassword}
          right={
            <Pressable onPress={() => setShowPassword((current) => !current)} hitSlop={8}>
              <Text style={styles.showPassword}>{showPassword ? "Hide" : "Show"}</Text>
            </Pressable>
          }
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <PrimaryButton label="Sign In" onPress={() => onLogin(email, password)} />
      </View>
      <View style={styles.disabledLinks}>
        <Text style={styles.disabledLink}>Forgot password</Text>
        <Text style={styles.disabledLink}>Create account</Text>
      </View>
      <SectionHeader title="Use demo account" />
      <View style={styles.formStack}>
        {accounts.map((account) => (
          <DemoAccountCard key={account.id} account={account} onPress={() => fillDemo(account.id)} />
        ))}
      </View>
    </Screen>
  );
}

function HomeScreen({
  data,
  session,
  urgentAlert,
  onOpenRooms,
  onOpenAlert,
  onStartAlert,
  onResolveAlert,
}: {
  data: AppData;
  session: Session | null;
  urgentAlert?: Alert;
  onOpenRooms: () => void;
  onOpenAlert: (alert: Alert) => void;
  onStartAlert: (alert: Alert) => void;
  onResolveAlert: (alert: Alert) => void;
}) {
  const latest = data.readings[0];
  const rooms = urgentAlert ? data.rooms.filter((room) => room.id === urgentAlert.roomId) : data.rooms.slice(0, 3);
  const canResolve = session?.role === "Safety Officer" || session?.role === "Administrator";
  return (
    <Screen>
      <View style={styles.homeHeader}>
        <View>
          <Wordmark />
          <Text style={styles.greeting}>Good morning, {firstName(session?.name)}!</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(session?.name)}</Text>
        </View>
      </View>
      <Text style={styles.homeMeta}>{data.home.name} - {data.home.location}</Text>
      {urgentAlert ? (
        <HeroAlertCard
          alert={urgentAlert}
          primaryLabel={session?.role === "Homeowner" ? "Acknowledge" : "Start Checking"}
          onPrimary={() => onStartAlert(urgentAlert)}
          secondaryLabel={canResolve ? "Resolve" : undefined}
          onSecondary={canResolve ? () => onResolveAlert(urgentAlert) : undefined}
        />
      ) : (
        <HeroStatusCard title="Your home air is safe" subtitle="All monitored rooms are within normal range." actionLabel="View Rooms" onAction={onOpenRooms} />
      )}
      <SectionHeader title={urgentAlert ? "Latest Sensor Data" : "Current Readings"} />
      <View style={styles.readingGrid}>
        <ReadingCard label="Temperature" value={`${latest.temperatureC} C`} detail="Comfort" />
        <ReadingCard label="CO2" value={`${latest.co2Ppm} ppm`} detail={latest.co2Ppm > 1000 ? "High" : "Normal"} status={latest.co2Ppm > 1000 ? "Warning" : "Good"} />
        <ReadingCard label="Humidity" value={`${latest.humidityPercent}%`} detail="Indoor" />
        <ReadingCard label="Smoke" value={latest.smokeUgM3 ? `${latest.smokeUgM3} ug/m3` : "Clear"} detail={latest.smokeUgM3 ? "High" : "Clear"} status={latest.smokeUgM3 ? "Critical" : "Good"} />
      </View>
      <SectionHeader title={urgentAlert ? "Room With Issue" : "Rooms"} actionLabel="See all" onAction={onOpenRooms} />
      <View style={styles.roomPreviewGrid}>
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} compact onPress={onOpenRooms} />
        ))}
      </View>
      <SectionHeader title="Alerts" />
      {urgentAlert ? (
        <Pressable onPress={() => onOpenAlert(urgentAlert)}>
          <AlertCard alert={urgentAlert} compact />
        </Pressable>
      ) : (
        <EmptyState title="No active alerts" body="All monitored rooms are within normal range." />
      )}
      <Text style={styles.syncText}>Last synced {formatTime(data.home.lastSystemSync)}</Text>
    </Screen>
  );
}

function RoomsScreen({ data, onRoom }: { data: AppData; onRoom: (roomId: string) => void }) {
  return (
    <Screen title="Rooms" subtitle={`${data.home.name} rooms`}>
      <View style={styles.roomGrid}>
        {data.rooms.map((room) => (
          <RoomCard key={room.id} room={room} compact onPress={() => onRoom(room.id)} />
        ))}
      </View>
    </Screen>
  );
}

function KitchenScreen({ data, role, onBack, onOpenAlert, onResolve }: { data: AppData; role?: Session["role"]; onBack: () => void; onOpenAlert: (alert: Alert) => void; onResolve: (alert: Alert) => void }) {
  const kitchen = data.rooms.find((room) => room.id === "kitchen") ?? data.rooms[0];
  const alert = data.alerts.find((item) => item.roomId === "kitchen" && item.status !== "Resolved");
  const latestKitchenReading = data.readings.find((reading) => reading.roomId === "kitchen");
  const canResolve = role === "Safety Officer" || role === "Administrator";
  return (
    <Screen title="Kitchen" subtitle={kitchen.summary} onBack={onBack}>
      {alert ? (
        <HeroAlertCard
          alert={alert}
          primaryLabel="Open Alert"
          onPrimary={() => onOpenAlert(alert)}
          secondaryLabel={canResolve ? "Resolve" : undefined}
          onSecondary={canResolve ? () => onResolve(alert) : undefined}
        />
      ) : (
        <Card style={styles.safeRoomCard}>
          <Text style={styles.safeRoomTitle}>Kitchen air is clear</Text>
          <Text style={styles.safeRoomBody}>Smoke and gas sensor is clear. Ventilation is ready.</Text>
        </Card>
      )}
      <SectionHeader title="Readings" />
      <View style={styles.readingGrid}>
        <ReadingCard label="Smoke" value={latestKitchenReading?.smokeUgM3 ? `${latestKitchenReading.smokeUgM3} ug/m3` : "Clear"} detail={latestKitchenReading?.smokeUgM3 ? "Very High" : "Clear"} status={latestKitchenReading?.smokeUgM3 ? "Critical" : "Good"} />
        <ReadingCard label="CO2" value={`${kitchen.co2Ppm} ppm`} detail={kitchen.co2Ppm > 1000 ? "High" : "Normal"} status={kitchen.co2Ppm > 1000 ? "Warning" : "Good"} />
        <ReadingCard label="Temperature" value={`${kitchen.temperatureC} C`} detail={kitchen.temperatureC > 29 ? "Warm" : "Normal"} status={kitchen.temperatureC > 29 ? "Warning" : "Good"} />
        <ReadingCard label="Humidity" value={`${kitchen.humidityPercent}%`} detail="Normal" />
      </View>
      <SectionHeader title="Devices" />
      {data.devices.filter((device) => device.roomId === "kitchen").map((device) => <DeviceCard key={device.id} device={device} />)}
    </Screen>
  );
}

function AlertsScreen({ data, role, onOpen, onStart }: { data: AppData; role?: Session["role"]; onOpen: (alert: Alert) => void; onStart: (alert: Alert) => void }) {
  const [filter, setFilter] = useState<"All" | "Active" | "Critical" | "Resolved">("All");
  const active = getActiveAlerts(data);
  const resolved = data.alerts.filter((alert) => alert.status === "Resolved");
  const shownAlerts = data.alerts.filter((alert) => {
    if (filter === "Active") return alert.status !== "Resolved";
    if (filter === "Critical") return alert.riskLevel === "Critical";
    if (filter === "Resolved") return alert.status === "Resolved";
    return true;
  });
  const startLabel = role === "Homeowner" ? "Acknowledge" : "Start Checking";

  return (
    <Screen title="Alerts" subtitle={`${active.length} active, ${resolved.length} resolved`}>
      <View style={styles.summaryRow}>
        <StatCard label="Total alerts" value={data.alerts.length} detail={`${resolved.length} resolved`} />
        <StatCard label="Problems Detected" value={active.length} detail={active.length ? "Needs attention" : "All clear"} />
      </View>
      <View style={styles.filterRow}>
        {(["All", "Active", "Critical", "Resolved"] as const).map((item) => (
          <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filterChip, filter === item && styles.filterChipActive]}>
            <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </View>
      {shownAlerts.length ? (
        shownAlerts.map((alert) => (
          <Pressable key={alert.id} onPress={() => onOpen(alert)}>
            <AlertCard alert={alert} actionLabel={alert.status === "Resolved" ? "Details" : startLabel} onAction={() => (alert.status === "Resolved" ? onOpen(alert) : onStart(alert))} />
          </Pressable>
        ))
      ) : (
        <EmptyState title="No alerts here" body="Alerts matching this view will appear when sensor readings change." />
      )}
    </Screen>
  );
}

function AlertDetailScreen({
  alert,
  note,
  noteError,
  role,
  setNote,
  onBack,
  onStart,
  onActionTaken,
  onResolve,
}: {
  alert: Alert;
  note: string;
  noteError: string;
  role?: Session["role"];
  setNote: (value: string) => void;
  onBack: () => void;
  onStart: () => void;
  onActionTaken: () => void;
  onResolve: () => void;
}) {
  const isHomeowner = role === "Homeowner";
  const isResolved = alert.status === "Resolved";
  return (
    <Screen title="Alert Detail" subtitle={alert.location} onBack={onBack}>
      <AlertCard alert={alert} />
      <Card style={styles.actionCard}>
        <Text style={styles.actionLabel}>Recommended Action</Text>
        <Text style={styles.actionText}>{alert.recommendedAction}</Text>
      </Card>
      {!isHomeowner && !isResolved ? (
        <Card style={styles.noteCard}>
          <Text style={styles.noteTitle}>Action note</Text>
          <TextInput value={note} onChangeText={setNote} placeholder="Add what was checked or changed" multiline style={styles.noteInput} placeholderTextColor={colors.textMuted} />
          {noteError ? <Text style={styles.errorText}>{noteError}</Text> : null}
          <View style={styles.suggestionWrap}>
            {actionNoteExamples.map((item) => (
              <Pressable key={item} onPress={() => setNote(item)} style={styles.suggestionChip}>
                <Text style={styles.suggestionText}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </Card>
      ) : null}
      {!isResolved ? (
        isHomeowner ? (
          <PrimaryButton label="Acknowledge Alert" onPress={onStart} danger={alert.riskLevel === "Critical"} />
        ) : (
          <>
            <View style={styles.actionRow}>
              <PrimaryButton label="Start Checking" onPress={onStart} danger={alert.riskLevel === "Critical"} style={{ flex: 1 }} />
              <SecondaryButton label="Action Taken" onPress={onActionTaken} style={{ flex: 1 }} />
            </View>
            <PrimaryButton label="Resolve Alert" onPress={onResolve} danger={alert.riskLevel === "Critical"} />
          </>
        )
      ) : null}
      <SectionHeader title="Action Timeline" />
      <ActivityTimelineItem item={{ id: `${alert.id}-created`, timestamp: alert.detectedAt, actorName: "AirGuard", category: "Alerts", title: "Alert created", description: alert.description, level: alert.riskLevel }} />
      {alert.notes.map((item) => (
        <ActivityTimelineItem key={item.id} item={{ id: item.id, timestamp: item.createdAt, actorName: item.actorName, category: "Alerts", title: item.actorName, description: item.text, level: alert.status === "Resolved" ? "Good" : alert.riskLevel }} />
      ))}
    </Screen>
  );
}

function DevicesScreen({ data, onCheck }: { data: AppData; onCheck: (deviceId: string) => void }) {
  const online = data.devices.filter((device) => device.status === "Online").length;
  return (
    <Screen title="Devices" subtitle={`${online} of ${data.devices.length} online`}>
      <View style={styles.summaryRow}>
        <StatCard label="Total Devices" value={data.devices.length} detail={`${online} online`} />
        <StatCard label="Rooms" value={data.rooms.length} detail={`${data.rooms.filter((room) => room.status !== "Good").length} need attention`} />
      </View>
      {data.devices.map((device) => <DeviceCard key={device.id} device={device} onPress={() => onCheck(device.id)} />)}
    </Screen>
  );
}

function MoreScreen({
  session,
  data,
  permissions,
  onNavigate,
  onReset,
  onLogout,
}: {
  session: Session | null;
  data: AppData;
  permissions: ReturnType<typeof getPermissions>;
  onNavigate: (screen: ScreenName) => void;
  onReset: () => void;
  onLogout: () => void;
}) {
  const safeSession = session ?? createSession(accounts[0]);
  const homeSafety: Array<[ScreenName, string, string]> = permissions.canViewSafetyTools
    ? [
        ["Risks", "Risks", "Safety priorities for the home"],
        ["Activity", "Activity", "Recent alerts and response actions"],
        ["Checklist", "Safety Checklist", "Readiness items for home safety"],
        ["Reports", "Reports", "Snapshot of home air safety"],
      ]
    : [["Reports", "Reports", "Snapshot of home air safety"]];

  const systemItems: Array<[ScreenName, string, string]> = [
    ["Devices", "Devices", "Sensor and hardware health"],
    ["Settings", "Settings", "App, storage, and hardware notes"],
  ];
  if (permissions.canUseSimulationTools) systemItems.splice(1, 0, ["DemoControls", "Simulation Tools", "Simulate local sensor states"]);

  return (
    <Screen title="More">
      <AccountCard session={safeSession} homeName={data.home.name} />
      <SectionHeader title="Home Safety" />
      {homeSafety.map(([target, label, description]) => (
        <MenuRow key={target} label={label} description={description} onPress={() => onNavigate(target)} />
      ))}
      <SectionHeader title="System" />
      {systemItems.map(([target, label, description]) => (
        <MenuRow key={target} label={label} description={description} onPress={() => onNavigate(target)} />
      ))}
      {permissions.canResetDemo ? <MenuRow label="Reset Demo Data" description="Restore safe readings and clear review changes" onPress={onReset} danger /> : null}
      <MenuRow label="Logout" description="Return to sign in" onPress={onLogout} />
    </Screen>
  );
}

function SimulationToolsScreen({ onBack, onRun }: { onBack: () => void; onRun: (scenario: DemoScenario) => void }) {
  const scenarios: Array<{ label: DemoScenario; description: string }> = [
    { label: "Normal Reading", description: "Return readings and devices to baseline without resolving open alerts." },
    { label: "High CO2", description: "Raise bedroom CO2 and create a ventilation warning." },
    { label: "Smoke Detected", description: "Create a critical kitchen smoke alert." },
    { label: "Sensor Offline", description: "Take the living room air sensor offline." },
    { label: "Poor Ventilation", description: "Turn off kitchen ventilation and create a warning." },
  ];
  return (
    <Screen title="Simulation Tools" subtitle="Local sensor states for MVP testing." onBack={onBack}>
      <Card style={styles.infoCard}>
        <Text style={styles.infoTitle}>Sensor simulation</Text>
        <Text style={styles.infoBody}>These controls update local simulated sensor data and are visible only to response roles.</Text>
      </Card>
      {scenarios.map((scenario) => (
        <MenuRow key={scenario.label} label={scenario.label} description={scenario.description} onPress={() => onRun(scenario.label)} />
      ))}
    </Screen>
  );
}

function RisksScreen({ data, onBack }: { data: AppData; onBack: () => void }) {
  return (
    <Screen title="Risks" subtitle={`Readiness: ${getReadiness(data)}%`} onBack={onBack}>
      {data.risks.map((risk) => (
        <Card key={risk.id} style={styles.infoCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.infoTitle}>{risk.title}</Text>
            <RiskBadge level={risk.riskLevel} />
          </View>
          <Text style={styles.infoBody}>{risk.whyItMatters}</Text>
          <Text style={styles.actionLabel}>Prevention</Text>
          <Text style={styles.infoBody}>{risk.recommendedPrevention}</Text>
        </Card>
      ))}
    </Screen>
  );
}

function ActivityScreen({ data, onBack }: { data: AppData; onBack: () => void }) {
  return (
    <Screen title="Activity" subtitle="Recent home safety events." onBack={onBack}>
      {data.activityItems.map((item) => <ActivityTimelineItem key={item.id} item={item} />)}
    </Screen>
  );
}

function ChecklistScreen({ data, onBack, onToggle }: { data: AppData; onBack: () => void; onToggle: (itemId: string) => void }) {
  return (
    <Screen title="Safety Checklist" subtitle={`Readiness: ${getReadiness(data)}%`} onBack={onBack}>
      {data.checklistItems.map((item) => <SafetyChecklistItem key={item.id} item={item} onToggle={() => onToggle(item.id)} />)}
    </Screen>
  );
}

function ReportsScreen({ data, onBack }: { data: AppData; onBack: () => void }) {
  const report = deriveReport(data);
  return (
    <Screen title="Reports" subtitle={`Generated ${formatDateTime(report.generatedAt)}`} onBack={onBack}>
      <ReportSummaryCard report={report} />
      <SectionHeader title="Recent Actions" />
      {report.recentActions.length ? report.recentActions.map((item) => <ActivityTimelineItem key={item.id} item={item} />) : <EmptyState title="No recent actions" body="Actions will appear after alerts or checklist updates." />}
      <Text style={styles.reportFooter}>Generated from local demo data.</Text>
    </Screen>
  );
}

function SettingsScreen({ onBack }: { onBack: () => void }) {
  return (
    <Screen title="Settings" subtitle="App details and future integrations." onBack={onBack}>
      <Card style={styles.infoCard}>
        <Text style={styles.infoTitle}>Demo environment</Text>
        <Text style={styles.infoBody}>This MVP uses simulated sensor data for demonstration.</Text>
      </Card>
      <InfoRow label="App version" value="0.1.0" />
      <InfoRow label="Storage" value="Local demo storage with AsyncStorage" />
      <InfoRow label="Hardware" value="Simulated sensors" />
      <InfoRow label="Future integration" value="ESP32 or Arduino sensors, real authentication, database sync, and push notifications" />
    </Screen>
  );
}

function StatCard({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <Card style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statDetail}>{detail}</Text>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Card style={styles.infoRow}>
      <Text style={styles.infoTitle}>{label}</Text>
      <Text style={styles.infoBody}>{value}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  app: {
    backgroundColor: colors.background,
    flex: 1,
  },
  phone: {
    alignSelf: "center",
    backgroundColor: colors.background,
    flex: 1,
    maxWidth: layout.maxPhoneWidth,
    overflow: "hidden",
    width: "100%",
  },
  loading: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
    marginTop: spacing.sm,
  },
  welcome: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
  },
  logoLockup: {
    alignItems: "center",
    gap: spacing.sm,
  },
  welcomeTitle: {
    color: colors.white,
    fontSize: 34,
    fontWeight: "900",
  },
  welcomeTagline: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 16,
    fontWeight: "800",
  },
  welcomeBody: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.xxl,
    textAlign: "center",
  },
  welcomeButton: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 18,
    height: 52,
    justifyContent: "center",
    marginTop: spacing.xxl,
    width: "100%",
  },
  welcomeButtonText: {
    color: colors.brandBlue,
    fontSize: 16,
    fontWeight: "900",
  },
  welcomeFooter: {
    bottom: spacing.xl,
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: "800",
    position: "absolute",
  },
  loginScreen: {
    paddingTop: spacing.xxl,
  },
  loginBrand: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  loginLogo: {
    alignItems: "center",
    backgroundColor: colors.brandBlue,
    borderRadius: 18,
    height: 50,
    justifyContent: "center",
    width: 50,
  },
  demoLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },
  loginTitle: {
    ...typography.hero,
    color: colors.textPrimary,
    marginTop: spacing.xl,
  },
  loginSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  formStack: {
    gap: spacing.sm,
  },
  showPassword: {
    color: colors.brandBlue,
    fontSize: 12,
    fontWeight: "900",
  },
  errorText: {
    color: colors.critical,
    fontSize: 13,
    fontWeight: "800",
  },
  disabledLinks: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  disabledLink: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "800",
  },
  homeHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  greeting: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.softBlue,
    borderRadius: 999,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  avatarText: {
    color: colors.brandBlue,
    fontSize: 13,
    fontWeight: "900",
  },
  homeMeta: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },
  readingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  roomPreviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  roomGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  syncText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  safeRoomCard: {
    backgroundColor: colors.softGreen,
    borderColor: "#BBF7D0",
    padding: spacing.lg,
  },
  safeRoomTitle: {
    ...typography.title,
    color: colors.textPrimary,
  },
  safeRoomBody: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  summaryRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    minHeight: 104,
    padding: spacing.md,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "800",
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: "900",
    marginTop: spacing.xs,
  },
  statDetail: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  filterChip: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  filterChipActive: {
    backgroundColor: colors.brandBlue,
    borderColor: colors.brandBlue,
  },
  filterText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "900",
  },
  filterTextActive: {
    color: colors.white,
  },
  actionCard: {
    padding: spacing.lg,
  },
  actionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  actionText: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "800",
    lineHeight: 24,
    marginTop: spacing.xs,
  },
  noteCard: {
    gap: spacing.sm,
    padding: spacing.lg,
  },
  noteTitle: {
    ...typography.section,
    color: colors.textPrimary,
  },
  noteInput: {
    backgroundColor: colors.slate50,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    color: colors.textPrimary,
    minHeight: 96,
    padding: spacing.md,
    textAlignVertical: "top",
  },
  suggestionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  suggestionChip: {
    backgroundColor: colors.softBlue,
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  suggestionText: {
    color: colors.brandBlue,
    fontSize: 12,
    fontWeight: "800",
  },
  actionRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  infoCard: {
    gap: spacing.sm,
    padding: spacing.lg,
  },
  infoRow: {
    padding: spacing.lg,
  },
  infoTitle: {
    ...typography.section,
    color: colors.textPrimary,
  },
  infoBody: {
    ...typography.body,
    color: colors.textSecondary,
  },
  cardHeaderRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reportFooter: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
});
