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
<template>
  <div class="cesium-container">
    <vc-viewer :scene-mode="3">
      <vc-entity v-for="(poly, index) in floodPolygons" :key="index">
        <vc-polygon-geometry :hierarchy="poly.positions" />
        <vc-polygon-material :fabric="getWaterMaterial(poly.depth)" />
      </vc-entity>
    </vc-viewer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as turf from '@turf/turf';
import { Delaunay } from 'd3-delaunay';

const props = defineProps({
  points: Array, // {lon, lat, height}
  waterLevel: Number,
});

const floodPolygons = ref([]);

function interpolateTIN(points) {
  const coords = points.map((p) => [p.lon, p.lat]);
  const heights = points.map((p) => p.height);

  const delaunay = Delaunay.from(coords);
  const triangles = delaunay.triangles;

  const tris = [];
  for (let i = 0; i < triangles.length; i += 3) {
    const a = triangles[i],
      b = triangles[i + 1],
      c = triangles[i + 2];
    const h1 = heights[a],
      h2 = heights[b],
      h3 = heights[c];
    const avgHeight = (h1 + h2 + h3) / 3;
    if (avgHeight < props.waterLevel) {
      tris.push({
        positions: [
          coords[a][0],
          coords[a][1],
          props.waterLevel,
          coords[b][0],
          coords[b][1],
          props.waterLevel,
          coords[c][0],
          coords[c][1],
          props.waterLevel,
        ],
        depth: props.waterLevel - avgHeight,
      });
    }
  }
  return tris;
}

function getWaterMaterial(depth) {
  const color = depthToColor(depth);
  return {
    type: 'Color',
    uniforms: {
      color: color,
    },
  };
}

function depthToColor(d) {
  const clamp = Math.min(Math.max(d, 0), 2);
  const alpha = 0.5 + 0.25 * clamp;
  return `rgba(0, 100, 255, ${alpha})`;
}

onMounted(() => {
  const polys = interpolateTIN(props.points);
  floodPolygons.value = polys;
});
</script>

<style scoped>
.cesium-container {
  width: 100%;
  height: 100vh;
}
</style>
