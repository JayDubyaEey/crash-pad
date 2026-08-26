import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative base so the build works under any GitHub Pages repo name
// (https://<user>.github.io/<repo>/) without hardcoding the repo name here.
export default defineConfig({
  base: './',
  plugins: [react()],
})
