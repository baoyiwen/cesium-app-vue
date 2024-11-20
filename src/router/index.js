import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../store/userStore';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: {
      title: 'Home',
      icon: '/images/menus/map-draw.svg',
      activeIcon: '/images/menus/map-draw-active.svg',
      showInMenu: true,
      isDefault: true,
    },
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('../views/403.vue'),
    meta: {
      title: '403',
      // icon: '/images/menus/map-draw.svg',
      showInMenu: false,
      // isDefault: true,
    },
  },
  {
    path: '/500',
    name: 'ServerError',
    component: () => import('../views/500.vue'),
    meta: {
      showInMenu: false,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/404.vue'),
    meta: {
      showInMenu: false,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  next();
  // 如果需要登录但用户未登录
  //   if (to.meta.requiresAuth && !userStore.isLoggedIn) {
  //     next('/'); // 重定向到守夜或者登录页
  //   } else {
  //     if (userStore.isLoggedIn && !userStore.userInfo) {
  //       try {
  //         await userStore.fetchUserInfo(); // 获取用户信息
  //       } catch (error) {
  //         userStore.logout(); // 如果获取信息失败，清理状态
  //         return next('/');
  //       }
  //     }
  //     next();
  //   }
});

export default router;
