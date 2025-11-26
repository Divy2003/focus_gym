import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['work-1-avkttilajnhlhuhd.prod-runtime.all-hands.dev', 'work-2-avkttilajnhlhuhd.prod-runtime.all-hands.dev'],
    cors: true
  }
})
