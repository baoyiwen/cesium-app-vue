<template>
  <div class="layout-root">
    <div class="header">
      <Header> </Header>
    </div>
    <div class="content">
      <div class="menu-layout">
        <Menu
          :menuItems="menus"
          :activeIndex="defaultActiveMenu"
          @menuClick="clickMenu"
        ></Menu>
      </div>
      <div class="content-layout">
        <CesiumModulePage />
        <div class="content-module">
          <keep-alive>
            <router-view />
          </keep-alive>
        </div>
      </div>
    </div>
    <div class="footer">
      <Footer> </Footer>
    </div>
  </div>
</template>
<script setup>
import { computed, onMounted, watch } from 'vue';
import Header from '../components/base/Header.vue';
import Footer from '../components/base/Footer.vue';
import Menu from '../components/base/menu.vue';
import { useMenuStore } from '../store/menuStore';
import { useRoute } from 'vue-router';
import CesiumModulePage from '../page/CesiumModulePage.vue';
const menuStore = useMenuStore();
const route = useRoute();
// 获取所有的menus/defaultActive
const menus = computed(() => menuStore.menus);
const defaultActiveMenu = computed(() => menuStore.activeMenu);

onMounted(() => {
  const menu = menus.value.find((menu) => route.path === menu.path);
  menuStore.setActiveMenu(menu ? menu : {});
});

const clickMenu = (data) => {
  console.error(data);
};
watch(
  () => route.path,
  (newPath) => {
    const menu = menus.value.find((menu) => newPath === menu.path);
    if (menu) {
      menuStore.setActiveMenu(menu);
    } else {
      menuStore.setActiveMenu('');
    }
  },
  {
    immediate: true,
  }
);
</script>
<style lang="less" scoped>
.layout-root {
  height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  .header {
    width: 100%;
    height: 2rem;
  }

  .content {
    width: 100%;
    height: calc(100% - 4rem);
    flex: 1;
    display: flex;
    background-color: #494949b8;
    .menu-layout {
      width: 2rem;
      height: 100%;
    }
    .content-layout {
      flex: 1;
      height: 100%;
      position: relative;
      .content-module {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        // background-color: aqua;
      }
    }
  }
  .footer {
    width: 100%;
    height: 2rem;
  }
}
</style>
