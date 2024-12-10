<template>
  <div class="content-root">
    <CesiumComponent :options="cesiumOptions" />
  </div>
</template>

<script setup>
import CesiumComponent from '../components/cesium/CesiumComponent.vue';
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
</script>
<style scoped>
.content-root {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  overflow: hidden;
}
</style>
