<template>
  <div class="cesium-component-root" id="cesiumComponentRoot"></div>
</template>
<script setup>
import {
  Viewer,
  ArcGisMapServerImageryProvider,
  createWorldTerrainAsync,
  Cartesian3,
  Math,
  Cesium3DTileset,
  IonResource,
  Ion,
  Cesium3DTileStyle,
  defined,
  GeoJsonDataSource,
  Color,
  ClassificationType,
  JulianDate,
  BoundingSphere,
  Ellipsoid,
  HorizontalOrigin,
  VerticalOrigin,
  DistanceDisplayCondition,
  ConstantProperty,
  PolygonHierarchy,
  KmlDataSource,
  Cartographic,
  CzmlDataSource,
} from 'cesium';
import { onMounted, onUnmounted } from 'vue';
// import { checkPolygons, fixPolygons } from "./common";
const initCesium = async () => {
  // const ctileset = await new Cesium3DTileset({
  //   url: IonResource.fromAssetId(96188)
  // })
  Ion.defaultAccessToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0N2YxOWQ0NC1mYTkyLTQzYTEtOWU0Ny1jOTQyOTE2ZDFlOTMiLCJpZCI6MjMyMTc3LCJpYXQiOjE3MjI4NDUxNzN9.UijwFTk4emxDLQHMXFaA2-36v3c1kKVV-EVs0OGO54o`;
  const custom = new ArcGisMapServerImageryProvider({
    url: 'services.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer',
  });
  const terrainProvider = await createWorldTerrainAsync({
    /**
     * 标记，用于指示客户端是否应从服务器请求每片水面罩（如果有）。
     */
    requestWaterMask: true,
    /**
     * 指示客户端是否应从服务器请求其他照明信息（如果有）的标志。
     */
    requestVertexNormals: true,
  });
  const viewer = (window.viewer = new Viewer('cesiumComponentRoot', {
    /**
     * 是否开启地图底图选择器开关。
     */
    baseLayerPicker: false,
    /**
     * 前基础影像图层的视图模型（如果未提供）将使用第一个可用的基础图层。
     * 仅当options.baseLayerPicker设置为true时，此值才有效。
     */
    // imageryProviderViewModels: custom,
    ArcGisMapServerImageryProvider: custom,
    /**
     * 要使用的地形提供商
     */
    terrainProvider: terrainProvider,
    // terrainProvider: await CesiumTerrainProvider.fromIonAssetId(1),

    infoBox: false,
    geocoder: true, // 隐藏查找控件。
    homeButton: false, // 隐藏视角返回初始位置按钮
    sceneModePicker: false, // 隐藏视角模式3D, 2D, CV,
    // baseLayerPicker: false, // 隐藏图层选择
    navigationHelpButton: false, // 隐藏帮助按钮
    animation: false, // 隐藏动画控件
    timeline: false, // 隐藏时间轴
  }));

  viewer.scene.debugShowFramesPerSecond = true;
  viewer.scene.globe.depthTestAgainstTerrain = true;

  const tileset = await Cesium3DTileset.fromIonAssetId(96188);
  const heightStyle = await new Cesium3DTileStyle({
    color: {
      conditions: [
        [
          '${height} === null || ${height} === undefined || Number(${height}) === 0',
          'color("#BBDEFB", 1)',
        ],
        ['Number(${height}) >= 300.0', "color('#311B92', 1)"],
        ['Number(${height}) >= 250.0', "color('#4527A0', 1)"],
        ['Number(${height}) >= 200.0', "color('#512DA8', 1)"],
        ['Number(${height}) >= 150.0', "color('#5E35B1', 1)"],
        ['Number(${height}) >= 100.0', "color('#673AB7', 1)"],
        ['Number(${height}) >= 50.0', "color('#7E57C2', 1)"],
        ['Number(${height}) >= 25.0', "color('#9575CD', 1)"],
        ['Number(${height}) >= 10.0', "color('#B39DDB', 1)"],
        ['Number(${height}) >= 5.0', "color('#D1C4E9', 1)"],
        ['true', "color('#EDE7F6', 1)"],
      ],
    },
    meta: {
      description: '"Building id ${id} has height ${height}."',
    },
  });
  tileset.style = heightStyle;
  const city = viewer.scene.primitives.add(tileset);
  viewer.camera.setView({
    destination: new Cartesian3(1332761, -4662399, 4137888),
    orientation: {
      heading: 0.5,
      pitch: -0.5,
      roll: 0,
    },
  });

  /**
   * Geojson 数据使用。
   */
  const geojsonDataSource = await GeoJsonDataSource.load(
    '/geojson/NYC.geojson',
    {
      clampToGround: true, // 确保多边形贴地
    }
  );

  let neighborhooks;
  // 所有的geojson数据在正式使用时，都需要验证是否符合规则。使用方法：fixPolygons2
  const fixGeojsonDataSource = fixPolygons2(geojsonDataSource);
  viewer.dataSources.add(fixGeojsonDataSource);
  // viewer.zoomTo(fixGeojsonDataSource);
  neighborhooks = fixGeojsonDataSource.entities;
  const dataEntities = fixGeojsonDataSource.entities.values;
  dataEntities.forEach((de) => {
    if (defined(de.polygon)) {
      de.name = de.properties.boro_name;
      de.polygon.material = Color.fromRandom({
        red: 0.1,
        maximumGreen: 0.5,
        minimumBlue: 0.5,
        alpha: 0.8,
      });

      de.polygon.classificationType = ClassificationType.TERRAIN;
      const polyPosition = de.polygon.hierarchy.getValue(
        JulianDate.now()
      ).positions;
      let polyCenter = BoundingSphere.fromPoints(polyPosition).center;

      polyCenter = Ellipsoid.WGS84.scaleToGeocentricSurface(polyCenter);
      de.position = polyCenter;

      // 生成地区块的标签
      de.label = {
        text: de.name,
        showBackground: true,
        scale: 0.6,
        horizontalOrigin: HorizontalOrigin.CENTER,
        verticalOrigin: VerticalOrigin.BOTTOM,
        // 显示的极限值：当高度达到多少时不在显示标签
        distanceDisplayCondition: new DistanceDisplayCondition(10, 8000),
        // 禁用值
        disableDepthTestDistance: 100,
      };
    }
  });

  /**
   * 加载KML数据文件, 文件存在问题，需要后续修改文件。
   */
  KmlDataSource.load('/kml/facilities.kml', {
    camera: viewer.scene.camera,
    canvas: viewer.scene.canvas,
    clampToGround: true,
  }).then((kmlDataSource) => {
    viewer.dataSources.add(kmlDataSource);
    // console.error(kmlDataSource)
    const kmlCacheEntities = kmlDataSource.entities.values;
    // console.error(kmlDataSource);
    kmlCacheEntities.forEach((ke) => {
      if (!defined(ke.billboard)) {
        ke.billboard = {};
      }
      ke.label = null;
      ke.billboard.verticalOrigin = VerticalOrigin.BOTTOM;
      ke.billboard.image = '/kml/images/local.svg';
      // ke.label = undefined;
      // 添加显示距离条件
      ke.billboard.distanceDisplayCondition = new DistanceDisplayCondition(
        10.0,
        20000.0
      );
      // 与度为单位计算经纬度;
      const cartographicPosition = Cartographic.fromCartesian(
        ke.position.getValue(JulianDate.now())
      );
      const lat = Math.toDegrees(cartographicPosition.latitude); // 纬度
      const lon = Math.toDegrees(cartographicPosition.longitude); // 经度
      const description = `<div>
            <div><span>经度：</span><span>${lon}</span></div>
            <div><span>纬度：</span><span>${lat}</span></div>
          </div>`;

      ke.description = description;
    });
  });
  // console.error(kmlDataSource);

  // geojsonDataSource.then((dataSources) => {
  //   // 数据添加到查看器中
  // });

  /**
   *  从czml文件加载飞行路径
   */
  // const czmlDataSource = CzmlDataSource.load();
};

// 检查多边形是否遵循右手规则，返回错误信息数组
const checkPolygons = (dataSource) => {
  let errors = [];
  const entities = dataSource.entities.values;
  for (const entity of entities) {
    if (entity.polygon) {
      const coordinates = entity.polygon.hierarchy.getValue(
        JulianDate.now()
      ).positions;
      const isClockwise = Cesium.PolygonHierarchy.isClockwise(
        Cartesian3.fromDegreesArrayHeights(coordinates)
      );
      if (isClockwise) {
        errors.push({
          entity: entity.id,
          error: 'Polygon exterior is clockwise',
        });
      }
    }
  }
  return errors;
};

// 修复多边形，使其遵循右手规则
const fixPolygons = (dataSource) => {
  const entities = dataSource.entities.values;
  for (const entity of entities) {
    if (entity.polygon) {
      // 获取当前时间的多边形坐标
      const hierarchy = entity.polygon.hierarchy;
      let coordinates = hierarchy.getValue(JulianDate.now()).positions;

      // 检查坐标是否为对象，并且包含 positions 属性
      if (typeof coordinates === 'object' && coordinates.positions) {
        coordinates = coordinates.positions;
      }

      // 将坐标转换为 Cartesian3 数组
      const cartesian3Positions = coordinates.map((coord) => {
        return Cartesian3.fromDegrees(coord.x, coord.y, coord.z);
      });

      /// console.error(cartesian3Positions);

      // 检查多边形是否为顺时针，并在必要时反转坐标

      if (isClockwise(cartesian3Positions)) {
        const reversedCartesian3Positions = cartesian3Positions.reverse();
        const reversedCoordinates = reversedCartesian3Positions.map(
          (cartesian) => {
            return [Math.toDegrees(cartesian.x), Math.toDegrees(cartesian.y)];
          }
        );

        entity.polygon.hierarchy = new ConstantProperty(
          new PolygonHierarchy(reversedCoordinates)
        );
      }
    }
  }
  return dataSource;
};

const fixPolygons2 = (dataSource) => {
  const entities = dataSource.entities.values;
  for (const entity of entities) {
    if (entity.polygon) {
      const hierarchy = entity.polygon.hierarchy;
      const positions = hierarchy.getValue(JulianDate.now()).positions;
      if (isClockwise(positions)) {
        // 如果是顺时针，则反转坐标
        const reversedPositions = positions.slice().reverse();
        entity.polygon.hierarchy = new ConstantProperty(
          new PolygonHierarchy(reversedPositions)
        );
      }
    }
  }
  return dataSource;
};

const isClockwise = (positions) => {
  const area = positions.reduce((acc, cur, i) => {
    const next = positions[(i + 1) % positions.length];
    return acc + (cur.x * next.y - next.x * cur.y);
  }, 0);
  return area < 0; // 如果面积为负，则为顺时针
};

const destroyCesiumViewer = () => {
  if (viewer && defined(viewer)) {
    viewer.entities.removeAll();
    viewer.imageryLayers.removeAll();
    viewer.dataSources.removeAll();
    // viewer.scene.primitives.removeAll();
    // 获取webgl上下文
    let gl = viewer.scene.context._originalGLContext;
    gl.canvas.width = 1;
    gl.canvas.height = 1;
    viewer.destroy(); // 销毁Viewer实例
    gl.getExtension('WEBGL_lose_context').loseContext();
    gl = null;
    window.viewer = null;
    console.log('cesium销毁');
  }
};

onMounted(() => {
  initCesium();
  // viewer.camera.setView({
  //   /**
  //    * 初始坐标
  //    */
  //   destination: Cartesian3.fromDegrees(113.318977, 23.114115, 20000),
  //   /**
  //    * 观看角度
  //    */
  //   orientation: {
  //     /**
  //      * 旋转角度
  //      */
  //     // heading: 0.6

  //     /**
  //      * 俯仰角
  //      */
  //     pitch: Math.toRadians(0),
  //   },
  // });
});
onUnmounted(() => {
  destroyCesiumViewer();
});
</script>
<style lang="less" scoped>
.cesium-component-root {
  height: 100%;
  width: 100%;
  overflow: hidden;
  box-sizing: border-box;
}
</style>
