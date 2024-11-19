import { defineStore } from 'pinia';
import { getUserInfo, login, refreshToken } from '../api/user';

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    loading: false,
    error: null,
    token: localStorage.getItem('token') || null,
    expiresAt: localStorage.getItem('expiresAt') || null, // Token 过期时间
    isSessionExpired: false, // 控制登录过期弹窗
  }),
  actions: {
    // 登录方法
    async login(credentials) {
      const response = await this.login(credentials);
      this.token = response.token;
      this.expiresAt = Date.now() + response.expiresIn * 1000; // 计算过期时间
      localStorage.setItem('token', response.token);
      localStorage.setItem('expiresAt', this.expiresAt);
      this.isSessionExpired = false; // 登录后关闭弹窗
    },
    // 退出登录
    logout() {
      this.token = null;
      this.userInfo = null;
      this.expiresAt = null;
      this.isSessionExpired = false;
      localStorage.removeItem('token');
      localStorage.removeItem('expiresAt');
    },

    // 获取用户登录信息
    async fetchUserInfo() {
      if (!this.token) return;
      this.loading = true;
      this.error = null;
      try {
        this.userInfo = await getUserInfo();
      } catch (error) {
        this.error = error;
        throw error; // 将错误向外面抛出
      } finally {
        this.loading = false;
      }
    },

    async handleTokenRefresh() {
      try {
        const response = await refreshToken();
        this.token = response.token;
        this.expiresAt = Date.now() + response.expiresIn * 1000;
        localStorage.setItem('token', response.token);
        localStorage.setItem('expiresAt', this.expiresAt);
      } catch {
        this.isSessionExpired = true; // 刷新失败，显示登录弹窗
      }
    },
  },
  getters: {
    isLoggedIn: (state) => !!state.token,
    isTokenExpiring: (state) => {
      const timeLeft = state.expiresAt - Date.now();
      return timeLeft < 5 * 60 * 1000; // 剩余不到 5 分钟时认为快过期
    },
  },
});
