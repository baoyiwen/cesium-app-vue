import { createApp } from 'vue';
// import './style.css'
import './static/styles/common.less';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import ElementPlus, { ElMessageBox } from 'element-plus';
import 'element-plus/dist/index.css';
import { useUserStore } from './store/userStore'

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(ElementPlus);

// 全局错误捕获
app.config.errorHandler = (err, vm, info) => {
  console.error(`Error: ${err}, Info: ${info}`);
};

const userStore = useUserStore();

setInterval(() => {
  if (userStore.isLoggedIn && userStore.isTokenExpiring) {
    ElMessageBox.confirm('您的登录即将过期，是否立即续期？', '续期提醒', {
      confirmButtonText: '续期',
      cancelButtonText: '退出',
      type: 'warning',
    })
      .then(() => userStore.handleTokenRefresh())
      .catch(() => userStore.logout());
  }
}, 60 * 1000); // 每分钟检查一次

app.mount('#app');
