import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyOrigin = (env.VITE_DEV_PROXY_ORIGIN || 'https://progress.mudiss.com').replace(/\/+$/, '');

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/v1': {
          target: proxyOrigin,
          changeOrigin: true,
          secure: true,
          rewrite: (path) => `/index.php${path}`,
        },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setupTests.js',
      globals: true,
    },
  };
});
