import axios from 'axios';
import { ElMessage } from 'element-plus';
import { useUserStore } from '../store/userStore';
import { useLoadingStore } from '../store/loadingStore';
import { refreshToken } from '../api/user';

const baseURL = import.meta.env.VITE_API_BASE_URL;

// 创建 axios 实例
const service = axios.create({
  baseURL: baseURL, // API 基础路径
  timeout: 5000, // 请求超时时间
});

let isRefreshing = false; // 防止重复刷新
let requestsQueue = []; // 等待队列

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const loadingStore = useLoadingStore();
    loadingStore.startLoading('正在加载数据...'); // 开始加载
    // 在发送这个请求前可以处理，例如添加tokenconst loadingStore = useLoadingStore();
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    const loadingStore = useLoadingStore();
    loadingStore.stopLoading(); // 请求错误时停止加载
    // 请求错误处理
    return Promise.reject(error);
  }
);

// 响应拦截器
// service.interceptors.response.use(
//   (response) => {
//     // 对数据进行处理
//     return response.data;
//   },
//   async (error) => {
//     const userStore = useUserStore();
//     if (error.response?.status === 401) {
//       if (!isRefreshing) {
//         isRefreshing = true;
//         try {
//           const response = await refreshToken();
//           userStore.token = response.token;
//           localStorage.setItem('token', response.token);

//           isRefreshing = false;
//           // 重发队列中的请求
//           requestsQueue.forEach((cb) => cb(response.token));
//           requestsQueue = [];
//         } catch (error) {
//           isRefreshing = false;
//           userStore.logout(); // 刷新失败，登出用户
//           return Promise.reject(error);
//         }
//       }

//       // 如果是已经在刷新，存入队列
//       return new Promise((resolve) => {
//         requestsQueue.push((newToken) => {
//           error.config.headers.Authorization = `Bearer ${newToken}`;
//           resolve(service(error.config));
//         });
//       });
//     } else {
//       ElMessage.error(error.response?.data?.message || '请求失败，请稍后重试');
//     }
//     // 响应错误处理
//     // console.error('API Error: ', error);
//     return Promise.reject(error);
//   }
// );

service.interceptors.response.use(
  (response) => {
    const loadingStore = useLoadingStore();
    loadingStore.stopLoading(); // 响应成功时停止加载
    return response.data;
  }, // 成功直接返回数据
  async (error) => {
    const userStore = useUserStore();

    if (error.response?.status === 401) {
      try {
        // 尝试刷新 Token
        await userStore.handleTokenRefresh();
        // 刷新成功后重试原请求
        return service(error.config);
      } catch {
        // 刷新失败，触发登录过期弹窗
        userStore.isSessionExpired = true;
        return Promise.reject(error); // 返回失败
      }
    }

    // 处理其他错误
    ElMessage.error(error.response?.data?.message || '请求失败，请稍后重试');
    const loadingStore = useLoadingStore();
    loadingStore.stopLoading(); // 响应失败时停止加载
    return Promise.reject(error);
  }
);

export default service;
