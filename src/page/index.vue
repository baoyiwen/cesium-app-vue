<template>
  <div class="content-root">
    
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
import { reactive, ref } from 'vue';
import CesiumComponent from '../components/cesium/CesiumComponent.vue';
const state = reactive({
  cesiumToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0NzFhYjc5My02YjcyLTRiODYtYTNmZS02ZjcxMWJkMjNiMTMiLCJpZCI6MjMyMTc3LCJpYXQiOjE3Mzg4MDgxMjB9.HLg6mO34PUne2nzscnhtJK7gnzbpUmsqbjU6NKjyBME`,
});
const cesiumOptions = ref({
  /**
   * 是否开启地图底图选择器开关。
   */
  baseLayerPicker: false,
  /**
   * 前基础影像图层的视图模型（如果未提供）将使用第一个可用的基础图层。
   * 仅当options.baseLayerPicker设置为true时，此值才有效。
   */
  // // imageryProviderViewModels: custom,
  // ArcGisMapServerImageryProvider: custom,
  // /**
  //  * 要使用的地形提供商
  //  */
  // terrainProvider: terrainProvider,
  // terrainProvider: await CesiumTerrainProvider.fromIonAssetId(1),

  infoBox: false,
  geocoder: true, // 隐藏查找控件。
  homeButton: false, // 隐藏视角返回初始位置按钮
  sceneModePicker: false, // 隐藏视角模式3D, 2D, CV,
  // baseLayerPicker: false, // 隐藏图层选择
  navigationHelpButton: false, // 隐藏帮助按钮
  animation: false, // 隐藏动画控件
  timeline: false, // 隐藏时间轴
});

const handlePerformanceLog = (log) => {
  // console.error('Performance Log:', log);
};

const handleBottleneck = (bottleneck) => {
  // console.error('Bottleneck Detected:', bottleneck);
};

const handleOptimization = (optimization) => {
  // console.error('Optimization Applied:', optimization);
};

const loadeds = (viewer) => {
  console.error('Loaded Viewer:', viewer);
};
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
