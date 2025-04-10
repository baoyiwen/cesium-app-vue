import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import cesium from 'vite-plugin-cesium';
import commonjs from '@rollup/plugin-commonjs';
import requireTransform from 'vite-plugin-require-transform';
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    cesium(),
    commonjs(),
    requireTransform({
      fileRegex: /.js$|.vue$|.png$|.ts$|.jpg$/,
    }),
  ],
  resolve: {
    alias: {
      '@': 'src',
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          // hack: `true; @import (reference) "${path.resolve(
          //   "src/assets/css/base.less"
          // )}";`,
        },
        javascriptEnabled: true,
      },
    },
  },
  server: {
    port: 8080,
    open: false,
    proxy: {
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
