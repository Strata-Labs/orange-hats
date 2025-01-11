import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        "main-orange": "var(--main-orange)",
        "main-dark-grey": "var(--main-dark-grey)",
        "secondary-white": "var(--secondary-white)",
      },
      fontFamily: {
        "dm-sans": ["var(--font-dm-sans)"],
        "space-grotesk": ["var(--font-space-grotesk)"],
        "space-mono": ["var(--font-space-mono)"],
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-hide": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
      });
    }),
  ],
} satisfies Config;
