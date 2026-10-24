/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Nunito', 'sans-serif'],
        display: ['Nunito', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        cream: {
          50: '#FDFBF8',
          100: '#FAF7F2',
          200: '#F4EFE8',
          300: '#ECE4DA',
          400: '#DDD2C3',
        },
        espresso: {
          500: '#695141',
          700: '#543826',
          800: '#433022',
          900: '#322318',
        },
        terracotta: {
          DEFAULT: '#85533A',
          hover: '#73442D',
          light: '#F8EFEA',
        },
        mood: {
          1: '#A77CE8', // Depressed / Very Low (Lilac / Purple)
          2: '#F18947', // Sad / Low (Peach / Orange)
          3: '#A88764', // Neutral / Steady (Warm Taupe / Clay)
          4: '#E9AD26', // Happy / Good (Honey Yellow)
          5: '#8BAE68', // Overjoyed / Great (Sage Green)
        },
        moodDark: {
          1: '#4A237A',
          2: '#783508',
          3: '#453120',
          4: '#614002',
          5: '#2B441B',
        }
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(67, 48, 34, 0.06)',
        'pill': '0 2px 10px rgba(67, 48, 34, 0.05)',
      }
    },
  },
  plugins: [],
}
