<!--
 * @Author: baoyiwen 511530203@qq.com
 * @Date: 2024-12-02 11:17:36
 * @LastEditors: baoyiwen 511530203@qq.com
 * @LastEditTime: 2025-04-26 12:40:07
 * @FilePath: \cesium-app-vue\src\App.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div id="app">
    <Layout />
    <Loading />
    <!-- 用于渲染路由页面 -->
    <!-- <el-dialog
      v-if="userStore.isSessionExpired"
      title="登录状态已过期"
      :visible.sync="userStore.isSessionExpired"
    >
      <p>您的登录状态已过期，请重新登录。</p>
      <div style="text-align: right">
        <el-button type="primary" @click="logout">重新登录</el-button>
      </div>
    </el-dialog> -->
  </div>
</template>
<script setup>
import { onMounted } from 'vue';
import { useUserStore } from './store/userStore';
import Loading from './views/Loading.vue';
import Layout from './layout/Layout.vue';
import { useMenuStore } from './store/menuStore';
const menuStore = useMenuStore();
const userStore = useUserStore();
const logout = () => {
  userStore.logout();
  location.reload(); // 刷新页面，回到首页或登录页
};

onMounted(() => {
  menuStore.generateMenus();
  menuStore.setDefaultActiveMenu();
});
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
