/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1400px',
    },
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      width: {
        '465': '465px',
      },
      borderColor: {
        'border': 'var(--border)',
        'glassBorder': 'var(--glassBorder)',
      },
      backgroundColor: {
        'background': 'var(--background)',
        'glassmorphism': 'var(--glassmorphism)',
      },
      textColor: {
        'foreground': 'var(--foreground)',
      },
      colors: {
        // Modern dark theme colors
        dark: {
          1: "#0A0A0F", // Deep background
          2: "#13131A", // Card background
          3: "#1C1C24", // Input background
          4: "#2D2D3A", // Border color
        },
        light: {
          1: "#FFFFFF", // Primary text
          2: "#E2E2E6", // Secondary text
          3: "#B4B4C0", // Tertiary text
          4: "#747488", // Muted text
        },
        primary: {
          100: "#D9E4FF", // Lightest
          200: "#B6C9FF",
          300: "#8AA3FF",
          400: "#6B86FF",
          500: "#4361EE", // Main primary
          600: "#3A4FD1", // Darker primary
          700: "#2C3EB2",
          800: "#1F2D8A",
          900: "#162069",
        },
        accent: {
          1: "#FF7D55", // Orange accent
          2: "#7B61FF", // Purple accent
          3: "#32D583", // Green accent
          4: "#F43F5E", // Red accent
        },
        glass: "rgba(255, 255, 255, 0.05)",
        glassBorder: "rgba(255, 255, 255, 0.1)",
      },
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      boxShadow: {
        "card": "0px 8px 24px rgba(0, 0, 0, 0.25)",
        "button": "0px 4px 12px rgba(67, 97, 238, 0.3)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "pulse-slow": {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        "shimmer": {
          "100%": {
            transform: "translateX(100%)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-slow": "pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 1.5s infinite",
      },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(20px)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-diagonal': 'linear-gradient(to bottom right, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}