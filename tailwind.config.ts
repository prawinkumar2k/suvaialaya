import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      fontFamily: { 
        sans: ["Poppins", "Inter", "ui-sans-serif", "system-ui", "sans-serif"], 
        display: ["Playfair Display", "Cormorant Garamond", "ui-serif", "serif"],
        tamil: ["Noto Serif Tamil", "serif"]
      },
      colors: {
        border: "hsl(var(--border))", 
        input: "hsl(var(--input))", 
        ring: "hsl(var(--ring))", 
        background: "hsl(var(--background))", 
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        temple: {
          orange: "#FF4500", // Bright Orange Red
          maroon: "#E6005C", // Vivid Magenta/Pink
          copper: "#FF1493", // Deep Pink
          gold: "#FFD700", // Luminous Gold
          teal: "#00E5FF", // Neon Teal
          yellow: "#FFFF00", // Festival Yellow
        },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        success: { DEFAULT: "hsl(var(--success))", foreground: "hsl(var(--success-foreground))" },
        warning: { DEFAULT: "hsl(var(--warning))", foreground: "hsl(var(--warning-foreground))" },
        info: { DEFAULT: "hsl(var(--info))", foreground: "hsl(var(--info-foreground))" },
      },
      borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
