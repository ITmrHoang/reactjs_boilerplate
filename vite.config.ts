import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path' 
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.VITE_APP_BASE || '/',
  resolve: {
    alias: [
      { 
        find: '@', 
        replacement: path.resolve(__dirname, './src') 
      },
      // { 
      //   find: '@components', 
      //   replacement: path.resolve(__dirname, './src/components')
      // },
    ],
  },
})
