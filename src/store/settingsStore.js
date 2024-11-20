import { defineStore } from 'pinia';
export const useSettingsStore = defineStore('settings', {
  state: () => ({
    locale: localStorage.getItem('locale') || 'zh',
  }),
  actions: {
    setLocale(newLocale) {
      this.locale = newLocale;
      localStorage.setItem('locale', newLocale);
    },
  },
});
