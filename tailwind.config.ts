import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f7f9fb",
          100: "#eef2f6",
          200: "#d9e1ea",
          300: "#b6c4d2",
          500: "#617083",
          700: "#334155",
          900: "#111827",
        },
        brand: {
          50: "#eff8ff",
          100: "#dff0ff",
          500: "#207fbf",
          600: "#14699f",
          700: "#0f527d",
        },
      },
      boxShadow: {
        soft: "0 18px 45px rgba(17, 24, 39, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
