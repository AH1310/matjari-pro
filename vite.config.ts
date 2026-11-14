import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  // GitHub Pages serves this project below /matjari-pro/; local development stays at /.
  base: command === 'build' ? '/matjari-pro/' : '/',
  plugins: [react()],
}))
