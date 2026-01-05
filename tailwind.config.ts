import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-5deg)" },
          "50%": { transform: "rotate(0deg)" },
          "75%": { transform: "rotate(5deg)" },
        },
        appear: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "card-deal": {
          "0%": { opacity: "0", transform: "translateY(-50px) rotate(-10deg)" },
          "100%": { opacity: "1", transform: "translateY(0) rotate(0deg)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(251, 191, 36, 0.5)" },
          "50%": { boxShadow: "0 0 20px rgba(251, 191, 36, 0.8)" },
        },
      },
      animation: {
        wiggle: "wiggle .5s linear infinite",
        appear: "appear 0.3s ease-out forwards",
        "slide-up": "slide-up 0.4s ease-out forwards",
        "card-deal": "card-deal 0.5s ease-out forwards",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
