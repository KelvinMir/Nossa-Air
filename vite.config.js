import { existsSync, renameSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

function pagesIndexPlugin() {
  return {
    name: 'pages-index',
    closeBundle() {
      const devIndex = resolve(__dirname, 'dist/index.dev.html')
      const pagesIndex = resolve(__dirname, 'dist/index.html')

      if (existsSync(devIndex)) {
        renameSync(devIndex, pagesIndex)
      }
    },
  }
}

export default defineConfig(({ mode }) => ({
  base: mode === 'development' ? '/' : '/Nossa-Air/',
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.dev.html'),
      },
    },
  },
  plugins: [tailwindcss(), react(), pagesIndexPlugin()],
}))
