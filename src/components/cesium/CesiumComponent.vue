<template>
  <div class="cesium-container" ref="cesiumContainer"></div>
  <!-- 加载进度条 -->
  <div v-if="state.loading" class="loading-overlay">
    Loading... {{ state.loadingProgress }}%
  </div>
  <!-- 性能瓶颈警告 -->
  <!-- <div v-if="state.performanceWarning" class="performance-overlay">
    <p>Performance Warning: {{ state.performanceWarning }}</p>
  </div> -->
  <!-- 性能日志图表 -->
  <!-- <div class="performance-chart-container" v-show="state.showPerformanceChart">
    <div class="performance-chart" ref="performanceChart"></div>
  </div> -->
  <!-- 自动化瓶颈分析报告 -->
  <!-- <div class="bottleneck-report" v-if="state.bottleneckReport.length > 0">
    <h3>Bottleneck Report</h3>
    <ul>
      <li v-for="(item, index) in state.bottleneckReport" :key="index">
        <strong>{{ item.type }}</strong> at {{ item.timestamp }}:
        {{ item.value }}
      </li>
    </ul>
  </div> -->
</template>

<script setup>
import * as Cesium from 'cesium';
import * as turf from '@turf/turf';
import {
  ref,
  reactive,
  onMounted,
  onBeforeUnmount,
  nextTick,
  watch,
  getCurrentInstance,
} from 'vue';
import * as echarts from 'echarts';
import { EllipsoidFadeEntity } from './Reader';
// import { RadarScanComponent } from './RadarScanComponent';
const instane = getCurrentInstance();
const formatDates = instane.proxy.$datasFormat;
const props = defineProps({
  options: {
    type: Object,
    default: () => ({}), // Cesium Viewer 初始化选项
  },
  performanceThresholds: {
    type: Object,
    default: () => ({
      maxDrawCalls: 1000, // 最大绘制调用数阈值
      minFrameRate: 15, // 最小帧率阈值
    }),
  },
  isOpenTerrain: {
    type: Boolean,
    default: false,
  },
  token: {
    type: String,
    default:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0N2YxOWQ0NC1mYTkyLTQzYTEtOWU0Ny1jOTQyOTE2ZDFlOTMiLCJpZCI6MjMyMTc3LCJpYXQiOjE3MjI4NDUxNzN9.UijwFTk4emxDLQHMXFaA2-36v3c1kKVV-EVs0OGO54o',
  },
});

const emit = defineEmits([
  'loaded',
  'performanceLogged',
  'bottleneckDetected',
  'optimizationApplied',
]);

const cesiumContainer = ref(null); // Cesium 容器引用
const performanceChart = ref(null); // 性能日志图表容器
let viewer = null; // Cesium Viewer 实例
let tileProgressListener = null; // 瓦片加载事件监听器引用
let performanceLogInterval = null; // 性能日志记录定时器
let radarPrimitive = null;

// // 添加雷达扫描效果
// let radarCenter = Cesium.Cartesian3.fromDegrees(116.391, 39.907); // 雷达中心（经纬度）
// const radarColor = Cesium.Color.RED.withAlpha(0.5); // 扫描颜色
// const scanSpeed = 1000; // 扫描速度，单位毫秒
// let radarRadius = 5000.0; // 雷达扫描半径，单位为米

// const createRadarScan = (viewer, position, color, duration, radarRadius) => {
//   radarPrimitive = new Cesium.Primitive({
//     geometryInstances: new Cesium.GeometryInstance({
//       geometry: new Cesium.CircleGeometry({
//         center: position, // 圆形的中心点
//         radius: radarRadius, // 圆形的半径
//         vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT, // 顶点格式，用于纹理和材质
//       }),
//     }),
//     appearance: new Cesium.EllipsoidSurfaceAppearance({
//       material: new Cesium.Material({
//         fabric: {
//           type: 'Color', // 材质类型为单色
//           uniforms: {
//             color: color, // 材质的颜色
//           },
//         },
//       }),
//     }),
//     asynchronous: false, // 设置为同步加载，以便立即显示
//   });
//   viewer.scene.primitives.add(radarPrimitive);
//   // requestAnimationFrame(() => {
//   //   upadteRadarPrimitive();
//   // });
//   // const upadteRadarPrimitive = () => {
//   //   const currentTime = viewer.clock.currentTime; // 使用 Cesium 的当前时间
//   //   const elapsedTime = Cesium.JulianDate.secondsDifference(
//   //     currentTime,
//   //     startTime
//   //   );
//   //   const rotationAngle = ((elapsedTime % 360) / 360) * Cesium.Math.TWO_PI;

//   //   const rotationMatrix = Cesium.Matrix3.fromRotationZ(rotationAngle);
//   //   // console.error(rotationMatrix);
//   //   const transform = Cesium.Transforms.eastNorthUpToFixedFrame(radarCenter);
//   //   radarPrimitive.modelMatrix = Cesium.Matrix4.multiplyByMatrix3(
//   //     transform,
//   //     rotationMatrix,
//   //     new Cesium.Matrix4()
//   //   );
//   //   upadteRadarPrimitive();
//   // };
//   // setInterval(() => {
//   //   const currentTime = viewer.clock.currentTime; // 使用 Cesium 的当前时间
//   //   const elapsedTime = Cesium.JulianDate.secondsDifference(
//   //     currentTime,
//   //     startTime
//   //   );
//   //   const rotationAngle = ((elapsedTime % 360) / 360) * Cesium.Math.TWO_PI;
//   //   console.error(rotationAngle);

//   //   const rotationMatrix = Cesium.Matrix3.fromRotationZ(rotationAngle);
//   //   const transform = Cesium.Transforms.eastNorthUpToFixedFrame(radarCenter);
//   //   radarPrimitive.modelMatrix = Cesium.Matrix4.multiplyByMatrix3(
//   //     transform,
//   //     rotationMatrix,
//   //     new Cesium.Matrix4()
//   //   );
//   // }, 2000);
//   let startTime = Cesium.JulianDate.now();
//   viewer.clock.onTick.addEventListener(() => {
//     const currentTime = Cesium.JulianDate.now();
//     const elapsedTime = Cesium.JulianDate.secondsDifference(
//       currentTime,
//       startTime
//     );
//     // console.error(elapsedTime);

//     // 确保时间差和角度为正值
//     const normalizedElapsedTime = ((elapsedTime % 360) + 360) % 360;
//     const rotationAngle = (normalizedElapsedTime / 360) * Cesium.Math.TWO_PI;

//     // 构造旋转矩阵并更新 modelMatrix
//     const rotationMatrix = Cesium.Matrix3.fromRotationZ(rotationAngle);
//     const transform = Cesium.Transforms.eastNorthUpToFixedFrame(radarCenter);
//     radarPrimitive.modelMatrix = Cesium.Matrix4.multiplyByMatrix3(
//       transform,
//       rotationMatrix,
//       new Cesium.Matrix4()
//     );
//   });
//   // viewer.clock.onTick.addEventListener(() => {
//   //   const currentTime = viewer.clock.currentTime; // 获取 Cesium 的当前时间
//   //   const elapsedTime = Cesium.JulianDate.secondsDifference(
//   //     currentTime,
//   //     startTime
//   //   );

//   //   // 确保时间差和角度为正值
//   //   const normalizedElapsedTime = ((elapsedTime % 360) + 360) % 360;
//   //   const rotationAngle = (normalizedElapsedTime / 360) * Cesium.Math.TWO_PI;

//   //   // 构造旋转矩阵并更新 modelMatrix
//   //   const rotationMatrix = Cesium.Matrix3.fromRotationZ(rotationAngle);
//   //   const transform = Cesium.Transforms.eastNorthUpToFixedFrame(radarCenter);
//   //   radarPrimitive.modelMatrix = Cesium.Matrix4.multiplyByMatrix3(
//   //     transform,
//   //     rotationMatrix,
//   //     new Cesium.Matrix4()
//   //   );
//   // });
// };

const state = reactive({
  loading: true, // 是否正在加载
  loadingProgress: 0, // 加载进度百分比
  performanceLogs: [], // 性能日志记录
  performanceWarning: null, // 性能瓶颈警告
  showPerformanceChart: true, // 是否显示性能日志图表
  bottleneckReport: [], // 自动化瓶颈分析报告
  bottleneckPoints: [], // 用于标记图表上的瓶颈点
});

// **初始化 Cesium Viewer**
const initCesium = async () => {
  try {
    state.loading = true;

    // 异步加载全球地形
    let terrainProvider = null;
    if (props.isOpenTerrain) {
      terrainProvider = await Cesium.createWorldTerrainAsync({
        /**
         * 标记，用于指示客户端是否应从服务器请求每片水面罩（如果有）。
         */
        requestWaterMask: false,
        /**
         * 指示客户端是否应从服务器请求其他照明信息（如果有）的标志。
         */
        requestVertexNormals: false,
      }).then((data) => {
        console.error(data);
      });
    }
    window.terrain = terrainProvider;
    // console.error(terrainProvider);
    // 配置Cesium的Token
    if (!props.token) {
      console.error(
        'Missing Cesium Token! Please provide a valid access token.'
      );
      return
    } else {
      Cesium.Ion.defaultAccessToken = props.token;
    }
    // 初始化 Viewer
    viewer = new Cesium.Viewer(cesiumContainer.value, {
      terrainProvider,
      mapProjection: new Cesium.WebMercatorProjection(), // 确保 mapProjection 被正确配置
      contextOptions: {
        webgl: {
          alpha: true,
          depth: true,
          stencil: true,
          antialias: true,
          premultipliedAlpha: true,
          preserveDrawingBuffer: true,
          failIfMajorPerformanceCaveat: true,
        },
      },
      sceneMode: Cesium.SceneMode.SCENE3D, // 设置为3D场景模式
      ...props.options,
    });
    // const radarScanComponent = new RadarScanComponent(viewer);
    // radarScanComponent.initialize();
    // viewer.dataSources.add(geojsonDataSource);
    // // viewer.scene.globe.depthTestAgainstTerrain = true;
    // viewer.flyTo(geojsonDataSource);
    viewer.scene.debugShowFramesPerSecond = true;
    // 监听瓦片加载进度
    tileProgressListener = monitorTileLoading();

    // 性能监控
    monitorPerformance();
    window.map = viewer;
    emit('loaded', viewer); // 通知父组件 Viewer 加载完成
    console.error("Cesium Token:", Cesium.Ion.defaultAccessToken);
  } catch (error) {
    console.error('Cesium initialization error:', error);
  }
};

// **性能监控与瓶颈点标记**
const monitorPerformance = () => {
  const logMetrics = async () => {
    const frameRate = viewer.scene.frameState.frameRate || 0;
    const drawCalls = viewer.scene.frameState.commandList.length;

    // 记录日志
    const log = {
      timestamp: formatDates(new Date().toISOString()).format(
        'YYYY-MM-DD hh:mm:ss'
      ),
      frameRate,
      drawCalls,
    };
    state.performanceLogs.push(log);
    emit('performanceLogged', log);

    // 性能瓶颈分析与响应
    if (drawCalls > props.performanceThresholds.maxDrawCalls) {
      const bottleneck = {
        type: 'High Draw Calls',
        value: drawCalls,
        timestamp: log.timestamp,
      };
      state.performanceWarning = `High draw calls: ${drawCalls}`;
      state.bottleneckReport.push(bottleneck); // 添加到瓶颈报告
      state.bottleneckPoints.push({
        name: 'Bottleneck',
        coord: [log.timestamp, drawCalls],
      }); // 图表标记
      emit('bottleneckDetected', bottleneck);
      await applyOptimization('reduceEntities');
    } else if (frameRate < props.performanceThresholds.minFrameRate) {
      const bottleneck = {
        type: 'Low Frame Rate',
        value: frameRate,
        timestamp: log.timestamp,
      };
      state.performanceWarning = `Low frame rate: ${frameRate} FPS`;
      state.bottleneckReport.push(bottleneck); // 添加到瓶颈报告
      state.bottleneckPoints.push({
        name: 'Bottleneck',
        coord: [log.timestamp, frameRate],
        yAxis: frameRate,
      }); // 图表标记
      emit('bottleneckDetected', bottleneck);
      await applyOptimization('reduceQuality');
    } else {
      state.performanceWarning = null;
    }

    // 更新性能日志图表
    // updatePerformanceChart();
  };

  performanceLogInterval = setInterval(logMetrics, 5000);
};

// **瓶颈响应优化策略**
const applyOptimization = async (strategy) => {
  switch (strategy) {
    case 'reduceEntities': // 减少实体数量
      console.warn('Applying optimization: Reducing entities');
      emit('optimizationApplied', { strategy: 'reduceEntities' });
      await reduceEntities();
      break;

    case 'reduceQuality': // 降低渲染质量
      console.warn('Applying optimization: Reducing rendering quality');
      // viewer.scene.fxaa = false; // 关闭抗锯齿
      // viewer.scene.fog.enabled = false; // 禁用雾效
      // viewer.scene.globe.maximumScreenSpaceError = 10; // 降低地球表面渲染精度
      emit('optimizationApplied', { strategy: 'reduceQuality' });
      break;

    default:
      console.warn('Unknown optimization strategy:', strategy);
  }
};

// **减少实体数量**
const reduceEntities = async () => {
  const entities = viewer.entities.values;

  for (let i = entities.length - 1; i >= 0; i--) {
    if (entities[i].priority && entities[i].priority < 5) {
      viewer.entities.remove(entities[i]);
    }
  }
};

// **性能日志图表**
// const initPerformanceChart = async () => {
//   await nextTick(); // 确保 DOM 渲染完成

//   const chart = echarts.init(performanceChart.value);
//   chart.setOption({
//     title: { text: 'Performance Metrics', left: 'center' },
//     tooltip: { trigger: 'axis' },
//     legend: { data: ['Frame Rate', 'Draw Calls'], bottom: '0' },
//     grid: { left: '10%', right: '10%', top: '15%', bottom: '15%' },
//     xAxis: { type: 'category', data: [] },
//     yAxis: [
//       { type: 'value', name: 'Frame Rate (FPS)', min: 0 },
//       { type: 'value', name: 'Draw Calls', min: 0 },
//     ],
//     series: [
//       { name: 'Frame Rate', type: 'line', data: [], markPoint: { data: [] } },
//       { name: 'Draw Calls', type: 'line', data: [], markPoint: { data: [] } },
//     ],
//   });

//   state.performanceChartInstance = chart;
// };

// const updatePerformanceChart = () => {
//   if (!state.performanceChartInstance) return;

//   const categories = state.performanceLogs.map((log) => log.timestamp);
//   const frameRateData = state.performanceLogs.map((log) => log.frameRate);
//   const drawCallsData = state.performanceLogs.map((log) => log.drawCalls);

//   state.performanceChartInstance.setOption({
//     xAxis: { data: categories },
//     series: [
//       {
//         name: 'Frame Rate',
//         data: frameRateData,
//         markPoint: {
//           data: state.bottleneckPoints.filter(
//             (point) =>
//               point.coord[1] <= props.performanceThresholds.minFrameRate
//           ),
//         },
//       },
//       {
//         name: 'Draw Calls',
//         data: drawCallsData,
//         markPoint: {
//           data: state.bottleneckPoints.filter(
//             (point) => point.coord[1] > props.performanceThresholds.maxDrawCalls
//           ),
//         },
//       },
//     ],
//   });
// };

// **加载进度条显示**
const monitorTileLoading = () => {
  const globe = viewer.scene.globe;

  const listener = (remainingTiles) => {
    if (remainingTiles === 0) {
      state.loadingProgress = 100; // 加载完成
      state.loading = false;
    } else {
      const maxTiles = 100;
      state.loadingProgress = Math.min(
        100,
        ((maxTiles - remainingTiles) / maxTiles) * 100
      ).toFixed(0);
    }
  };

  globe.tileLoadProgressEvent.addEventListener(listener);
  return listener;
};

// **销毁 Cesium Viewer 并释放内存**
const destroyCesium = () => {
  if (viewer) {
    if (performanceLogInterval) {
      clearInterval(performanceLogInterval);
      performanceLogInterval = null;
    }
    if (tileProgressListener) {
      viewer.scene.globe.tileLoadProgressEvent.removeEventListener(
        tileProgressListener
      );
      tileProgressListener = null;
    }
    viewer.destroy();
    viewer = null;
    if (cesiumContainer.value) {
      cesiumContainer.value.innerHTML = '';
    }
  }
};

// **重新加载 Cesium**
const reloadCesium = () => {
  destroyCesium();
  initCesium();
  // initPerformanceChart();
};

// 雷达扫描效果

// **生命周期钩子**
onMounted(() => {
  if (!props.token) {
    console.error(`Please fill in the correct token!`);
  }
  initCesium().then(() => {
    // createRadarCircle();
    // addEventListeners();
  });
  // initPerformanceChart();
});

onBeforeUnmount(() => {
  destroyCesium(); // 页面销毁时释放 Cesium 资源
});
const originalGeoJson = (dataSource) => {
  const geoJson = dataSource.entities.values
    .map((entity) => {
      let coordinates = null;

      // 处理不同的几何类型
      if (entity.position) {
        const position = entity.position.getValue(Cesium.JulianDate.now());
        const cartographic = Cesium.Cartographic.fromCartesian(position);
        coordinates = [
          Cesium.Math.toDegrees(cartographic.longitude),
          Cesium.Math.toDegrees(cartographic.latitude),
        ];
      } else if (entity.polygon) {
        const hierarchy = entity.polygon.hierarchy.getValue(
          Cesium.JulianDate.now()
        );
        coordinates = hierarchy.positions.map((pos) => {
          const cartographic = Cesium.Cartographic.fromCartesian(pos);
          return [
            Cesium.Math.toDegrees(cartographic.longitude),
            Cesium.Math.toDegrees(cartographic.latitude),
          ];
        });
      }

      if (coordinates) {
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: coordinates[0], // 取第一个点作为示例
          },
          properties: entity.properties,
        };
      }
      return null;
    })
    .filter((feature) => feature !== null);

  return {
    type: 'FeatureCollection',
    features: geoJson,
  };
};

// // 创建实体并应用材质
// const ellipsoidFadeMaterialProperty = new EllipsoidFadeMaterialProperty({
//   color: new Cesium.Color(1.0, 0.0, 0.0, 1.0),
//   duration: 1000,
// });
// console.error(
//   ellipsoidFadeMaterialProperty.getValue,
//   ellipsoidFadeMaterialProperty.getType
// );
// 监听地图是否加载完成，然后在加载其他资源
watch(
  () => state.loadingProgress,
  (nv, ov) => {
    if (nv >= 100 && Cesium.Ion.defaultAccessToken) {
      /**
       * Geojson 数据使用。
       */
      Cesium.GeoJsonDataSource.load('/geojson/cq-map-data.json', {
        clampToGround: false, // 确保多边形贴地
      }).then((data) => {
        if (!viewer.dataSources.getByName(data.name).length) {
          viewer.dataSources.add(data);
          const entities = data.entities.values;
          // console.error('entities', entities, viewer);
          // // 设置样式
          // data.style = new Cesium.Cesium3DTileStyle({
          //   color: "color('red', 0.6)", // 设置  为红色
          // });

          // console.error('sample', sample.features);
          // console.error(Cesium.Cartesian3.fromDegrees(data));
          viewer.flyTo(data).then(() => {
            const originGeojson = originalGeoJson(data);
            const centroid = turf.centroid(originGeojson);
            // radarCenter = Cesium.Cartesian3.fromDegrees(
            //   centroid.geometry.coordinates[0],
            //   centroid.geometry.coordinates[1]
            // );

            flyTo(
              [
                centroid.geometry.coordinates[0],
                centroid.geometry.coordinates[1],
                20000,
              ],
              () => {
                const ellipsoidFadeEntity = new EllipsoidFadeEntity(
                  'reader-test',
                  centroid,
                  0,
                  Cesium.Color.BLUE,
                  1000
                );

                viewer.entities.add(ellipsoidFadeEntity.entity);

                const readerTest = viewer.entities.getById('reader-test');
                // console.error(readerTest);
                // console.error(viewer.entities);
                // console.error(centroid);
                // setTimeout(() => {
                //   viewer.entities.removeById('reader-test');
                // }, 10000)
                // viewer.camera.flyTo(viewer.entities)
                viewer.zoomTo(viewer.entities).then((res) => {
                  // console.error('完成 zoomTo');
                });
              }
            );
          });
        }
      });
    }
  }
);

const flyTo = (position, callback) => {
  if (!viewer) {
    return;
  }
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(...position),
    complete: callback,
  });
};
</script>

<style lang="less" scoped>
.cesium-container {
  width: 100%;
  height: 100%;
}
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 20px;
}
.performance-overlay {
  position: absolute;
  top: 10%;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px;
  background: rgba(255, 165, 0, 0.9);
  color: #fff;
  border-radius: 5px;
  font-size: 16px;
  z-index: 10;
}
.performance-chart-container {
  position: absolute;
  bottom: 10px;
  left: 10px;
  width: calc(100% - 20px);
  height: 300px;
  z-index: 10;
}
.performance-chart {
  width: 100%;
  height: 100%;
}
.bottleneck-report {
  position: absolute;
  right: 10px;
  top: 10px;
  background: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  max-width: 300px;
  z-index: 10;
}
.bottleneck-report h3 {
  margin: 0;
  margin-bottom: 5px;
}
</style>
<style lang="less">
.cesium-viewer-bottom {
  display: none !important;
}
</style>
