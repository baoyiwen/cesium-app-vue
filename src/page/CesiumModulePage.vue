<template>
  <div class="content-root">
    <CesiumComponent
      :options="cesiumOptions"
      :performanceThresholds="{ maxDrawCalls: 800, minFrameRate: 20 }"
      @performanceLogged="handlePerformanceLog"
      @bottleneckDetected="handleBottleneck"
      @optimizationApplied="handleOptimization"
      @loaded="loadeds"
      :token="state.cesiumToken"
      :level-config="levelDatas"
      @modeChanged="CesiumModeChanged"
    />
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
// 获取文件地址
const getFiles = () => {
  const provinceURL = import.meta.glob(
    '/public/geojson/china_geojson_data/province/*.json'
  );

  const cityURL = import.meta.glob(
    '/public/geojson/china_geojson_data/citys/*.json'
  );

  const countyURL = import.meta.glob(
    '/public/geojson/china_geojson_data/county/*.json'
  );

  const getMatchedFiles = (dir) => {
    const files = [];
    const matchedFiles = Object.keys(dir).filter((file) =>
      file.startsWith(`/public/geojson/china_geojson_data`)
    );
    files.push(...matchedFiles.map((f) => f.replace('/public', '')));

    return files;
  };

  const filesObject = {
    provinceData: getMatchedFiles(provinceURL), // 全国各省地图
    cityData: getMatchedFiles(cityURL), // 全国各市地图
    countyData: getMatchedFiles(countyURL), // 全国各区县地图
  };

  return filesObject;
};

const dataFiles = getFiles();
const levelDatas = ref([
  {
    id: 'level-1',
    level: 'COUNTRY',
    height: 10000000,
    geojson: ['/geojson/china_geojson_data/china_geojson.json'], // 支持文件 & 文件夹
    fillColor: 'rgba(0, 0, 255, 0.4)', // 国家层级的填充颜色（蓝色半透明）
    outlineColor: '#FFFFFF', // 国家边界颜色（白色）
    entities: [
      {
        id: 'entity-1',
        position: [110, 30],
        label: '国家中心',
        // icon: '/icons/country.png',
      },
    ],
  },
  {
    id: 'level-2',
    level: 'PROVINCE',
    height: 3000000,
    geojson: dataFiles.provinceData,
    fillColor: '#00FF0088', // 省级填充颜色（绿色半透明）
    outlineColor: '#FFFF00', // 省级边界颜色（黄色）
    entities: [
      {
        id: 'entity-2',
        position: [114, 36],
        label: '省会',
        // icon: '/icons/province.png',
      },
    ],
  },
  {
    id: 'level-3',
    level: 'CITY',
    height: 500000,
    geojson: dataFiles.cityData,
    fillColor: '#FF0000', // 市级填充颜色（红色）
    outlineColor: '#000000', // 市级边界颜色（黑色）
    entities: [
      {
        id: 'entity-3',
        position: [120, 40],
        label: '城市',
        // icon: '/icons/city.png',
      },
    ],
  },
  {
    id: 'level-4',
    level: 'COUNTY',
    height: 100000,
    geojson: dataFiles.countyData,
    fillColor: '#ff2698', // 市级填充颜色（红色）
    outlineColor: '#000000', // 市级边界颜色（黑色）
    entities: [
      {
        id: 'entity-4',
        position: [116, 26],
        label: '城市',
        // icon: '/icons/city.png',
      },
    ],
  },
]);

const CesiumModeChanged = (data) => {
  console.error('mode changed: ', data);
};

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
}
</style>
