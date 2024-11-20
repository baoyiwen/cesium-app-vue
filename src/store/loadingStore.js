import { defineStore } from 'pinia';

export const useLoadingStore = defineStore('loading', {
  state: () => ({
    isLoading: false, // 全局加载状态
    loadingMessage: '', // 全局加载文字
  }),

  actions: {
    startLoading(message = '加载中...') {
      this.isLoading = true;
      this.loadingMessage = message;
    },
    stopLoading() {
      this.isLoading = false;
      this.loadingMessage = '';
    },
  },
});
