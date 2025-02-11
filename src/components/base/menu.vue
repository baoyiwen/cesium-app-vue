<template>
  <div class="menu-root">
    <el-menu
      :default-active="isActiveMenu"
      class="el-menu"
      router
      background-color="#ffffff"
      text-color="#333333"
      active-text-color="#409eff"
      @select="handleMenuClick"
      :collapse="true"
    >
      <el-menu-item
        v-for="(item, index) in menuItems"
        :key="item.path || index"
        :index="item.path"
        class="el-menu-item"
        :title="item.label"
      >
        <!-- 动态加载图标 -->

        <!-- <template v-if="isIconComponent(item.icon)">
          <el-icon>
            <component :is="getAsyncComponent(item.icon)" />
          </el-icon>
          <span slot="title"> {{ item.label }}</span>
        </template>
        <template v-else>
          <img v-lazy="item.icon" alt="icon" class="menu-icon" />
          <span slot="title"> {{ item.label }}</span>
        </template> -->
        <template v-if="isActiveMenu(activeIndex, item.path)">
          <img v-lazy="item.activeIcon" alt="icon" class="menu-icon" />
          <span slot="title"> {{ item.label }}</span>
        </template>
        <template v-else>
          <img v-lazy="item.icon" alt="icon" class="menu-icon" />
          <span slot="title"> {{ item.label }}</span>
        </template>
        <!-- <span slot="title"> {{ item.label }}</span> -->
      </el-menu-item>
    </el-menu>
  </div>
</template>
<script setup>
import { defineAsyncComponent } from 'vue';
import { useRouter } from 'vue-router';
import { useMenuStore } from '../../store/menuStore';

const props = defineProps({
  menuItems: {
    type: Array,
    required: true,
    default: () => [],
  },
  activeIndex: {
    type: Object,
    default: () => ({
      path: '',
      label: '',
      icon: '',
      activeIcon: '',
      isDefault: false, // 默认选项
    }), // 当前激活项

    isCollapse: {
      type: Boolean,
      default: false,
    },
  },
});
const emit = defineEmits(['menuClick']); // 抛出 menuClick 事件

// 获取菜单 store 和路由
const menuStore = useMenuStore();
const router = useRouter();

// 定义暴露的事件

// 判断图标是否为组件
const isIconComponent = (icon) => {
  return typeof icon === 'string' && /^[A-Z]/.test(icon); // 判断大写字母开头
};
// 判断当前菜单是否激活
const isActiveMenu = (activeIndex, path) => {
  // console.error(activeIndex.path === path, activeIndex);
  return activeIndex.path === path;
};

// 动态加载组件图标
// const getAsyncComponent = (iconName) =>
//   defineAsyncComponent(() => import(`@element-plus/icons-vue/${iconName}`));
// 菜单点击逻辑
const handleMenuClick = (path) => {
  // 找到点击的菜单对象
  const clickedMenu = props.menuItems.find((item) => item.path === path);
  menuStore.setActiveMenu(clickedMenu); // 更新激活菜单
  router.push(path); // 路由跳转
  emit('menuClick', clickedMenu); // 抛出事件，通知父组件
};
</script>
<style lang="less">
.menu-root {
  height: 100%;
  width: 100%;
  .el-menu {
    height: 100%;
    width: 100%;
    padding: 5px 0;
    background-color: #494949b8;
    border: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    .el-menu-item {
      width: 1.5rem;
      height: 1.5rem;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
      border-radius: 50%;
      overflow: hidden;
      &:hover {
        img {
          transform: scale(1.2);
        }
      }
      img {
        transition: .4s all;
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
