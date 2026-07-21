import type { Config } from "tailwindcss";

const config: Config = {
  future: {
    hoverOnlyWhenSupported: true,
  },
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pretendard: [
          '"Pretendard Variable"',
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Roboto',
          '"Helvetica Neue"',
          '"Segoe UI"',
          '"Apple SD Gothic Neo"',
          '"Noto Sans KR"',
          '"Malgun Gothic"',
          'sans-serif',
        ],
      },
      colors: {
        nook: {
          green: {
            DEFAULT: "var(--nook-green)",
            dark: "var(--nook-green-dark)",
            light: "var(--nook-green-light)",
            border: "var(--nook-green-border)",
          },
          brown: {
            DEFAULT: "var(--nook-brown)",
            dark: "var(--nook-brown-dark)",
            light: "var(--nook-brown-light)",
            border: "var(--nook-brown-border)",
          },
        },
        emerald: {
          50: "var(--nook-green-light)",
          100: "var(--nook-green-light)",
          200: "var(--nook-green-border)",
          300: "var(--nook-green-border)",
          400: "var(--nook-green)",
          500: "var(--nook-green)",
          600: "var(--nook-green)",
          700: "var(--nook-green-dark)",
          800: "var(--nook-green-dark)",
          900: "var(--nook-green-dark)",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
export default config;
