/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        indigo: {
          50: 'var(--indigo-50)',
          100: 'var(--indigo-100)',
          200: 'var(--indigo-200)',
          250: 'var(--indigo-250)',
          500: 'var(--indigo-500)',
          600: 'var(--indigo-600)',
          700: 'var(--indigo-700)',
          900: 'var(--indigo-900)',
          950: 'var(--indigo-950)',
        },
        violet: {
          50: 'var(--violet-50)',
          100: 'var(--violet-100)',
          200: 'var(--violet-200)',
          250: 'var(--violet-250)',
          500: 'var(--violet-500)',
          600: 'var(--violet-600)',
          700: 'var(--violet-700)',
          900: 'var(--violet-900)',
          950: 'var(--violet-950)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      animation: {
        'gradient-x': 'rotateGradient 4s ease infinite',
        'scan': 'scan 2s linear infinite',
        'pulse-ring-slow': 'pulseRing 3s ease-out infinite',
      },
    },
  },
  plugins: [],
}
