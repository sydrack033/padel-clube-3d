import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Caminhos relativos: o mesmo build roda na raiz ou em sydrack033.github.io/padel-clube-3d/
  base: './',
});
