import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';
import viteImagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    react(),
    viteCompression({
      algorithm: 'gzip', // gzip 압축
      ext: '.gz',
      threshold: 10240, // 10kb 이상 파일만 압축
      deleteOriginFile: false,
    }),
    viteCompression({
      algorithm: 'brotliCompress', // brotli 압축 추가
      ext: '.br',
      threshold: 10240,
      deleteOriginFile: false,
    }),
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 75 },
      pngquant: { quality: [0.65, 0.9], speed: 4 },
      svgo: {
        plugins: [
          { name: 'removeViewBox' },
          { name: 'removeEmptyAttrs', active: false },
        ],
      },
    }),
  ],
  envPrefix: 'VITE_',
  build: {
    assetsInlineLimit: 4096,
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      },
      external: ['react-apexcharts'],
    },
    minify: 'esbuild',
  },
});
