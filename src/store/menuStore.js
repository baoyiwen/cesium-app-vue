import { defineStore } from 'pinia';
import router from '../router';
export const useMenuStore = defineStore('menus', {
  state: () => ({
    menus: [],
    activeMenu: null, // 当前激活的菜单路径
  }),
  actions: {
    // 从路由生成菜单数据
    generateMenus() {
      this.menus = router
        .getRoutes()
        .filter((route) => route.meta?.showInMenu)
        .map((route) => ({
          path: route.path,
          label: route.meta?.title,
          icon: route.meta?.icon,
          activeIcon: route.meta?.activeIcon,
          isDefault: route.meta?.isDefault || false, // 默认选项
        })); // 仅显示 showidMenu 为true的数据
    },
    // 设置当前激活菜单
    setActiveMenu(path) {
      this.activeMenu = path;
    },
    // 自动设置默认激活项
    setDefaultActiveMenu() {
      const defaultMenu = this.menus.find((menu) => menu.isDefault);
      this.activeMenu = defaultMenu;
    },
  },
});
