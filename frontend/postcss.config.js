// Tailwind CSS v4 mueve el plugin de PostCSS a @tailwindcss/postcss
import tailwindcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'

export default {
  plugins: [
    tailwindcss(),
    autoprefixer()
  ]
}
