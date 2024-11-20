<template>
  <div class="footer-root">
    <div>{{ BaseSettings.projectCopyright }}</div>
  </div>
</template>
<script setup>
import { BaseSettings } from '../../common';
</script>
<style lang="less" scoped>
.footer-root {
  height: 100%;
  width: 100%;
  // background: @footer-background-color;
  color: #959595;
  text-align: center;
  line-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #3b3a3a;
}
</style>
