import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    // Library build configuration
    return {
      plugins: [react()],
      build: {
        emptyOutDir: false, // Don't empty dist directory to preserve TypeScript declarations
        lib: {
          entry: resolve(__dirname, 'src/index.ts'),
          name: 'PhaserViewer',
          formats: ['es', 'cjs'],
          fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`
        },
        rollupOptions: {
          external: ['react', 'react-dom', 'phaser'],
          output: {
            exports: 'named',
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              phaser: 'Phaser'
            }
          }
        }
      }
    }
  }

  // Development/demo build configuration
  return {
    plugins: [react()],
    optimizeDeps: {
      include: ['phaser']
    }
  }
})
