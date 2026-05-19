import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  AirGuardLogo,
  BottomTabs,
  BrandGradient,
  Card,
  MetricTile,
  PrimaryButton,
  SecondaryButton,
  SectionTitle,
  StatusBadge,
  Wordmark,
} from "./src/components";
import { accounts, createInitialData } from "./src/data";
import { loadAppData, resetAppData, saveAppData } from "./src/storage";
import { colors, statusColor } from "./src/theme";
import type { Account, Alert, AlertStatus, AppData, DemoScenario, MainTab, ScreenName } from "./src/types";

export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [screen, setScreen] = useState<ScreenName>("Splash");
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadAppData().then((stored) => {
      setData(stored);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded && data) {
      saveAppData(data);
    }
  }, [data, loaded]);

  const account = useMemo(() => accounts.find((item) => item.id === data?.selectedAccountId) ?? null, [data?.selectedAccountId]);
  const activeAlerts = useMemo(() => data?.alerts.filter((alert) => alert.status !== "Resolved") ?? [], [data?.alerts]);
  const urgentAlert = useMemo(() => activeAlerts.find((alert) => alert.riskLevel === "Critical") ?? activeAlerts[0], [activeAlerts]);
  const selectedAlert = data?.alerts.find((alert) => alert.id === selectedAlertId) ?? urgentAlert ?? data?.alerts[0];
  const activeTab = getActiveTab(screen);

  if (!data) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.loading}>
          <ActivityIndicator color={colors.brandBlue} />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  function update(updater: (current: AppData) => AppData) {
    setData((current) => (current ? updater(current) : current));
  }

  function chooseAccount(nextAccount: Account) {
    update((current) => ({
      ...current,
      selectedAccountId: nextAccount.id,
      activityItems: [
        createActivity(nextAccount.name, "Account", "Account selected", `${nextAccount.name} continued as ${nextAccount.role}.`, "Good"),
        ...current.activityItems,
      ],
    }));
    setScreen("Home");
  }

  function goFromSplash() {
    setScreen(data?.selectedAccountId ? "Home" : "Accounts");
  }

  function runDemo(scenario: DemoScenario) {
    update((current) => simulateScenario(current, scenario, account?.name ?? "AirGuard"));
  }

  function changeAlertStatus(alertId: string, status: AlertStatus, text?: string) {
    update((current) => updateAlert(current, alertId, status, text, account?.name ?? "AirGuard"));
  }

  function markDeviceChecked(deviceId: string) {
    update((current) => {
      const device = current.devices.find((item) => item.id === deviceId);
      if (!device) return current;
      const checkedAt = new Date().toISOString();
      return {
        ...current,
        devices: current.devices.map((item) =>
          item.id === deviceId
            ? {
                ...item,
                status: "Online",
                latestReading: item.latestReading === "No signal" ? "Connected" : item.latestReading,
                lastChecked: checkedAt,
              }
            : item,
        ),
        activityItems: [
          createActivity(account?.name ?? "AirGuard", "Devices", "Device marked checked", `${device.name} was checked in prototype mode.`, "Good"),
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
            account?.name ?? "AirGuard",
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
    const fresh = await resetAppData();
    setData(fresh);
    setSelectedAlertId(null);
    setNote("");
    setScreen("Splash");
  }

  const showTabs = screen !== "Splash" && screen !== "Accounts";

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.app}>
        <StatusBar style={screen === "Splash" ? "light" : "dark"} />
        <View style={styles.phone}>
          {screen === "Splash" ? <SplashScreen onContinue={goFromSplash} /> : null}
          {screen === "Accounts" ? <AccountsScreen onChoose={chooseAccount} /> : null}
          {screen === "Home" ? <HomeScreen data={data} account={account} urgentAlert={urgentAlert} onDemo={runDemo} onOpenRooms={() => setScreen("Rooms")} onOpenAlert={(alert) => { setSelectedAlertId(alert.id); setScreen("AlertDetail"); }} onStartAlert={(alert) => { changeAlertStatus(alert.id, "Checking"); setSelectedAlertId(alert.id); setScreen("AlertDetail"); }} onResolveAlert={(alert) => changeAlertStatus(alert.id, "Resolved", "Resolved from Home during prototype review.")} /> : null}
          {screen === "Rooms" ? <RoomsScreen data={data} onKitchen={() => setScreen("Kitchen")} /> : null}
          {screen === "Kitchen" ? <KitchenScreen data={data} alert={urgentAlert?.roomId === "kitchen" ? urgentAlert : undefined} onBack={() => setScreen("Rooms")} onOpenAlert={(alert) => { setSelectedAlertId(alert.id); setScreen("AlertDetail"); }} onResolve={(alert) => changeAlertStatus(alert.id, "Resolved", "Kitchen checked and alert resolved.")} /> : null}
          {screen === "Alerts" ? <AlertsScreen data={data} onOpen={(alert) => { setSelectedAlertId(alert.id); setScreen("AlertDetail"); }} onStart={(alert) => changeAlertStatus(alert.id, "Checking")} /> : null}
          {screen === "AlertDetail" && selectedAlert ? <AlertDetailScreen alert={selectedAlert} note={note} setNote={setNote} onBack={() => setScreen("Alerts")} onStart={() => changeAlertStatus(selectedAlert.id, "Checking")} onActionTaken={() => { changeAlertStatus(selectedAlert.id, "Action Taken", note.trim() || "Checked the room and followed the recommended action."); setNote(""); }} onResolve={() => { changeAlertStatus(selectedAlert.id, "Resolved", note.trim() || "Alert resolved after action was verified."); setNote(""); setScreen("Alerts"); }} /> : null}
          {screen === "Devices" ? <DevicesScreen data={data} onCheck={markDeviceChecked} /> : null}
          {screen === "More" ? <MoreScreen account={account} onNavigate={setScreen} onReset={resetDemo} onSwitchAccount={() => setScreen("Accounts")} /> : null}
          {screen === "Risks" ? <RisksScreen data={data} onBack={() => setScreen("More")} /> : null}
          {screen === "Activity" ? <ActivityScreen data={data} onBack={() => setScreen("More")} /> : null}
          {screen === "Checklist" ? <ChecklistScreen data={data} onBack={() => setScreen("More")} onToggle={toggleChecklist} /> : null}
          {screen === "Reports" ? <ReportsScreen data={data} onBack={() => setScreen("More")} /> : null}
          {showTabs ? <BottomTabs active={activeTab} activeAlerts={activeAlerts.length} onTab={setScreen} /> : null}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function SplashScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <Pressable onPress={onContinue} style={styles.full}>
      <BrandGradient style={styles.splash}>
        <AirGuardLogo size={125} />
        <Text style={styles.splashHint}>Tap to continue</Text>
      </BrandGradient>
    </Pressable>
  );
}

function AccountsScreen({ onChoose }: { onChoose: (account: Account) => void }) {
  const [selected, setSelected] = useState(accounts[2]);
  return (
    <ScreenScroll noTabs>
      <View style={styles.accountLogoRow}>
        <BrandGradient style={styles.logoBox}>
          <AirGuardLogo size={38} />
        </BrandGradient>
        <View>
          <Wordmark />
          <Text style={styles.caption}>Prototype accounts</Text>
        </View>
      </View>
      <Text style={styles.largeTitle}>Welcome to AirGuard</Text>
      <Text style={styles.subtitle}>Choose an account to continue.</Text>
      <View style={{ gap: 12, marginTop: 28 }}>
        {accounts.map((item) => {
          const active = selected.id === item.id;
          return (
            <Pressable key={item.id} onPress={() => setSelected(item)} style={[styles.accountCard, active && styles.accountCardActive]}>
              <View style={[styles.avatar, active && { backgroundColor: colors.brandBlue }]}>
                <Text style={[styles.avatarText, active && { color: "white" }]}>{item.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.body}>{item.role}</Text>
                <Text style={styles.caption}>{item.description}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      <Card style={{ marginTop: 20, padding: 16 }}>
        <Text style={styles.body}>These are prototype accounts for demo only. Real sign in can be added before production hardware integration.</Text>
      </Card>
      <PrimaryButton label="Continue" onPress={() => onChoose(selected)} />
    </ScreenScroll>
  );
}

function HomeScreen({ data, account, urgentAlert, onDemo, onOpenRooms, onOpenAlert, onStartAlert, onResolveAlert }: { data: AppData; account: Account | null; urgentAlert?: Alert; onDemo: (scenario: DemoScenario) => void; onOpenRooms: () => void; onOpenAlert: (alert: Alert) => void; onStartAlert: (alert: Alert) => void; onResolveAlert: (alert: Alert) => void }) {
  const latest = data.readings[0];
  const safe = !urgentAlert;
  return (
    <ScreenScroll>
      <HomeHeader account={account} urgent={Boolean(urgentAlert)} />
      {urgentAlert ? (
        <BrandGradient style={[styles.heroCard, { backgroundColor: colors.critical }]}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroIcon}><Text style={styles.heroIconText}>!</Text></View>
            <View style={styles.heroPill}><Text style={styles.heroPillText}>Critical</Text></View>
          </View>
          <Text style={styles.heroTitle}>Critical Air Alert</Text>
          <Text style={styles.heroSubtitle}>{urgentAlert.title}. {urgentAlert.description}</Text>
          <View style={styles.heroActions}>
            <Pressable onPress={() => onStartAlert(urgentAlert)} style={styles.heroButton}><Text style={styles.heroButtonText}>Start Checking</Text></Pressable>
            <Pressable onPress={() => onResolveAlert(urgentAlert)} style={styles.heroGhostButton}><Text style={styles.heroGhostText}>Resolve</Text></Pressable>
          </View>
        </BrandGradient>
      ) : (
        <BrandGradient style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroIcon}><Text style={styles.heroIconText}>OK</Text></View>
            <View style={styles.heroPill}><View style={styles.dot} /><Text style={styles.heroPillText}>Good</Text></View>
          </View>
          <Text style={styles.heroTitle}>Your home air is safe</Text>
          <Text style={styles.heroSubtitle}>All monitored rooms are within normal air quality range.</Text>
          <Pressable onPress={onOpenRooms} style={styles.heroButton}><Text style={styles.heroButtonText}>View Rooms</Text></Pressable>
        </BrandGradient>
      )}

      <SectionTitle>{safe ? "Today's Readings" : "Current Readings"}</SectionTitle>
      <View style={styles.metricGrid}>
        <MetricTile label="Temperature" value={`${latest.temperatureC} C`} detail="Comfortable" />
        <MetricTile label="CO2" value={`${latest.co2Ppm} ppm`} detail={latest.co2Ppm > 1000 ? "High" : "Normal"} />
        <MetricTile label="Humidity" value={`${latest.humidityPercent}%`} detail="Optimal" />
        <MetricTile label="Smoke" value={`${latest.smokeUgM3}`} detail={latest.smokeUgM3 > 0 ? "Very High" : "Clear"} />
      </View>

      <SectionTitle>Rooms</SectionTitle>
      {data.rooms.slice(0, urgentAlert ? 1 : 4).map((room) => (
        <Pressable key={room.id} onPress={() => room.id === "kitchen" ? onOpenRooms() : undefined}>
          <RoomCard room={room} />
        </Pressable>
      ))}

      <SectionTitle>Active Alerts</SectionTitle>
      {urgentAlert ? (
        <Pressable onPress={() => onOpenAlert(urgentAlert)}>
          <AlertCard alert={urgentAlert} />
        </Pressable>
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={styles.cardTitle}>No active alerts</Text>
          <Text style={styles.body}>AirGuard will notify you if anything changes.</Text>
        </Card>
      )}

      <SectionTitle>Demo Controls</SectionTitle>
      <View style={styles.demoGrid}>
        {(["High CO2", "Smoke", "Offline", "Ventilation"] as DemoScenario[]).map((scenario) => (
          <Pressable key={scenario} onPress={() => onDemo(scenario)} style={[styles.demoButton, scenario === "Smoke" && { backgroundColor: "#FEF2F2", borderColor: "#FECACA" }]}>
            <Text style={[styles.demoText, scenario === "Smoke" && { color: colors.critical }]}>{scenario}</Text>
          </Pressable>
        ))}
      </View>
      <SecondaryButton label="Restore Safe State" onPress={() => onDemo("Normal")} />
    </ScreenScroll>
  );
}

function HomeHeader({ account, urgent }: { account: Account | null; urgent: boolean }) {
  return (
    <View style={styles.homeHeader}>
      <View style={styles.headerTop}>
        <MenuGlyph />
        <View style={styles.avatar}><Text style={styles.avatarText}>{account?.initials ?? "AG"}</Text></View>
      </View>
      <View style={styles.userInfo}>
        <View>
          <Wordmark />
          <Text style={styles.greeting}>{urgent ? "Immediate attention needed" : `Good morning, ${account?.name.split(" ")[0] ?? "Carlo"}!`}</Text>
        </View>
        <BrandGradient style={styles.addDeviceButton}><Text style={styles.addDeviceText}>Add Device</Text></BrandGradient>
      </View>
    </View>
  );
}

function MenuGlyph() {
  return (
    <View style={styles.menuGlyph}>
      <View style={styles.menuBar} />
      <View style={styles.menuBar} />
      <View style={styles.menuBar} />
    </View>
  );
}

function RoomsScreen({ data, onKitchen }: { data: AppData; onKitchen: () => void }) {
  return (
    <ScreenScroll title="Rooms" subtitle="Monitor air quality by room.">
      {data.rooms.map((room) => (
        <Pressable key={room.id} onPress={() => room.id === "kitchen" ? onKitchen() : undefined}>
          <RoomCard room={room} />
        </Pressable>
      ))}
    </ScreenScroll>
  );
}

function KitchenScreen({ data, alert, onBack, onOpenAlert, onResolve }: { data: AppData; alert?: Alert; onBack: () => void; onOpenAlert: (alert: Alert) => void; onResolve: (alert: Alert) => void }) {
  const kitchen = data.rooms.find((room) => room.id === "kitchen")!;
  return (
    <ScreenScroll title="Kitchen" subtitle="Smoke, gas, CO2, temperature, and fan status." onBack={onBack}>
      <StatusBadge status={kitchen.status} />
      <Card style={{ marginTop: 12, padding: 20, borderColor: kitchen.status === "Critical" ? colors.critical : colors.border }}>
        <Text style={styles.largeCardTitle}>{alert ? "Smoke detected" : "No active kitchen alert"}</Text>
        <Text style={styles.body}>{alert ? "Check the kitchen immediately and turn on ventilation if safe." : "Smoke and gas sensor is clear. Ventilation is ready."}</Text>
        {alert ? (
          <View style={styles.twoColumn}>
            <PrimaryButton label="Open Alert" onPress={() => onOpenAlert(alert)} danger />
            <SecondaryButton label="Resolve" onPress={() => onResolve(alert)} />
          </View>
        ) : null}
      </Card>
      <SectionTitle>Readings</SectionTitle>
      <View style={styles.metricGrid}>
        <MetricTile label="Smoke" value={kitchen.status === "Critical" ? "215" : "0"} detail={kitchen.status === "Critical" ? "Very High" : "Clear"} />
        <MetricTile label="CO2" value={`${kitchen.co2Ppm} ppm`} detail={kitchen.co2Ppm > 1000 ? "High" : "Normal"} />
        <MetricTile label="Temperature" value={`${kitchen.temperatureC} C`} detail="Kitchen" />
        <MetricTile label="Humidity" value={`${kitchen.humidityPercent}%`} detail="Indoor range" />
      </View>
      <SectionTitle>Devices</SectionTitle>
      {data.devices.filter((device) => device.roomId === "kitchen").map((device) => <DeviceCard key={device.id} device={device} />)}
    </ScreenScroll>
  );
}

function AlertsScreen({ data, onOpen, onStart }: { data: AppData; onOpen: (alert: Alert) => void; onStart: (alert: Alert) => void }) {
  return (
    <ScreenScroll title="Alerts" subtitle="Review active and past air safety alerts.">
      {data.alerts.map((alert) => (
        <Pressable key={alert.id} onPress={() => onOpen(alert)}>
          <AlertCard alert={alert}>
            <View style={styles.twoColumn}>
              <PrimaryButton label="Start Checking" onPress={() => onStart(alert)} danger={alert.riskLevel === "Critical"} />
              <SecondaryButton label="Details" onPress={() => onOpen(alert)} />
            </View>
          </AlertCard>
        </Pressable>
      ))}
    </ScreenScroll>
  );
}

function AlertDetailScreen({ alert, note, setNote, onBack, onStart, onActionTaken, onResolve }: { alert: Alert; note: string; setNote: (value: string) => void; onBack: () => void; onStart: () => void; onActionTaken: () => void; onResolve: () => void }) {
  return (
    <ScreenScroll title="Alert Detail" subtitle={alert.location} onBack={onBack}>
      <AlertCard alert={alert} />
      <Card style={{ padding: 16 }}>
        <Text style={styles.label}>Recommended Action</Text>
        <Text style={styles.body}>{alert.recommendedAction}</Text>
      </Card>
      <TextInput value={note} onChangeText={setNote} placeholder="Add action note" multiline style={styles.noteInput} placeholderTextColor={colors.textMuted} />
      <View style={styles.twoColumn}>
        <PrimaryButton label="Start Checking" onPress={onStart} danger={alert.riskLevel === "Critical"} />
        <SecondaryButton label="Action Taken" onPress={onActionTaken} />
      </View>
      <PrimaryButton label="Resolve" onPress={onResolve} danger />
      <SectionTitle>Action Timeline</SectionTitle>
      <Timeline title="Alert created" description={alert.description} />
      {alert.notes.map((item) => <Timeline key={item.id} title="Action note added" description={item.text} />)}
    </ScreenScroll>
  );
}

function DevicesScreen({ data, onCheck }: { data: AppData; onCheck: (deviceId: string) => void }) {
  return (
    <ScreenScroll title="Devices" subtitle="Connected air safety devices.">
      {data.devices.map((device) => <DeviceCard key={device.id} device={device} onCheck={() => onCheck(device.id)} />)}
    </ScreenScroll>
  );
}

function MoreScreen({ account, onNavigate, onReset, onSwitchAccount }: { account: Account | null; onNavigate: (screen: ScreenName) => void; onReset: () => void; onSwitchAccount: () => void }) {
  const items: Array<[ScreenName, string, string]> = [
    ["Risks", "Risks", "Home safety risk readiness"],
    ["Activity", "Activity", "Recent actions and system events"],
    ["Checklist", "Safety Checklist", "Readiness checks for the prototype"],
    ["Reports", "Reports", "Presentation-ready summary"],
  ];
  return (
    <ScreenScroll title="More" subtitle="Secondary tools for the AirGuard prototype.">
      <Card style={{ padding: 18 }}>
        <View style={styles.accountRow}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{account?.initials ?? "AG"}</Text></View>
          <View>
            <Text style={styles.cardTitle}>{account?.name ?? "No account selected"}</Text>
            <Text style={styles.body}>{account?.role ?? "Prototype account"}</Text>
          </View>
        </View>
      </Card>
      {items.map(([target, label, description]) => (
        <Pressable key={target} onPress={() => onNavigate(target)} style={styles.menuCard}>
          <View>
            <Text style={styles.cardTitle}>{label}</Text>
            <Text style={styles.body}>{description}</Text>
          </View>
          <Text style={styles.chevron}>{">"}</Text>
        </Pressable>
      ))}
      <View style={styles.twoColumn}>
        <SecondaryButton label="Switch Account" onPress={onSwitchAccount} />
        <SecondaryButton label="Reset Demo" onPress={onReset} />
      </View>
    </ScreenScroll>
  );
}

function RisksScreen({ data, onBack }: { data: AppData; onBack: () => void }) {
  const readiness = getReadiness(data);
  return (
    <ScreenScroll title="Home Safety Risks" subtitle={`Risk Readiness: ${readiness}%`} onBack={onBack}>
      {data.risks.map((risk) => (
        <Card key={risk.id} style={{ padding: 16 }}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>{risk.title}</Text>
            <StatusBadge status={risk.riskLevel} />
          </View>
          <Text style={styles.body}>{risk.whyItMatters}</Text>
          <Text style={styles.label}>Recommended prevention</Text>
          <Text style={styles.body}>{risk.recommendedPrevention}</Text>
          <View style={styles.metricGrid}>
            <MetricTile label="Likelihood" value={risk.likelihood} />
            <MetricTile label="Impact" value={risk.impact} />
          </View>
        </Card>
      ))}
    </ScreenScroll>
  );
}

function ActivityScreen({ data, onBack }: { data: AppData; onBack: () => void }) {
  return (
    <ScreenScroll title="Activity" subtitle="Recent actions and system events." onBack={onBack}>
      {data.activityItems.map((item) => (
        <Card key={item.id} style={{ padding: 16 }}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <StatusBadge status={item.level} />
          </View>
          <Text style={styles.body}>{item.description}</Text>
          <Text style={styles.caption}>{item.actorName} - {item.category}</Text>
        </Card>
      ))}
    </ScreenScroll>
  );
}

function ChecklistScreen({ data, onBack, onToggle }: { data: AppData; onBack: () => void; onToggle: (itemId: string) => void }) {
  return (
    <ScreenScroll title="Safety Checklist" subtitle={`Safety readiness: ${getReadiness(data)}%`} onBack={onBack}>
      {data.checklistItems.map((item) => (
        <Pressable key={item.id} onPress={() => onToggle(item.id)} style={styles.checkRow}>
          <View style={[styles.checkCircle, item.checked && { backgroundColor: colors.safe }]}><Text style={styles.checkMark}>{item.checked ? "OK" : ""}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.label}</Text>
            <Text style={styles.body}>{item.group}</Text>
          </View>
        </Pressable>
      ))}
    </ScreenScroll>
  );
}

function ReportsScreen({ data, onBack }: { data: AppData; onBack: () => void }) {
  const active = data.alerts.filter((alert) => alert.status !== "Resolved");
  return (
    <ScreenScroll title="Safety Report" subtitle="Presentation-ready report summary." onBack={onBack}>
      <BrandGradient style={styles.reportHero}>
        <Text style={styles.heroTitle}>Indoor air safety snapshot</Text>
        <Text style={styles.heroSubtitle}>Mock hardware data is used for this prototype report.</Text>
      </BrandGradient>
      <View style={styles.metricGrid}>
        <MetricTile label="Total alerts" value={data.alerts.length} />
        <MetricTile label="Active alerts" value={active.length} />
        <MetricTile label="Resolved" value={data.alerts.filter((alert) => alert.status === "Resolved").length} />
        <MetricTile label="Readiness" value={`${getReadiness(data)}%`} />
      </View>
      <SectionTitle>Recent Actions</SectionTitle>
      {data.activityItems.slice(0, 4).map((item) => <Timeline key={item.id} title={item.title} description={item.description} />)}
    </ScreenScroll>
  );
}

function ScreenScroll({ children, title, subtitle, onBack, noTabs = false }: { children: React.ReactNode; title?: string; subtitle?: string; onBack?: () => void; noTabs?: boolean }) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, noTabs && { paddingBottom: 28 }]} showsVerticalScrollIndicator={false}>
      {title ? (
        <View style={styles.pageHeader}>
          {onBack ? <Pressable onPress={onBack} style={styles.backButton}><Text style={styles.backText}>{"<"}</Text></Pressable> : null}
          <Text style={styles.pageTitle}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      ) : null}
      {children}
    </ScrollView>
  );
}

function RoomCard({ room }: { room: AppData["rooms"][number] }) {
  return (
    <Card style={styles.roomCard}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.cardTitle}>{room.name}</Text>
        <StatusBadge status={room.status} />
      </View>
      <Text style={styles.body}>{room.mainReading}</Text>
      <View style={styles.roomMetrics}>
        <MiniMetric label="CO2" value={room.co2Ppm} />
        <MiniMetric label="Humidity" value={`${room.humidityPercent}%`} />
        <MiniMetric label="Temp" value={`${room.temperatureC}C`} />
        <MiniMetric label="Smoke" value={room.smokeGas === "Clear" ? 0 : "High"} />
      </View>
    </Card>
  );
}

function MiniMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.miniMetric}>
      <Text style={styles.miniLabel}>{label}</Text>
      <Text style={styles.miniValue}>{value}</Text>
    </View>
  );
}

function AlertCard({ alert, children }: { alert: Alert; children?: React.ReactNode }) {
  return (
    <Card style={{ padding: 16, borderColor: alert.riskLevel === "Critical" ? colors.critical : colors.border }}>
      <View style={styles.cardHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{alert.title}</Text>
          <Text style={styles.body}>{alert.location}</Text>
        </View>
        <StatusBadge status={alert.riskLevel} />
      </View>
      <Text style={styles.body}>{alert.description}</Text>
      <View style={styles.badgeRow}><StatusBadge status={alert.status} /></View>
      <Text style={styles.label}>Recommended Action</Text>
      <Text style={styles.body}>{alert.recommendedAction}</Text>
      {children}
    </Card>
  );
}

function DeviceCard({ device, onCheck }: { device: AppData["devices"][number]; onCheck?: () => void }) {
  return (
    <Card style={{ padding: 16 }}>
      <View style={styles.cardHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{device.name}</Text>
          <Text style={styles.body}>{device.roomName}</Text>
        </View>
        <StatusBadge status={device.status} />
      </View>
      <Text style={styles.body}>{device.latestReading} - {device.powerStatus}</Text>
      {onCheck ? <SecondaryButton label="Mark Checked" onPress={onCheck} /> : null}
    </Card>
  );
}

function Timeline({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.timeline}>
      <View style={styles.timelineDot} />
      <Card style={{ flex: 1, padding: 14 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.body}>{description}</Text>
      </Card>
    </View>
  );
}

function createActivity(actorName: string, category: AppData["activityItems"][number]["category"], title: string, description: string, level: AppData["activityItems"][number]["level"]) {
  return {
    id: `ACT-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actorName,
    category,
    title,
    description,
    level,
  };
}

function simulateScenario(data: AppData, scenario: DemoScenario, actorName: string): AppData {
  if (scenario === "Normal") {
    const fresh = createInitialData();
    return {
      ...fresh,
      selectedAccountId: data.selectedAccountId,
      activityItems: [createActivity(actorName, "Monitoring", "Normal readings restored", "Demo readings returned to a safe prototype state.", "Good"), ...data.activityItems],
    };
  }

  const createdAt = new Date().toISOString();
  const smoke = scenario === "Smoke";
  const co2 = scenario === "High CO2";
  const offline = scenario === "Offline";
  const roomId = smoke ? "kitchen" : co2 ? "bedroom" : "living-room";
  const alert = smoke || co2 || offline ? createScenarioAlert(scenario, createdAt) : undefined;
  const existingActiveAlert = alert
    ? data.alerts.find((item) => item.status !== "Resolved" && item.roomId === alert.roomId && item.sourceDevice === alert.sourceDevice)
    : undefined;
  const reading = {
    id: `READ-${Date.now()}`,
    roomId,
    roomName: smoke ? "Kitchen" : co2 ? "Bedroom" : "Living Room",
    status: smoke ? "Critical" : co2 ? "Warning" : offline ? "Offline" : "Moderate",
    co2Ppm: smoke ? 1280 : co2 ? 1510 : 780,
    humidityPercent: smoke ? 54 : 49,
    temperatureC: smoke ? 31.2 : 22.4,
    smokeUgM3: smoke ? 215 : 0,
    ventilation: smoke ? "Off" : "Limited",
    sourceEvent: scenario,
    createdAt,
  } as AppData["readings"][number];

  return {
    ...data,
    readings: [reading, ...data.readings].slice(0, 30),
    alerts: alert
      ? existingActiveAlert
        ? data.alerts.map((item) => (item.id === existingActiveAlert.id ? { ...item, updatedAt: createdAt } : item))
        : [alert, ...data.alerts]
      : data.alerts,
    rooms: data.rooms.map((room) => updateRoomForScenario(room, scenario)),
    devices: data.devices.map((device) => updateDeviceForScenario(device, scenario, createdAt)),
    activityItems: [
      createActivity(
        actorName,
        alert ? "Alerts" : "Monitoring",
        alert ? (existingActiveAlert ? `${alert.riskLevel} alert refreshed` : `${alert.riskLevel} alert created`) : "Ventilation demo triggered",
        alert ? (existingActiveAlert ? `${alert.title} is already active, so the existing alert was updated.` : alert.title) : "Ventilation fan was turned on in the demo state.",
        alert?.riskLevel ?? "Moderate",
      ),
      ...data.activityItems,
    ],
  };
}

function createScenarioAlert(scenario: DemoScenario, createdAt: string): Alert | undefined {
  if (scenario === "Smoke") {
    return {
      id: `ALT-${Date.now()}`,
      title: "Smoke detected in Kitchen",
      location: "Kitchen",
      roomId: "kitchen",
      riskLevel: "Critical",
      status: "New",
      detectedAt: createdAt,
      updatedAt: createdAt,
      sourceDevice: "Kitchen Smoke/Gas Sensor",
      description: "High smoke levels detected. Take immediate action.",
      recommendedAction: "Check the kitchen immediately, turn on ventilation if safe, and leave the area if smoke continues.",
      notes: [],
    };
  }
  if (scenario === "High CO2") {
    return {
      id: `ALT-${Date.now()}`,
      title: "High CO2 in Bedroom",
      location: "Bedroom",
      roomId: "bedroom",
      riskLevel: "Warning",
      status: "New",
      detectedAt: createdAt,
      updatedAt: createdAt,
      sourceDevice: "Bedroom CO2 Sensor",
      description: "CO2 rose above the comfort range in Bedroom.",
      recommendedAction: "Open a window, increase ventilation, and recheck the room in 15 minutes.",
      notes: [],
    };
  }
  if (scenario === "Offline") {
    return {
      id: `ALT-${Date.now()}`,
      title: "Sensor offline in Living Room",
      location: "Living Room",
      roomId: "living-room",
      riskLevel: "Offline",
      status: "New",
      detectedAt: createdAt,
      updatedAt: createdAt,
      sourceDevice: "Living Room Air Sensor",
      description: "The air sensor stopped sending updates.",
      recommendedAction: "Check battery level and Wi-Fi connection, then mark the device checked.",
      notes: [],
    };
  }
  return undefined;
}

function updateRoomForScenario(room: AppData["rooms"][number], scenario: DemoScenario) {
  if (scenario === "Smoke" && room.id === "kitchen") return { ...room, status: "Critical" as const, mainReading: "Smoke 215", co2Ppm: 1280, temperatureC: 31.2, smokeGas: "Warning" as const, summary: "Smoke detected. Check the kitchen immediately." };
  if (scenario === "High CO2" && room.id === "bedroom") return { ...room, status: "Warning" as const, mainReading: "CO2 1510 ppm", co2Ppm: 1510, summary: "CO2 is high. Increase ventilation." };
  if (scenario === "Offline" && room.id === "living-room") return { ...room, status: "Offline" as const, mainReading: "Sensor offline", summary: "Air sensor has stopped sending updates." };
  if (scenario === "Ventilation" && room.id === "kitchen") return { ...room, status: "Moderate" as const, mainReading: "Fan running", summary: "Ventilation fan is running to improve airflow." };
  return room;
}

function updateDeviceForScenario(device: AppData["devices"][number], scenario: DemoScenario, lastChecked: string) {
  if (scenario === "Smoke" && device.id === "dev-kitchen-smoke") return { ...device, status: "Warning" as const, latestReading: "Smoke detected", lastChecked };
  if (scenario === "Smoke" && device.id === "dev-kitchen-fan") return { ...device, status: "Warning" as const, latestReading: "Off", lastChecked };
  if (scenario === "High CO2" && device.id === "dev-bedroom-co2") return { ...device, status: "Warning" as const, latestReading: "CO2 1510 ppm", lastChecked };
  if (scenario === "Offline" && device.id === "dev-living-air") return { ...device, status: "Offline" as const, latestReading: "No signal", lastChecked };
  if (scenario === "Ventilation" && device.id === "dev-kitchen-fan") return { ...device, status: "Online" as const, latestReading: "Running at 72%", lastChecked };
  return device;
}

function updateAlert(data: AppData, alertId: string, status: AlertStatus, text: string | undefined, actorName: string): AppData {
  const target = data.alerts.find((alert) => alert.id === alertId);
  if (!target) return data;
  const updatedAt = new Date().toISOString();
  const resolvedReading = status === "Resolved" ? createResolvedReading(target, updatedAt) : undefined;
  return {
    ...data,
    alerts: data.alerts.map((alert) =>
      alert.id === alertId
        ? {
            ...alert,
            status,
            updatedAt,
            notes: text ? [{ id: `NOTE-${Date.now()}`, text, createdAt: updatedAt, actorName }, ...alert.notes] : alert.notes,
          }
        : alert,
    ),
    rooms: status === "Resolved" ? data.rooms.map((room) => (room.id === target.roomId ? getSafeRoom(room, updatedAt) : room)) : data.rooms,
    devices: status === "Resolved" ? data.devices.map((device) => (device.roomId === target.roomId ? getSafeDevice(device, updatedAt) : device)) : data.devices,
    readings: resolvedReading ? [resolvedReading, ...data.readings].slice(0, 30) : data.readings,
    activityItems: [createActivity(actorName, "Alerts", status === "Action Taken" ? "Action note added" : `Alert marked ${status}`, text ?? target.title, status === "Resolved" ? "Good" : target.riskLevel), ...data.activityItems],
  };
}

function getSafeRoom(room: AppData["rooms"][number], updatedAt: string): AppData["rooms"][number] {
  const safeRoom = createInitialData().rooms.find((item) => item.id === room.id);
  return safeRoom ? { ...safeRoom } : { ...room, status: "Good", smokeGas: "Clear", summary: `Air quality restored at ${new Date(updatedAt).toLocaleTimeString()}.` };
}

function getSafeDevice(device: AppData["devices"][number], updatedAt: string): AppData["devices"][number] {
  const safeDevice = createInitialData().devices.find((item) => item.id === device.id);
  return safeDevice ? { ...safeDevice, lastChecked: updatedAt } : { ...device, status: "Online", latestReading: "Normal", lastChecked: updatedAt };
}

function createResolvedReading(alert: Alert, createdAt: string): AppData["readings"][number] {
  const safeRoom = createInitialData().rooms.find((room) => room.id === alert.roomId);
  return {
    id: `READ-${Date.now()}`,
    roomId: alert.roomId,
    roomName: safeRoom?.name ?? alert.location,
    status: "Good",
    co2Ppm: safeRoom?.co2Ppm ?? 420,
    humidityPercent: safeRoom?.humidityPercent ?? 48,
    temperatureC: safeRoom?.temperatureC ?? 22.3,
    smokeUgM3: 0,
    ventilation: "Optimal",
    sourceEvent: "Resolved",
    createdAt,
  };
}

function getReadiness(data: AppData) {
  return Math.round((data.checklistItems.filter((item) => item.checked).length / data.checklistItems.length) * 100);
}

function getActiveTab(screen: ScreenName): MainTab {
  if (screen === "Rooms" || screen === "Kitchen") return "Rooms";
  if (screen === "Alerts" || screen === "AlertDetail") return "Alerts";
  if (screen === "Devices") return "Devices";
  if (screen === "More" || screen === "Risks" || screen === "Activity" || screen === "Checklist" || screen === "Reports") return "More";
  return "Home";
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: colors.background,
  },
  phone: {
    alignSelf: "center",
    backgroundColor: "white",
    flex: 1,
    maxWidth: 390,
    overflow: "hidden",
    width: "100%",
  },
  loading: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
  },
  full: {
    flex: 1,
  },
  splash: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  splashHint: {
    bottom: 48,
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontWeight: "700",
    position: "absolute",
  },
  scroll: {
    backgroundColor: "white",
    flex: 1,
  },
  scrollContent: {
    gap: 16,
    paddingBottom: 118,
    paddingHorizontal: 25,
    paddingTop: 52,
  },
  accountLogoRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  logoBox: {
    alignItems: "center",
    borderRadius: 18,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  largeTitle: {
    color: colors.textPrimary,
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 40,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  caption: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  accountCard: {
    alignItems: "center",
    backgroundColor: "white",
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    padding: 16,
  },
  accountCardActive: {
    borderColor: colors.brandBlue,
    shadowColor: colors.brandBlue,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderRadius: 999,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  avatarText: {
    color: colors.brandBlue,
    fontSize: 13,
    fontWeight: "800",
  },
  homeHeader: {
    gap: 28,
  },
  headerTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  menuGlyph: {
    gap: 5,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  menuBar: {
    backgroundColor: "#111827",
    borderRadius: 999,
    height: 3,
    width: 24,
  },
  userInfo: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  greeting: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  addDeviceButton: {
    alignItems: "center",
    borderRadius: 8,
    height: 46,
    justifyContent: "center",
    width: 127,
  },
  addDeviceText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  heroCard: {
    borderRadius: 24,
    gap: 14,
    minHeight: 224,
    padding: 20,
    shadowColor: colors.brandBlue,
    shadowOpacity: 0.14,
    shadowRadius: 50,
    shadowOffset: { width: 0, height: 5 },
  },
  heroTopRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 13,
  },
  heroIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  heroIconText: {
    color: "white",
    fontSize: 18,
    fontWeight: "800",
  },
  heroPill: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 24,
    flexDirection: "row",
    gap: 6,
    height: 36,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  heroPillText: {
    color: "white",
    fontSize: 12,
    fontWeight: "800",
  },
  dot: {
    backgroundColor: colors.leafGreen,
    borderRadius: 999,
    height: 7,
    width: 7,
  },
  heroTitle: {
    color: "white",
    fontSize: 23,
    fontWeight: "800",
    lineHeight: 30,
  },
  heroSubtitle: {
    color: "#EAF7FF",
    fontSize: 14,
    lineHeight: 18,
  },
  heroButton: {
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 15,
    height: 40,
    justifyContent: "center",
  },
  heroButtonText: {
    color: colors.brandBlue,
    fontSize: 14,
    fontWeight: "800",
  },
  heroActions: {
    flexDirection: "row",
    gap: 10,
  },
  heroGhostButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 15,
    flex: 1,
    height: 40,
    justifyContent: "center",
  },
  heroGhostText: {
    color: "white",
    fontSize: 14,
    fontWeight: "800",
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  emptyCard: {
    padding: 18,
  },
  demoGrid: {
    flexDirection: "row",
    gap: 8,
  },
  demoButton: {
    alignItems: "center",
    backgroundColor: "white",
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    flex: 1,
    minHeight: 72,
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  demoText: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
  },
  pageHeader: {
    marginBottom: 4,
  },
  pageTitle: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: "800",
  },
  backButton: {
    alignItems: "center",
    backgroundColor: "#475569",
    borderRadius: 999,
    height: 42,
    justifyContent: "center",
    marginBottom: 24,
    width: 42,
  },
  backText: {
    color: "white",
    fontSize: 30,
    lineHeight: 32,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: "800",
  },
  largeCardTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 8,
  },
  body: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 4,
  },
  label: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 12,
    textTransform: "uppercase",
  },
  cardHeaderRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  roomCard: {
    gap: 12,
    minHeight: 162,
    padding: 16,
  },
  roomMetrics: {
    flexDirection: "row",
    gap: 8,
  },
  miniMetric: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 16,
    flex: 1,
    height: 58,
    justifyContent: "center",
  },
  miniLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "600",
  },
  miniValue: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
  },
  twoColumn: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  badgeRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  noteInput: {
    backgroundColor: "white",
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    color: colors.textPrimary,
    minHeight: 100,
    padding: 14,
    textAlignVertical: "top",
  },
  accountRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  menuCard: {
    alignItems: "center",
    backgroundColor: "white",
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 28,
  },
  checkRow: {
    alignItems: "center",
    backgroundColor: "white",
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 16,
  },
  checkCircle: {
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 999,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  checkMark: {
    color: "white",
    fontSize: 8,
    fontWeight: "800",
  },
  reportHero: {
    borderRadius: 24,
    padding: 20,
  },
  timeline: {
    flexDirection: "row",
    gap: 12,
  },
  timelineDot: {
    backgroundColor: colors.brandBlue,
    borderRadius: 999,
    height: 12,
    marginTop: 18,
    width: 12,
  },
});
