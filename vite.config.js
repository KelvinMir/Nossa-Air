import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  base: mode === 'development' ? '/' : '/Nossa-Air/',
  plugins: [tailwindcss(), react()],
}))
