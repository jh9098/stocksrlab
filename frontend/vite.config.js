// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import path from 'path'

export default defineConfig({
  root: '.', // frontend 디렉토리 기준
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: path.resolve(__dirname, 'public/sitemap.xml'),
          dest: '.' // => dist/sitemap.xml
        },
        {
          src: path.resolve(__dirname, 'public/robots.txt'),
          dest: '.' // => dist/robots.txt
        }
      ]
    })
  ]
})
