/*
 * @Author: baoyiwen 511530203@qq.com
 * @Date: 2025-02-28 10:01:17
 * @LastEditors: baoyiwen 511530203@qq.com
 * @LastEditTime: 2025-06-12 19:38:23
 * @FilePath: \cesium-app-vue\src\main.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { createApp, createVNode, render } from 'vue';
// import './style.css'
import './static/styles/common.less';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import ElementPlus, { ElMessageBox } from 'element-plus';
import 'element-plus/dist/index.css';
import { useUserStore } from './store/userStore';
import { createI18n } from 'vue-i18n';
import en from './locales/en.json';
import zh from './locales/zh.json';
import { useSettingsStore } from './store/settingsStore';
import Loading from './views/Loading.vue';
import VueLazyload from 'vue-lazyload';
import FormatDates from 'moment';
import VueAnimationNumber from 'vue-animation-number';

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'zh', // 初始化语言
  fallbackLocale: 'en',
  messages: { en, zh },
});
const app = createApp(App);
app.use(createPinia());
app.use(i18n);
app.use(router);
app.use(ElementPlus);
app.use(FormatDates);
app.use(VueAnimationNumber);
app.config.globalProperties.$datasFormat = FormatDates;

// 全局错误捕获
app.config.errorHandler = (err, vm, info) => {
  console.error(`Error: ${err}, Info: ${info}`);
};

// let loadingVisible = ref(false); // 响应式 visible 状态
let loadingInstance = null;
// 显示Loading
router.beforeEach((to, from, next) => {
  // if (!loadingInstance) {
  //   const vnode = createVNode(Loading, {
  //     visible: loadingVisible.value,
  //     visibleChange: (newVal) => {
  //       loadingVisible.value = newVal;
  //     },
  //   });
  //   const div = document.createElement('div');
  //   document.body.appendChild(div);
  //   vnode.appContext = app._context;
  //   render(vnode, div);
  //   loadingInstance = vnode.component?.proxy;
  // }

  // loadingVisible.value = true; // 显示 Loading
  next();
});

// 隐藏Loading
router.afterEach(() => {
  // loadingVisible.value = false; // 隐藏 Loading
});

const userStore = useUserStore();

// setInterval(() => {
//   if (userStore.isLoggedIn && userStore.isTokenExpiring) {
//     ElMessageBox.confirm('您的登录即将过期，是否立即续期？', '续期提醒', {
//       confirmButtonText: '续期',
//       cancelButtonText: '退出',
//       type: 'warning',
//     })
//       .then(() => userStore.handleTokenRefresh())
//       .catch(() => userStore.logout());
//   }
// }, 60 * 1000); // 每分钟检查一次

// 动态语言切换
const settingsStore = useSettingsStore();
settingsStore.$subscribe(() => {
  i18n.global.locale.value = settingsStore.locale;
});

// 配置 vue-lazyload 默认展位图
app.use(VueLazyload, {
  preLoad: 1.3,
  error: '/images/other/error-picture.svg',
  loading: '/images/other/loading-three.svg',
  attempt: 1,
});

app.mount('#app');
