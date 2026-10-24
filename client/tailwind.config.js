/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mood: {
          1: '#EF4444', // Red (Very Low)
          2: '#F97316', // Orange (Low)
          3: '#EAB308', // Amber (Neutral)
          4: '#10B981', // Emerald (Good)
          5: '#3B82F6', // Blue / Indigo (Great)
        }
      }
    },
  },
  plugins: [],
}
