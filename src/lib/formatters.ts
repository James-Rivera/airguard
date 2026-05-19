export function formatReadingValue(value: number, unit: string) {
  if (unit === "%") return `${value}%`;
  if (unit === "C") return `${value} C`;
  return `${value} ${unit}`;
}

export function formatRelativeMinutes(minutes: number) {
  if (minutes <= 1) return "1 min ago";
  return `${minutes} min ago`;
}

export function formatAlertTime(value: string) {
  return new Date(value).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
