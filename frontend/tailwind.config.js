/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          soft: '#c3d297',    // color1 fondo suave
          white: '#ffffff',   // color2 base white
          muted: '#c3b199',   // color3 tonos secundarios / borders
          dark: '#3a2d19',    // color4 texto fuerte / fondo principal oscuro
          accent: '#e8373e'   // color5 acciones / alerta
        }
      },
      fontFamily: {
        sans: ['Inter','system-ui','sans-serif']
      }
    }
  },
  plugins: []
}
