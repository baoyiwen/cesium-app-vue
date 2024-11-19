<template>
  <div id="app">
    <router-view />
    <!-- 用于渲染路由页面 -->
    <el-dialog
      v-if="userStore.isSessionExpired"
      title="登录状态已过期"
      :visible.sync="userStore.isSessionExpired"
    >
      <p>您的登录状态已过期，请重新登录。</p>
      <div style="text-align: right">
        <el-button type="primary" @click="logout">重新登录</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script setup>
import { useUserStore } from './store/userStore';
const userStore = useUserStore();
const logout = () => {
  userStore.logout();
  location.reload(); // 刷新页面，回到首页或登录页
};
</script>
<style scoped>
html,
body,
#app {
  height: 100vh;
  width: 100vw;
  padding: 0;
  margin: 0;
  overflow: hidden;
  font-family: Arial, sans-serif;
}
</style>
