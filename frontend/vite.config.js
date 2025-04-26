import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  envPrefix: 'VITE_', // .env 내 VITE_ 변수만 허용

  build: {
    rollupOptions: {
      // 외부 모듈로 처리해서 번들링 제외
      external: ['react-apexcharts'],
    },
  },
});