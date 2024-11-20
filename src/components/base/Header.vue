<template>
  <div class="header-root">
    <div class="header-logo">
      <div class="logo-warp">
        <img src="/vite.svg" alt="" />
      </div>
      <div class="title">{{ BaseSettings.title }}</div>
    </div>
    <div class="header-tools"></div>
  </div>
</template>
<script setup>
    import { BaseSettings } from '../../common'
</script>
<style lang="less" scoped>
.header-root {
  width: 100%;
  height: 100%;
  padding: 2px 5px;
  display: flex;
  .header-logo {
    height: 100%;
    display: flex;
    align-content: center;
    align-items: center;
    flex-direction: row;
    .logo-warp {
      width: 24px;
      height: 24px;
      img {
        height: 100%;
        width: 100%;
      }
    }
    .title {
      font-size: 18px;
      margin-left: 8px;
      user-select: none;
      font-weight: 400;
      color: #4b4b4b;
    }
  }
  .header-tools {
    flex: 1;
    height: 100%;
  }
}
</style>
