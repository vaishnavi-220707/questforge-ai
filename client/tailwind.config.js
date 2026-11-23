/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060B19',
          900: '#0B132B',
          800: '#15203F',
          700: '#1C2B54',
          600: '#283B70',
        },
        slate: {
          850: '#151D2A',
        },
        accent: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
        },
        brand: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
        },
        cyan: {
          300: '#68F5FF',
          400: '#38BDF8',
          500: '#00F0FF',
          600: '#00D4E6',
        },
        electric: '#3A86FF',
        obsidian: '#060A14',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        headline: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
