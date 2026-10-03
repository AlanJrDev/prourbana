import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 900,
  },
  // a pasta fica no OneDrive: o sync tranca arquivos (EBUSY) e mata o watcher;
  // imagens/prontos/logs não participam do HMR (recarrega na mão)
  server: {
    watch: {
      ignored: ['**/images/**', '**/prints/**', '**/*-shots/**', '**/*.log', '**/.obsidian/**'],
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}'],
    css: false,
  },
})
