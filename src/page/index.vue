<!--
 * @Author: baoyiwen 511530203@qq.com
 * @Date: 2025-02-28 10:01:17
 * @LastEditors: baoyiwen 511530203@qq.com
 * @LastEditTime: 2025-06-02 12:29:18
 * @FilePath: \cesium-app-vue\src\page\index.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="content-root">
    <CesiumModulePage />
    <!-- <CesiumComponent
      :options="cesiumOptions"
      :performanceThresholds="{ maxDrawCalls: 800, minFrameRate: 20 }"
      @performanceLogged="handlePerformanceLog"
      @bottleneckDetected="handleBottleneck"
      @optimizationApplied="handleOptimization"
      @loaded="loadeds"
      :token="state.cesiumToken"
    /> -->
  </div>
</template>

<script setup>
import CesiumModulePage from '../page/CesiumModulePage.vue';
</script>
<style scoped lang="less">
.content-root {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  overflow: hidden;
  /* background-color: #0fff; */
}
</style>
