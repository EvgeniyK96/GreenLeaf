import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// three.js и @react-three/* грузятся только через React.lazy (src/three/*Visual.tsx).
// Отдельные чанки: three — само ядро, r3f — fiber + drei + reconciler.
export default defineConfig({
  plugins: [react()],
  // dev: 3D-пакеты подключаются только ленивым импортом, Vite не видит их при старте и
  // пересобирает зависимости на лету (504 Outdated Optimize Dep → сцена не грузится). Собираем заранее.
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei'],
  },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    reportCompressedSize: true,
    // Ядро three.js — ~740 КБ до сжатия (~185 КБ gzip, лимит проекта 200 КБ), грузится только лениво.
    chunkSizeWarningLimit: 800,
    rolldownOptions: {
      output: {
        codeSplitting: {
          includeDependenciesRecursively: false,
          groups: [
            { name: 'react', test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 30 },
            { name: 'three', test: /[\\/]node_modules[\\/]three[\\/]/, priority: 20 },
            {
              name: 'r3f',
              test: /[\\/]node_modules[\\/](@react-three|react-reconciler|its-fine|suspend-react|zustand|three-stdlib|@monogrid|maath|camera-controls|troika|stats-gl|tunnel-rat)[\\/]/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
})
