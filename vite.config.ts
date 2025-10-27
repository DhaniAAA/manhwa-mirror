import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
import { imageProxyPlugin } from './vite-plugins/imageProxyPlugin'

// https://vite.dev/config/
export default defineConfig({
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
    // Modern image optimization plugin (more secure, actively maintained)
    ViteImageOptimizer({
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
    })
  ],
  build: {
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for better caching
          'vendor': ['vue', 'vue-router'],
          // Supabase in separate chunk
          'supabase': ['@supabase/supabase-js']
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
    // Enable tree-shaking for unused code removal
    reportCompressedSize: false, // Faster builds
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
  //ESBuild options for all environments
  esbuild: {
    drop: ['console', 'debugger'] // Remove console.log and debugger in production
  }
})
