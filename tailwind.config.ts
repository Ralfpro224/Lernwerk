import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17324a",
        muted: "#587086",
        sky: "#eaf7ff",
        blue: "#2876df",
        coral: "#ff795f",
        gold: "#f8c44f",
        mint: "#5bc6a6"
      },
      fontFamily: { sans: ["Arial", "Helvetica", "sans-serif"] }
    }
  },
  plugins: []
} satisfies Config;
