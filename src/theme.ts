export const colors = {
  brandBlue: "#0266F4",
  brandCyan: "#049CE0",
  brandTeal: "#0ACAC5",
  leafGreen: "#8FE83F",
  leafDark: "#38C95A",
  textPrimary: "#06264A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  background: "#F6FAFC",
  card: "#FFFFFF",
  border: "#E2E8F0",
  safe: "#22C55E",
  moderate: "#EAB308",
  warning: "#F97316",
  critical: "#EF4444",
  offline: "#94A3B8",
  white: "#FFFFFF",
  softBlue: "#EAF6FF",
  softTeal: "#E9FFFC",
  softGreen: "#F0FDF4",
  softYellow: "#FEFCE8",
  softOrange: "#FFF7ED",
  softRed: "#FFF1F2",
  slate50: "#F8FAFC",
};

export const gradient = [colors.brandBlue, colors.brandCyan, colors.brandTeal] as const;

export const typography = {
  hero: { fontSize: 30, lineHeight: 36, fontWeight: "900" as const },
  title: { fontSize: 24, lineHeight: 30, fontWeight: "900" as const },
  section: { fontSize: 16, lineHeight: 22, fontWeight: "800" as const },
  cardTitle: { fontSize: 16, lineHeight: 21, fontWeight: "800" as const },
  body: { fontSize: 14, lineHeight: 20, fontWeight: "500" as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: "600" as const },
  metric: { fontSize: 24, lineHeight: 30, fontWeight: "900" as const },
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  page: 20,
};

export const radii = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  pill: 999,
};

export const shadows = {
  card: {
    shadowColor: "#0F1729",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 2,
  },
  elevated: {
    shadowColor: "#0F1729",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
    elevation: 5,
  },
};

export const layout = {
  maxPhoneWidth: 390,
  buttonHeight: 48,
  iconButton: 42,
  bottomNavHeight: 78,
  bottomNavBottom: 10,
  screenBottomPadding: 112,
  cardRadius: radii.xl,
};

export const statusColor = {
  Good: colors.safe,
  Moderate: colors.moderate,
  Warning: colors.warning,
  Critical: colors.critical,
  Offline: colors.offline,
  New: colors.brandBlue,
  Checking: colors.moderate,
  "Action Taken": colors.brandCyan,
  Resolved: colors.safe,
};

export const statusBackground = {
  Good: colors.softGreen,
  Moderate: colors.softYellow,
  Warning: colors.softOrange,
  Critical: colors.softRed,
  Offline: colors.slate50,
  New: colors.softBlue,
  Checking: colors.softYellow,
  "Action Taken": colors.softTeal,
  Resolved: colors.softGreen,
};

export function toneForStatus(status: string) {
  return statusColor[status as keyof typeof statusColor] ?? colors.safe;
}

export function backgroundForStatus(status: string) {
  return statusBackground[status as keyof typeof statusBackground] ?? colors.softGreen;
}
