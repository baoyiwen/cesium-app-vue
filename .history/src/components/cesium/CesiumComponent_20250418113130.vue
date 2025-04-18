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
import {
  ref,
  reactive,
  onMounted,
  onBeforeUnmount,
  nextTick,
  watch,
  getCurrentInstance,
  toRaw,
} from 'vue';
import * as echarts from 'echarts';
import { EllipsoidFadeEntity } from './Reader';
import { scaleLinear } from 'd3';
import * as turf from '@turf/turf';
// import { resolveGeoJsonFiles } from '../../utils/cesium';
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
// console.error(props.levelConfig);
const emit = defineEmits([
  'loaded',
  'performanceLogged',
  'bottleneckDetected',
  'optimizationApplied',
  'levelChange',
  'dataLoaded',
  'modeChanged',
]);

const cesiumContainer = ref(null); // Cesium 容器引用
const performanceChart = ref(null); // 性能日志图表容器
let viewer = null; // Cesium Viewer 实例
let tileProgressListener = null; // 瓦片加载事件监听器引用
let performanceLogInterval = null; // 性能日志记录定时器
let radarPrimitive = null;

const state = reactive({
  loading: true, // 是否正在加载
  loadingProgress: 0, // 加载进度百分比
  performanceLogs: [], // 性能日志记录
  performanceWarning: null, // 性能瓶颈警告
  showPerformanceChart: true, // 是否显示性能日志图表
  bottleneckReport: [], // 自动化瓶颈分析报告
  bottleneckPoints: [], // 用于标记图表上的瓶颈点

  currentLevelId: null, // 当前渲染层级ID
  previousZoomHeight: null, // 记录上一次 zoom 级别
  loadedLevels: new Map(), // 加载的层级映射
  currentLevel: 0, // 当前
  scale: null, // 比例尺
  reverseScale: null, // 反向比例尺
  mode: 3, // 地图模式
});

// 初始化scale
const initState = () => {
  state.scale = scaleLinear()
    .domain([0, props.maxCameraHeight])
    .range([props.maxZoom, 0]);
  state.reverseScale = scaleLinear()
    .domain([props.maxZoom, 0])
    .range([0, props.maxCameraHeight]);
};

// **转换标准 `rgba` 或 `#hex` 颜色到 Cesium.Color**
const convertColor = (color) => {
  if (!color) return Cesium.Color.WHITE; // 默认白色

  // **RGBA 格式**
  if (color.startsWith('rgba')) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]*)?\)/);
    if (match) {
      const r = parseFloat(match[1]) / 255;
      const g = parseFloat(match[2]) / 255;
      const b = parseFloat(match[3]) / 255;
      const a = match[4] ? parseFloat(match[4]) : 1.0;
      return new Cesium.Color(r, g, b, a);
    }
  }

  // **十六进制格式**
  if (color.startsWith('#')) {
    let r,
      g,
      b,
      a = 1.0;
    if (color.length === 7) {
      // `#RRGGBB`
      r = parseInt(color.slice(1, 3), 16) / 255;
      g = parseInt(color.slice(3, 5), 16) / 255;
      b = parseInt(color.slice(5, 7), 16) / 255;
    } else if (color.length === 9) {
      // `#RRGGBBAA`
      r = parseInt(color.slice(1, 3), 16) / 255;
      g = parseInt(color.slice(3, 5), 16) / 255;
      b = parseInt(color.slice(5, 7), 16) / 255;
      a = parseInt(color.slice(7, 9), 16) / 255;
    } else {
      return Cesium.Color.WHITE; // 无效格式返回白色
    }
    return new Cesium.Color(r, g, b, a);
  }

  return Cesium.Color.WHITE; // 默认返回白色
};

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
    // 配置Cesium的Token
    if (!props.token) {
      console.error(
        'Missing Cesium Token! Please provide a valid access token.'
      );
      return;
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
    viewer.camera.positionCartographic.height = props.maxCameraHeight;
    viewer.scene.mode = state.mode;
    viewer.scene.debugShowFramesPerSecond = true;
    // 监听瓦片加载进度
    tileProgressListener = monitorTileLoading();
    forceInitialLoading();

    // 性能监控
    monitorPerformance();
    window.map = viewer;

    emit('loaded', viewer); // 通知父组件 Viewer 加载完成
    initState();
    addGeoJson('/geojson/cq-map-data.json', {
      layerId: 'district-chongqing', // ✅ 唯一 ID
      clampToGround: true,
      stroke: '#fff', // 边框颜色
      strokeWidth: 2, // 边框宽度
      fill: 'rgba(52, 36, 200, 0.5)', // 填充颜色（含透明度）
      polyline: {
        width: 2,
        material: '#ff0000',
        clampToGround: true,
      },
    });

    // const districtLayer = await loadGeojsonAsEntity({
    //   viewer,
    //   geojson: '/geojson/cq-map-data.json',
    //   layerId: 'district-chongqing', // ✅ 唯一 ID
    //   polygon: {
    //     material: Cesium.Color.GREEN.withAlpha(0.4),
    //   },
    //   polyline: {
    //     width: 2,
    //     material: Cesium.Color.BLACK,
    //   },
    //   label: {
    //     field: 'name',
    //   },
    // });
    // console.error(districtLayer);

    // viewer.screenSpaceEventHandler.setInputAction((clickEvent) => {
    //   const pickedPosition = viewer.camera.pickEllipsoid(
    //     clickEvent.position,
    //     viewer.scene.globe.ellipsoid
    //   );

    //   if (pickedPosition) {
    //     const cartographic = Cesium.Cartographic.fromCartesian(pickedPosition);
    //     const longitude = Cesium.Math.toDegrees(cartographic.longitude);
    //     const latitude = Cesium.Math.toDegrees(cartographic.latitude);
    //     viewer.entities.removeById('marker'); // 移除之前的标记
    //     viewer.entities.add({
    //       id: 'marker',
    //       position: Cesium.Cartesian3.fromDegrees(longitude, latitude, 100),
    //       point: {
    //         pixelSize: 10,
    //         color: Cesium.Color.RED,
    //       },
    //     });
    //   }
    // }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    // emit('modeChanged', {
    //   mode: state.mode,
    // });
  } catch (error) {
    console.error('Cesium initialization error:', error);
  }
};

/**
 *
 * @param url
 * @param options
 * 参数名	          说明	                   默认值
 *  fill	          面的填充色	             Cesium.Color.BLUE.withAlpha
 *  stroke	        默认轮廓线颜色（已禁用）	 Cesium.Color.TRANSPARENT
 *  strokeWidth	    默认边界线宽（已禁用）	   2
 *  outline	        是否启用原始 outline	    false
 *  polylineColor	  手动画边界线的颜色	      Cesium.Color.RED
 *  polylineWidth	  手动画边界线的宽度	      2
 *  showPolyline	  是否绘制 polyline 模拟边界线	true
 *  dataSourceName	设置数据源名称（可用于查找）	undefined
 * @param callback
 */
// 添加geojson数据
const addGeoJson = (url, options = {}, callback) => {
  const layerId = options.layerId || `geojson-${Date.now()}`; // 唯一标识

  const props = {
    clampToGround: true,
    stroke: '#fff',
    strokeWidth: 2,
    fill: 'rgba(52, 36, 200, 0.5)',
    polyline: {
      width: 2,
      material: '#ff0000',
      clampToGround: true,
    },
    showPolyline: true,
    showLabel: true,
    labelField: 'name',
    ...options,
    layerId,
  };

  const addedEntities = [];

  // const convertColor = (colorStr) => {
  //   if (!colorStr) return Cesium.Color.WHITE;
  //   if (colorStr.startsWith('rgba')) {
  //     const parts = colorStr.match(/[\d.]+/g).map(Number);
  //     return new Cesium.Color(
  //       parts[0] / 255,
  //       parts[1] / 255,
  //       parts[2] / 255,
  //       parts[3]
  //     );
  //   } else {
  //     return Cesium.Color.fromCssColorString(colorStr);
  //   }
  // };

  const processGroupedEntities = (dataSource, props) => {
    const grouped = new Map();

    dataSource.entities.values.forEach((entity) => {
      if (!entity.polygon || !entity.properties) return;

      const key =
        entity.properties.adcode?.getValue(Cesium.JulianDate.now()) ??
        entity.properties.name?.getValue(Cesium.JulianDate.now()) ??
        entity.id;

      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(entity);
    });

    grouped.forEach((entities, key) => {
      const allPolygonPositions = [];

      entities.forEach((entity) => {
        const hierarchy = entity.polygon.hierarchy?.getValue(
          Cesium.JulianDate.now()
        );
        if (hierarchy?.positions) {
          const ring = hierarchy.positions;
          allPolygonPositions.push(ring);

          // ✅ 添加 Polyline 边界线
          if (props.showPolyline) {
            const polylineEntity = viewer.entities.add({
              polyline: {
                positions: ring,
                width: props.polyline.width,
                material: convertColor(props.polyline.material),
                clampToGround: props.polyline.clampToGround,
              },
              layerId: props.layerId,
              _geojsonTag: true,
              _type: 'polyline',
            });
            addedEntities.push(polylineEntity);
          }
        }
      });

      // ✅ 合并所有 polygon 到 turf 中心点
      if (props.showLabel) {
        const turfPolygons = allPolygonPositions.map((ring) => {
          const coords = ring.map((p) => {
            const carto = Cesium.Cartographic.fromCartesian(p);
            return [
              Cesium.Math.toDegrees(carto.longitude),
              Cesium.Math.toDegrees(carto.latitude),
            ];
          });
          if (
            coords.length > 0 &&
            JSON.stringify(coords[0]) !==
              JSON.stringify(coords[coords.length - 1])
          ) {
            coords.push(coords[0]);
          }
          return turf.polygon([coords]);
        });

        if (turfPolygons.length === 0) return;
        console.error(turfPolygons, 'turfPolygons');
        const unionPolygon =
          turfPolygons.length === 1
            ? turfPolygons[0]
            : turfPolygons.reduce((a, b) => turf.union(a, b));
        const centroid = turf.centroid(unionPolygon).geometry.coordinates;
        const centerCartesian = Cesium.Cartesian3.fromDegrees(
          centroid[0],
          centroid[1]
        );

        const featureProps = entities[0].properties;
        let name = '未知区域';
        if (featureProps?.[props.labelField]) {
          const fieldProp = featureProps[props.labelField];
          name =
            typeof fieldProp.getValue === 'function'
              ? fieldProp.getValue(Cesium.JulianDate.now())
              : fieldProp;
        }

        const labelEntity = viewer.entities.add({
          position: centerCartesian,
          label: {
            text: name,
            font: '16px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          layerId: props.layerId,
          _geojsonTag: true,
          _type: 'label',
        });
        addedEntities.push(labelEntity);
      }
    });
  };

  return Cesium.GeoJsonDataSource.load(url, {
    clampToGround: props.clampToGround,
    stroke: Cesium.Color.TRANSPARENT,
    fill: convertColor(props.fill),
    strokeWidth: props.strokeWidth,
  })
    .then((dataSource) => {
      viewer.dataSources.add(dataSource);

      // ✅ 处理 entity 分组、合并、统一绘制
      processGroupedEntities(dataSource, props);

      // ✅ 镜头飞行
      viewer
        .flyTo(dataSource)
        .then(() => callback?.())
        .catch((err) => console.warn('飞行被中断 ❌', err));

      // ✅ 返回可管理对象
      return {
        layerId,
        dataSource,
        entities: addedEntities,
        clear: () => {
          addedEntities.forEach((e) => viewer.entities.remove(e));
          viewer.dataSources.remove(dataSource, true);
        },
        getEntities: () =>
          viewer.entities.values.filter((e) => e.layerId === layerId),
        getByType: (type) =>
          viewer.entities.values.filter(
            (e) => e.layerId === layerId && e._type === type
          ),
      };
    })
    .catch((err) => {
      console.error('加载 GeoJSON 数据失败:', err);
    });
};

const loadGeojsonAsEntity = async (options) => {
  const {
    viewer,
    geojson,
    flyTo = true,
    layerId = `geojson-layer-${Date.now()}`, // ✅ 默认唯一标识
    label = true,
    polygon = {},
    polyline = {},
    onEntity,
  } = options;

  if (!viewer) throw new Error('请传入 Cesium.Viewer 实例');

  const geoData =
    typeof geojson === 'string'
      ? await fetch(geojson).then((res) => res.json())
      : geojson;

  const flat = turf.flatten(geoData);
  const addedEntities = [];

  flat.features.forEach((feature, i) => {
    const coords = feature.geometry.coordinates[0];
    const positions = coords.map(([lon, lat]) =>
      Cesium.Cartesian3.fromDegrees(lon, lat)
    );

    // ✅ 添加 Polygon
    if (polygon !== false) {
      const {
        clampToGround = true,
        material = Cesium.Color.BLUE.withAlpha(0.4),
        height,
        extrudedHeight,
        outline = false,
        outlineColor,
      } = polygon;

      const polygonEntity = viewer.entities.add({
        polygon: {
          hierarchy: new Cesium.PolygonHierarchy(positions),
          material,
          height,
          extrudedHeight,
          heightReference: clampToGround
            ? Cesium.HeightReference.CLAMP_TO_GROUND
            : Cesium.HeightReference.NONE,
          outline,
          outlineColor,
        },
        properties: feature.properties,
        layerId, // ✅ 赋值唯一标识
        _geojsonTag: true,
        _type: 'polygon',
      });

      addedEntities.push(polygonEntity);
      onEntity?.(polygonEntity, feature.properties);
    }

    // ✅ 添加 Polyline
    if (polyline !== false) {
      const {
        width = 2,
        material = Cesium.Color.RED,
        clampToGround = true,
      } = polyline;

      const polylineEntity = viewer.entities.add({
        polyline: {
          positions,
          width,
          material,
          clampToGround,
        },
        layerId, // ✅ 同样打标识
        _geojsonTag: true,
        _type: 'polyline',
      });

      addedEntities.push(polylineEntity);
    }

    // ✅ 添加 Label
    if (label !== false) {
      const { field = 'name', style = {} } =
        typeof label === 'object' ? label : {};

      const center = turf.centroid(feature).geometry.coordinates;
      const centerCartesian = Cesium.Cartesian3.fromDegrees(
        center[0],
        center[1]
      );
      const name =
        feature.properties?.[field] ?? feature.properties?.name ?? '未命名';

      const labelEntity = viewer.entities.add({
        position: centerCartesian,
        label: {
          text: name,
          font: '16px sans-serif',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          ...style,
        },
        layerId, // ✅ 标记归属
        _geojsonTag: true,
        _type: 'label',
      });

      addedEntities.push(labelEntity);
    }
  });

  // ✅ 飞行定位
  if (flyTo && addedEntities.length > 0) {
    viewer.flyTo(addedEntities);
  }

  // ✅ 返回带管理能力的结果
  return {
    layerId,
    entities: addedEntities,
    clear: () => {
      addedEntities.forEach((e) => viewer.entities.remove(e));
    },
    getEntities: () =>
      viewer.entities.values.filter((e) => e.layerId === layerId),
    getByType: (type) =>
      viewer.entities.values.filter(
        (e) => e.layerId === layerId && e._type === type
      ),
  };
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

  // 监听瓦片加载进度事件
  globe.tileLoadProgressEvent.addEventListener(listener);
  // 强制更新进度条，防止卡在99%不动
  const forceCompleteLoading = () => {
    state.loadingProgress = 100;
    state.loading = false;
  };

  viewer.scene.camera.changed.addEventListener(__updateModeLoading);

  // // 监听渲染事件，确保每次渲染后进度条正确更新
  // viewer.scene.postRender.addEventListener(() => {
  //   if (state.loadingProgress < 100) {
  //     forceCompleteLoading(); // 强制完成加载，避免卡在99%
  //   }
  // });

  return listener;
};

const __updateModeLoading = () => {
  const mode = viewer.scene.mode;
  // 强制更新进度条，防止卡在99%不动
  const forceCompleteLoading = () => {
    state.loadingProgress = 100;
    state.loading = false;
  };
  if (
    mode === Cesium.SceneMode.SCENE2D ||
    mode === Cesium.SceneMode.COLUMBUS_VIEW
  ) {
    //2D模式下更新进度条
    state.loadingProgress = 100;
    state.loading = false;
  } else if (mode === Cesium.SceneMode.SCENE3D) {
    if (state.loadingProgress < 100) {
      forceCompleteLoading();
    }
  }
  emit('modeChanged', {
    mode: viewer.scene.mode,
  });
};

// 强制初始化加载进度（避免初始化时卡在 99%）
const forceInitialLoading = () => {
  // 如果初始模式为 2D，则强制进度为 100%，避免卡住
  if (viewer.scene.mode === Cesium.SceneMode.SCENE2D) {
    state.loadingProgress = 100;
    state.loading = false;
  }
};

// **销毁 Cesium Viewer 并释放内存**
const destroyCesium = () => {
  if (viewer) {
    viewer.camera.changed.removeEventListener(updateMapLevel);
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

// 监听地图是否加载完成，然后在加载其他资源
watch(
  () => state.loadingProgress,
  (nv, ov) => {
    if (nv >= 100 && Cesium.Ion.defaultAccessToken) {
    }
  }
);

watch(
  () => state.mode,
  () => {
    emit('modeChanged', {
      mode: viewer.scene.mode,
    });
  }
);

const changeCesiumMode = (mode) => {
  viewer && (viewer.scene.mode = mode || 3);
};

const changeCesiumModeBy2D = () => {
  viewer && (viewer.scene.mode = 2);
};

const changeCesiumModeBy3D = () => {
  viewer && (viewer.scene.mode = 3);
};

const flyTo = (position, callback) => {
  if (!viewer) {
    return;
  }
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(...position),
    complete: callback,
  });
};

// 通过高度计算zoom级别
const getZoomLevel = (viewer) => {
  let height = viewer.camera.positionCartographic.height;
  let maxHeight = 3000000; // 设定最大 zoom 级别对应的高度
  let zoom = 18 - Math.log2(height / maxHeight) * 5; // 归一化
  return Math.max(zoom, 1); // 最小 zoom 设为 1
};

const dynamicZoomLevel = () => {
  const zoom = state.scale(viewer.camera.positionCartographic.height);
  state.currentLevel = Math.abs(zoom);
  // console.error(Math.abs(zoom), 'update zoom');
};

const getCurrentZoomLevel = (viewer) => {
  let mode = viewer.scene.mode;
  let height = viewer.camera.positionCartographic.height;
  dynamicZoomLevel();
  // viewer.scene.mode = 2;
  if (mode === Cesium.SceneMode.SCENE3D) {
    return getZoomLevel(viewer);
  } else if (mode === Cesium.SceneMode.SCENE2D) {
    let resolution = viewer.camera.frustum.right - viewer.camera.frustum.left;
    return Math.log2(40075016.68557849 / resolution);
  } else {
    return getZoomLevel(viewer); // Columbus View
  }
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
