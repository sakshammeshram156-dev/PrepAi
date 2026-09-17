/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f3f1ff',
          100: '#ebe5ff',
          200: '#d9ceff',
          300: '#bea6ff',
          400: '#9f75ff',
          500: '#8347ff',
          600: '#7226f5',
          700: '#611adb',
          800: '#5117b0',
          900: '#43168c'
        },
        accent: {
          500: '#3b82f6',
          600: '#2563eb'
        }
      },
      boxShadow: {
        soft: '0 8px 30px rgba(80, 40, 200, 0.12)',
        softDark: '0 8px 30px rgba(0, 0, 0, 0.45)'
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #8347ff 0%, #3b82f6 100%)'
      }
    }
  },
  plugins: []
}
