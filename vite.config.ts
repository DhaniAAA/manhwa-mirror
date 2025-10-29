import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import { imageProxyPlugin } from './vite-plugins/imageProxyPlugin'
import viteCompression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // Remove whitespace for smaller output
          whitespace: 'condense'
        }
      }
    }),
    // Image proxy plugin for development
    imageProxyPlugin(),
    // Modern image optimization plugin (only in production)
    ...(mode === 'production' ? [ViteImageOptimizer({
      // JPEG optimization with progressive rendering
      jpg: {
        quality: 80,
        progressive: true // Enable progressive JPEG
      },
      jpeg: {
        quality: 80,
        progressive: true
      },
      // PNG optimization
      png: {
        quality: 80
      },
      // WebP optimization
      webp: {
        quality: 80
      },
      // AVIF optimization (next-gen format)
      avif: {
        quality: 75
      }
    })] : []),
    // Gzip compression (production only)
    ...(mode === 'production' ? [viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // Only compress files > 10kb
      deleteOriginFile: false
    })] : []),
    // Brotli compression (production only, better compression than gzip)
    ...(mode === 'production' ? [viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
      deleteOriginFile: false
    })] : [])
  ],
  build: {
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunk for core dependencies (rarely changes)
          if (id.includes('node_modules')) {
            // Vue core
            if (id.includes('vue') || id.includes('vue-router')) {
              return 'vendor-vue'
            }
            // Supabase (large library)
            if (id.includes('@supabase')) {
              return 'vendor-supabase'
            }
            // Other node_modules
            return 'vendor-other'
          }
          // Component chunks (lazy loaded)
          if (id.includes('/components/')) {
            return 'components'
          }
          // Views chunks (lazy loaded)
          if (id.includes('/views/')) {
            return 'views'
          }
        }
      }
    },
    // Reduce chunk size warnings threshold
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Minify for production with esbuild (faster than terser)
    minify: 'esbuild',
    // Enable module preload for faster loading
    modulePreload: {
      polyfill: true
    },
    // Target modern browsers for smaller bundles
    target: 'es2015',
    // Optimize asset inlining
    assetsInlineLimit: 4096, // Inline assets < 4kb
    // Tree shaking configuration
    reportCompressedSize: false, // Faster builds
    sourcemap: false, // Disable sourcemaps in production for smaller size
    // CSS minification
    cssMinify: true
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['vue', 'vue-router', '@supabase/supabase-js']
  },
  // CSS optimization
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      // Remove unused CSS in production
    }
  },
  // ESBuild options for tree shaking and optimization
  esbuild: {
    // Remove console.log and debugger in production
    drop: mode === 'production' ? ['console', 'debugger'] : [],
    // Enable tree shaking
    treeShaking: true,
    // Minify identifiers
    minifyIdentifiers: mode === 'production',
    // Minify syntax
    minifySyntax: mode === 'production',
    // Minify whitespace
    minifyWhitespace: mode === 'production'
  }
}))
