module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(0, 0%, 90%)",
        input: "hsl(0, 0%, 90%)",
        ring: "hsl(0, 0%, 20%)",
        background: "hsl(0, 0%, 98%)",
        foreground: "hsl(0, 0%, 12%)",
        primary: {
          DEFAULT: "hsl(0, 0%, 12%)",
          foreground: "hsl(0, 0%, 98%)",
        },
        secondary: {
          DEFAULT: "hsl(0, 0%, 25%)",
          foreground: "hsl(0, 0%, 98%)",
        },
        tertiary: {
          DEFAULT: "hsl(40, 15%, 85%)",
          foreground: "hsl(0, 0%, 12%)",
        },
        neutral: {
          DEFAULT: "hsl(0, 0%, 98%)",
          foreground: "hsl(0, 0%, 12%)",
        },
        destructive: {
          DEFAULT: "hsl(0, 0%, 30%)",
          foreground: "hsl(0, 0%, 98%)",
        },
        muted: {
          DEFAULT: "hsl(0, 0%, 95%)",
          foreground: "hsl(0, 0%, 40%)",
        },
        accent: {
          DEFAULT: "hsl(40, 15%, 85%)",
          foreground: "hsl(0, 0%, 12%)",
        },
        popover: {
          DEFAULT: "hsl(0, 0%, 100%)",
          foreground: "hsl(0, 0%, 12%)",
        },
        card: {
          DEFAULT: "hsl(0, 0%, 100%)",
          foreground: "hsl(0, 0%, 12%)",
        },
        success: "hsl(0, 0%, 30%)",
        warning: "hsl(0, 0%, 40%)",
        gray: {
          50: "hsl(0, 0%, 98%)",
          100: "hsl(0, 0%, 95%)",
          200: "hsl(0, 0%, 90%)",
          300: "hsl(0, 0%, 80%)",
          400: "hsl(0, 0%, 65%)",
          500: "hsl(0, 0%, 50%)",
          600: "hsl(0, 0%, 40%)",
          700: "hsl(0, 0%, 30%)",
          800: "hsl(0, 0%, 20%)",
          900: "hsl(0, 0%, 12%)",
        },
      },
      fontFamily: {
        sans: ["Times New Roman", "Times", "serif"],
        heading: ["Times New Roman", "Times", "serif"],
        alice: ["Times New Roman", "Times", "serif"],
      },
      fontSize: {
        'xs': ['14px', '1.5'],
        'sm': ['16px', '1.5'],
        'base': ['18px', '1.5'],
        'lg': ['20px', '1.5'],
        'xl': ['22px', '1.5'],
        '2xl': ['26px', '1.5'],
        '3xl': ['32px', '1.5'],
        '4xl': ['38px', '1.5'],
        '5xl': ['50px', '1.5'],
        '6xl': ['62px', '1.5'],
        '7xl': ['74px', '1.5'],
        '8xl': ['98px', '1.5'],
        '9xl': ['130px', '1.5'],
      },
      borderRadius: {
        lg: "2px",
        md: "2px",
        sm: "2px",
      },
      spacing: {
        '4': '1rem',
        '8': '2rem',
        '12': '3rem',
        '16': '4rem',
        '24': '6rem',
        '32': '8rem',
        '48': '12rem',
        '64': '16rem',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.3s ease-out",
        "accordion-up": "accordion-up 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
