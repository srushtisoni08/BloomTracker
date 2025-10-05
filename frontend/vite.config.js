import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),
  ],
  preview: {
    host: true, // binds to 0.0.0.0
    allowedHosts: ['bloomtracker-bg0j.onrender.com'], // allow your Render hostname
  },
})
