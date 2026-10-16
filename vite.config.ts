import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/sample/',
  build: {
    target: 'es2022',
    sourcemap: true,
  },
})
