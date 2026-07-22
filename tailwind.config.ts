import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
    extend: {
      fontFamily: {
        sans: ["DM Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Cormorant Garamond", "ui-serif", "serif"],
        cinzel: ["Cinzel", "ui-serif", "serif"],
        tamil: ["Noto Serif Tamil", "serif"],
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
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        success: { DEFAULT: "hsl(var(--success))", foreground: "hsl(var(--success-foreground))" },
        warning: { DEFAULT: "hsl(var(--warning))", foreground: "hsl(var(--warning-foreground))" },
        info: { DEFAULT: "hsl(var(--info))", foreground: "hsl(var(--info-foreground))" },
        // Brand palette
        gold: {
          DEFAULT: "#f5c842",
          light: "#fdd968",
          dark: "#c8860f",
          muted: "#b89030",
        },
        copper: {
          DEFAULT: "#b87333",
          light: "#d4904a",
          dark: "#8b5a24",
        },
        jade: {
          DEFAULT: "#2d8653",
          light: "#3da66a",
          dark: "#1f5c38",
        },
        noir: {
          50: "hsl(220 14% 16%)",
          100: "hsl(220 14% 12%)",
          200: "hsl(220 15% 9%)",
          900: "hsl(220 15% 6%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        "gold-sm": "0 2px 10px hsl(38 92% 55% / 0.25)",
        "gold-md": "0 4px 20px hsl(38 92% 55% / 0.35)",
        "gold-lg": "0 8px 40px hsl(38 92% 55% / 0.45)",
        "gold-glow": "0 0 30px hsl(38 92% 55% / 0.5), 0 0 60px hsl(38 92% 55% / 0.2)",
        "luxury": "0 20px 60px hsl(0 0% 0% / 0.5), 0 4px 20px hsl(0 0% 0% / 0.3)",
        "card-hover": "0 24px 64px hsl(0 0% 0% / 0.6), 0 0 0 1px hsl(38 92% 55% / 0.2)",
        "inner-gold": "inset 0 1px 0 hsl(38 80% 80% / 0.12)",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #f5c842 0%, #e8a320 40%, #ffd700 60%, #c8860f 100%)",
        "noir-gradient": "linear-gradient(135deg, hsl(220 14% 13%) 0%, hsl(220 12% 8%) 100%)",
        "hero-radial": "radial-gradient(ellipse 80% 60% at 50% -10%, hsl(38 80% 20% / 0.3), transparent)",
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        float: "float 6s ease-in-out infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        marquee: "marquee 25s linear infinite",
        "spin-slow": "spin 8s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(38 92% 55% / 0.3)" },
          "50%": { boxShadow: "0 0 40px hsl(38 92% 55% / 0.7), 0 0 80px hsl(38 92% 55% / 0.2)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
