import React from "react";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { colors } from "@/theme/index";

export type AppIconName =
  | "home"
  | "rooms"
  | "sensor"
  | "scan"
  | "manual"
  | "check"
  | "alert"
  | "device"
  | "more"
  | "temperature"
  | "humidity"
  | "arrow-left"
  | "chart"
  | "checklist"
  | "chevron-right"
  | "note"
  | "logout"
  | "fan"
  | "battery"
  | "power"
  | "settings"
  | "location"
  | "air"
  | "shield"
  | "plus"
  | "bedroom"
  | "living-room"
  | "kitchen"
  | "bathroom"
  | "dining-room"
  | "office"
  | "nursery"
  | "smoke"
  | "co2";

type Props = {
  name: AppIconName;
  size?: number;
  color?: string;
  secondaryColor?: string;
};

export function AppIcon({ name, size = 24, color = colors.brand, secondaryColor = colors.accent }: Props) {
  const stroke = color;

  if (name === "home") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M3 10.5 12 3l9 7.5" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M5.5 9.5V21h13V9.5" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M9.5 21v-6h5v6" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }

  if (name === "rooms") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x={4} y={4} width={7} height={7} rx={2} stroke={stroke} strokeWidth={2} />
        <Rect x={13} y={4} width={7} height={7} rx={2} stroke={stroke} strokeWidth={2} />
        <Rect x={4} y={13} width={7} height={7} rx={2} stroke={stroke} strokeWidth={2} />
        <Rect x={13} y={13} width={7} height={7} rx={2} stroke={secondaryColor} strokeWidth={2} />
      </Svg>
    );
  }

  if (name === "sensor") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x={7} y={3} width={10} height={18} rx={3} stroke={stroke} strokeWidth={2} />
        <Circle cx={12} cy={8} r={1.5} fill={secondaryColor} />
        <Path d="M10 14h4" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
        <Path d="M10 17h4" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    );
  }

  if (name === "scan") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M7 4H5a1 1 0 0 0-1 1v2" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
        <Path d="M17 4h2a1 1 0 0 1 1 1v2" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
        <Path d="M7 20H5a1 1 0 0 1-1-1v-2" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
        <Path d="M17 20h2a1 1 0 0 0 1-1v-2" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
        <Path d="M8 12h8" stroke={secondaryColor} strokeWidth={2} strokeLinecap="round" />
        <Circle cx={12} cy={12} r={3} stroke={stroke} strokeWidth={2} />
      </Svg>
    );
  }

  if (name === "manual") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M7 4h7l3 3v13H7z" stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
        <Path d="M14 4v4h4" stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
        <Path d="M9.5 12h5" stroke={secondaryColor} strokeWidth={2} strokeLinecap="round" />
        <Path d="M9.5 16h5" stroke={secondaryColor} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    );
  }

  if (name === "check") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={9} stroke={stroke} strokeWidth={2} />
        <Path d="m8 12.5 2.5 2.5L16 9" stroke={secondaryColor} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }

  if (name === "alert") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 4 3.5 19h17L12 4Z" stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
        <Path d="M12 9.5v4.5" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
        <Circle cx={12} cy={17} r={1} fill={secondaryColor} />
      </Svg>
    );
  }

  if (name === "device") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x={7} y={3.5} width={10} height={17} rx={3} stroke={stroke} strokeWidth={2} />
        <Path d="M10 8h4M10 12h4M10 16h4" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
        <Circle cx={12} cy={18} r={0.8} fill={secondaryColor} />
      </Svg>
    );
  }

  if (name === "more") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx={6} cy={12} r={1.5} fill={stroke} />
        <Circle cx={12} cy={12} r={1.5} fill={stroke} />
        <Circle cx={18} cy={12} r={1.5} fill={stroke} />
      </Svg>
    );
  }

  if (name === "temperature") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M10 14.5V6a2 2 0 1 1 4 0v8.5a4 4 0 1 1-4 0Z" stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
        <Path d="M12 9v6" stroke={secondaryColor} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    );
  }

  if (name === "humidity") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 3.5s6 6.1 6 10.5a6 6 0 0 1-12 0c0-4.4 6-10.5 6-10.5Z" stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
        <Path d="M9.5 15.5c.7 1.2 1.6 1.8 2.8 1.8" stroke={secondaryColor} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    );
  }

  if (name === "arrow-left") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M15 5 8 12l7 7M9 12h11" stroke={stroke} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }

  if (name === "chart") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M4 19V5" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
        <Path d="M4 19h16" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
        <Rect x={7} y={12} width={2.8} height={5} rx={1} fill={secondaryColor} />
        <Rect x={11} y={8} width={2.8} height={9} rx={1} fill={stroke} />
        <Rect x={15} y={10} width={2.8} height={7} rx={1} fill={secondaryColor} />
      </Svg>
    );
  }

  if (name === "checklist") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x={5} y={4} width={14} height={16} rx={3} stroke={stroke} strokeWidth={2} />
        <Path d="m8 9 1.3 1.3L12 7.8" stroke={secondaryColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M14 9h2M8 15h.1M11.5 15H16" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    );
  }

  if (name === "chevron-right") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="m9 5 7 7-7 7" stroke={stroke} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }

  if (name === "note") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x={5} y={4} width={14} height={16} rx={2} stroke={stroke} strokeWidth={2} />
        <Path d="M8.5 9h7M8.5 13h7M8.5 17h4" stroke={secondaryColor} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    );
  }

  if (name === "logout") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M10 5H6.5A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19H10" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
        <Path d="M14 8l4 4-4 4M18 12H9" stroke={secondaryColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }

  if (name === "fan") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={2} fill={secondaryColor} />
        <Path d="M12 10c-.7-3.5.6-5.8 3-5.8 1.8 0 2.8 1.5 2.2 3.1-.7 1.8-2.8 2.5-5.2 2.7ZM13.7 13c3.4-1 5.8 0 5.8 2.4 0 1.8-1.6 2.9-3.2 2.2-1.8-.7-2.4-2.9-2.6-4.6ZM10.3 13c-2.8 2.3-5.4 2.2-6.5.1-.8-1.6.2-3.2 1.9-3.5 1.9-.3 3.5 1.2 4.6 3.4Z" stroke={stroke} strokeWidth={1.8} strokeLinejoin="round" />
      </Svg>
    );
  }

  if (name === "battery") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x={4} y={7} width={14} height={10} rx={2} stroke={stroke} strokeWidth={2} />
        <Path d="M20 10v4M7 10v4" stroke={secondaryColor} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    );
  }

  if (name === "power") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 4v8" stroke={stroke} strokeWidth={2.2} strokeLinecap="round" />
        <Path d="M7.2 7.8a6.5 6.5 0 1 0 9.6 0" stroke={secondaryColor} strokeWidth={2.2} strokeLinecap="round" />
      </Svg>
    );
  }

  if (name === "settings") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={12} r={3} stroke={stroke} strokeWidth={2} />
        <Path d="M12 3v2M12 19v2M4.2 7.5l1.7 1M18.1 15.5l1.7 1M4.2 16.5l1.7-1M18.1 8.5l1.7-1M3 12h2M19 12h2" stroke={secondaryColor} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    );
  }

  if (name === "shield") {
    return (
      <Svg width={size} height={size} viewBox="0 0 34 38" fill="none">
        <Path
          d="M14.9999 18.9422V18.9422V18.9422V18.9422V18.9422V18.9422V18.9422V18.9422V18.9422V18.9422V18.9422V18.9422V18.9422V18.9422V18.9422M14.9999 37.8845C10.6743 36.705 7.09292 34.1588 4.25575 30.246C1.41858 26.3332 0 21.9589 0 17.123V5.61536L14.9999 0L29.9999 5.61536V17.123C29.9999 17.3602 29.9947 17.5973 29.9845 17.8345C29.9742 18.0717 29.9588 18.3089 29.9383 18.546C29.664 18.4922 29.3873 18.4518 29.1085 18.4249C28.8296 18.398 28.5434 18.3845 28.2499 18.3845C28.0209 18.3845 27.8023 18.3948 27.5941 18.4153C27.386 18.4358 27.1674 18.4665 26.9384 18.5076C26.9589 18.2768 26.9743 18.0518 26.9845 17.8326C26.9948 17.6134 26.9999 17.3768 26.9999 17.123V7.673L14.9999 3.19223L2.99993 7.673V17.123C2.99993 21.1563 4.13326 24.823 6.39993 28.123C8.66659 31.423 11.5333 33.623 14.9999 34.723C15.5675 34.5395 16.1216 34.3167 16.6621 34.0546C17.2027 33.7925 17.7319 33.4961 18.2499 33.1653V36.6537C17.7353 36.9272 17.2072 37.1665 16.6655 37.3716C16.1239 37.5768 15.5687 37.7477 14.9999 37.8845V37.8845M24.2191 37.9229C23.7525 37.9229 23.346 37.7498 22.9999 37.4037C22.6537 37.0575 22.4807 36.6511 22.4807 36.1845V30.0845C22.4807 29.6178 22.6537 29.2178 22.9999 28.8845C23.346 28.5512 23.7525 28.3845 24.2191 28.3845H24.4807V26.3845C24.4807 25.3358 24.8467 24.4454 25.5787 23.7134C26.3108 22.9813 27.2012 22.6153 28.2499 22.6153C29.2986 22.6153 30.189 22.9813 30.921 23.7134C31.6531 24.4454 32.0191 25.3358 32.0191 26.3845V28.3845H32.2806C32.7526 28.3845 33.1571 28.5512 33.4942 28.8845C33.8313 29.2178 33.9999 29.6178 33.9999 30.0845V36.1845C33.9999 36.6511 33.8313 37.0575 33.4942 37.4037C33.1571 37.7498 32.7526 37.9229 32.2806 37.9229H24.2191V37.9229M26.2499 28.3845H30.2499V26.3845C30.2499 25.8178 30.0582 25.3428 29.6749 24.9595C29.2915 24.5762 28.8165 24.3845 28.2499 24.3845C27.6832 24.3845 27.2082 24.5762 26.8249 24.9595C26.4415 25.3428 26.2499 25.8178 26.2499 26.3845V28.3845V28.3845"
          fill={stroke}
        />
      </Svg>
    );
  }

  if (name === "plus") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 5v14M5 12h14" stroke={stroke} strokeWidth={2.4} strokeLinecap="round" />
      </Svg>
    );
  }

  if (name === "bedroom") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M4 11h16a2 2 0 0 1 2 2v5" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M4 18V7" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
        <Path d="M4 11V9.5A2.5 2.5 0 0 1 6.5 7H9a2 2 0 0 1 2 2v2" stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
        <Path d="M11 11V9.5A2.5 2.5 0 0 1 13.5 7H17a2 2 0 0 1 2 2v2" stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
      </Svg>
    );
  }

  if (name === "living-room") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M6 11V9a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v2" stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
        <Path d="M5 12h14a2 2 0 0 1 2 2v4H3v-4a2 2 0 0 1 2-2Z" stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
        <Path d="M6 18v2M18 18v2" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    );
  }

  if (name === "kitchen") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M7 4v7M11 4v7M7 8h4M9 11v9" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
        <Path d="M16 4c1.4 1.5 2 3.2 2 5.3V20" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    );
  }

  if (name === "dining-room") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx={12} cy={6} r={3} stroke={stroke} strokeWidth={2} />
        <Path d="M5 12h14" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
        <Path d="M7 12v8M17 12v8M7 17h10" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    );
  }

  if (name === "office") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x={5} y={7} width={14} height={10} rx={2} stroke={stroke} strokeWidth={2} />
        <Path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" stroke={stroke} strokeWidth={2} />
        <Path d="M4 20h16M8 17v3M16 17v3" stroke={secondaryColor} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    );
  }

  if (name === "nursery") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M5 10h14l-1.5 8h-11L5 10Z" stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
        <Path d="M8 10V8a4 4 0 0 1 8 0v2" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
        <Circle cx={8} cy={20} r={1} fill={secondaryColor} />
        <Circle cx={16} cy={20} r={1} fill={secondaryColor} />
        <Path d="M10 14h4" stroke={secondaryColor} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    );
  }

  if (name === "bathroom") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M6 10V7a3 3 0 0 1 3-3h1" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
        <Path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z" stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
        <Path d="M8 19v2M16 19v2" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
        <Circle cx={13} cy={5} r={1} fill={secondaryColor} />
      </Svg>
    );
  }

  if (name === "smoke") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M7 5c-2 2-2 4 0 6s2 4 0 6M12 5c-2 2-2 4 0 6s2 4 0 6M17 5c-2 2-2 4 0 6s2 4 0 6" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    );
  }

  if (name === "co2") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M4.5 9.5c0-1.7 1.3-3 3-3h1.2M8.7 17.5H7.5a3 3 0 0 1 0-6h1.2" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
        <Circle cx={13} cy={14.5} r={3} stroke={stroke} strokeWidth={2} />
        <Path d="M18 12h1.5a1.5 1.5 0 0 1 .7 2.8L18 17h3" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }

  if (name === "location") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 21s7-5.5 7-11a7 7 0 0 0-14 0c0 5.5 7 11 7 11Z" stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
        <Circle cx={12} cy={10} r={2.5} stroke={secondaryColor} strokeWidth={2} />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 14c3.5-6 9.5-7.5 14-6-1 7-5.5 11-11.5 10" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5 14c3.5-.5 6-.1 9 2" stroke={secondaryColor} strokeWidth={2} strokeLinecap="round" />
      <Path d="M5 14c-.8 1.5-.8 3 .5 5" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}
