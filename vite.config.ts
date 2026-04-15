import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      headers: {
        // Required for SharedArrayBuffer (used by WASM ONNX runtime)
        'Cross-Origin-Opener-Policy':   'same-origin',
        'Cross-Origin-Embedder-Policy': 'credentialless',
      },
    },
    // ── Worker config — prevents Vite HMR client from being injected ──────────
    // Without this, Vite injects /@vite/client into the worker bundle in dev
    // mode, which calls document.querySelectorAll and crashes with
    // "ReferenceError: document is not defined" in the worker scope.
    worker: {
      format: 'es',
      plugins: () => [],
    },
    plugins: [
      react({
        // Babel fast-refresh only in dev — no extra plugins needed
        babel: {
          plugins: [],
        },
      }),
      tailwindcss(),
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.VITE_GROQ_API_KEY': JSON.stringify(env.VITE_GROQ_API_KEY),
    },
    resolve: {
      alias: { '@': path.resolve(__dirname, '.') },
    },
    optimizeDeps: {
      include: [
        'react', 'react-dom', 'react-router-dom',
        'recharts', 'framer-motion', 'lucide-react',
      ],
      // kokoro-js uses dynamic WASM — exclude from pre-bundling
      exclude: ['kokoro-js'],
    },
    // Allow WASM and large model files
    assetsInclude: ['**/*.wasm', '**/*.onnx'],
    build: {
      target: 'esnext',
      minify: 'esbuild',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // React core — keep leaflet out to break circular dep
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'react-core';
            if (id.includes('node_modules/react-router')) return 'router';
            // Leaflet in its own chunk — breaks maps <-> react-core circular
            if (id.includes('node_modules/leaflet') || id.includes('node_modules/react-leaflet')) return 'maps';
            if (id.includes('node_modules/recharts') || id.includes('node_modules/d3')) return 'charts';
            if (id.includes('node_modules/framer-motion') || id.includes('node_modules/motion')) return 'motion';
            if (id.includes('node_modules/lucide-react')) return 'icons';
            if (id.includes('node_modules/@tanstack')) return 'query';
            if (id.includes('node_modules/groq-sdk') || id.includes('node_modules/@google')) return 'ai-sdk';
            if (id.includes('node_modules/kokoro-js') || id.includes('node_modules/@huggingface')) return 'kokoro';
            if (id.includes('node_modules/zustand')) return 'zustand';
            if (id.includes('node_modules/dexie')) return 'dexie';
            if (id.includes('node_modules/react-joyride') || id.includes('node_modules/react-floater')) return 'joyride';
            // App code — split pages from components
            if (id.includes('/pages/')) return 'pages';
            if (id.includes('/src/components/leakage/')) return 'leakage';
            if (id.includes('/components/')) return 'components';
            if (id.includes('/services/')) return 'services';
          },
        },
      },
    },
  };
});
