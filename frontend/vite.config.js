import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '^/(auth|entries|tags|analyze-emotion|recommendation|ui-reaction|stats|strategies|api-docs)': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
