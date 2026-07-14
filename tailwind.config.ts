import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f8fafc",
          100: "#f1f5f9",
          900: "#0f172a",
          gold: "#c9a95c"
        }
      },
      boxShadow: {
        soft: "0 18px 60px rgba(15,23,42,.10)"
      }
    }
  },
  plugins: []
};

export default config;
