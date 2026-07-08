import type { Config } from 'tailwindcss';

const config: Config = {
  // Toggle dark mode via a `.dark` class on <html> (set by next-themes),
  // matching the `.dark { … }` CSS variables in globals.css (issue #55).
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
          50:  'hsl(220, 100%, 97%)',
          100: 'hsl(220, 100%, 94%)',
          200: 'hsl(220, 97%, 85%)',
          300: 'hsl(220, 95%, 75%)',
          400: 'hsl(220, 90%, 62%)',
          500: 'hsl(220, 85%, 52%)',
          600: 'hsl(220, 80%, 44%)',
          700: 'hsl(220, 78%, 36%)',
          800: 'hsl(220, 75%, 28%)',
          900: 'hsl(220, 72%, 20%)',
          950: 'hsl(220, 70%, 12%)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
          50:  'hsl(35, 100%, 97%)',
          100: 'hsl(35, 100%, 92%)',
          200: 'hsl(35, 97%, 82%)',
          300: 'hsl(35, 95%, 68%)',
          400: 'hsl(35, 92%, 56%)',
          500: 'hsl(35, 90%, 48%)',
          600: 'hsl(35, 85%, 40%)',
          700: 'hsl(35, 80%, 33%)',
          800: 'hsl(35, 75%, 26%)',
          900: 'hsl(35, 70%, 20%)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
        },
        success: {
          50:  'hsl(142, 76%, 97%)',
          500: 'hsl(142, 71%, 45%)',
          700: 'hsl(142, 64%, 30%)',
        },
        warning: {
          50:  'hsl(38, 100%, 97%)',
          500: 'hsl(38, 92%, 50%)',
          700: 'hsl(38, 82%, 35%)',
        },
        danger: {
          50:  'hsl(0, 86%, 97%)',
          500: 'hsl(0, 84%, 60%)',
          700: 'hsl(0, 76%, 42%)',
        },
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
          primary: 'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          border: 'var(--sidebar-border)',
          ring: 'var(--sidebar-ring)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl:  '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.1), 0 2px 6px -2px rgb(0 0 0 / 0.08)',
        'card-lg': '0 10px 30px 0 rgb(0 0 0 / 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'slide-down': 'slideDown 0.25s ease-out',
        'spin-slow': 'spin 2s linear infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',   opacity: '1' },
        },
        slideDown: {
          '0%':   { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
