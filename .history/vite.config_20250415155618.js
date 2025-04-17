/*
 * @Author: baoyiwen 511530203@qq.com
 * @Date: 2024-12-02 11:17:36
 * @LastEditors: baoyiwen 511530203@qq.com
 * @LastEditTime: 2025-04-15 15:56:11
 * @FilePath: \cesium-app-vue\vite.config.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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
    port: 8081,
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
