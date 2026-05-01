import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        machine: {
          body: "#1a1a2e",
          panel: "#16213e",
          accent: "#0f3460",
          highlight: "#e94560",
          screen: "#0a1628",
          button: "#533483",
        },
      },
    },
  },
  plugins: [],
};
export default config;
