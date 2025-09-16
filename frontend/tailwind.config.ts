import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'arial', 'sans-serif'],
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '400',
        semibold: '500',
        bold: '600',
        extrabold: '700',
      },
      colors: {
        primary: "#CEFF65",
        "primary-1": "#BBFF29",
        secondary: "#4E56D3",
        error: "#F44336",
        light: "#D1D4FF",
        heavy: "#7F7F7F",
        softText: "#898989",
        titleColor: "#3A3A3A",
        offWhite: "#F2F1F2",
        thirdColor: "#E8EAFF",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      boxShadow: {
        "3xl": "0 0 10px 0 rgba(0, 0, 0, 0.15)",
        "4xl": "0px 0px 6px 0 rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
