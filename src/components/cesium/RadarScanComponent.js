import * as Cesium from 'cesium';

export class RadarScanComponent {
  constructor(viewer) {
    this.viewer = viewer;
    this.scene = viewer.scene;
    this.radarCircle = null;
  }

  initialize() {
    this.createRadarCircle();
    this.addEventListeners();
    this.animateRadar();
  }

  // 创建雷达扫描的圆形效果
  createRadarCircle() {
    const scene = this.scene;

    // 雷达扫描的图像材质
    const radarMaterial = new Cesium.Material({
      fabric: {
        type: 'Image',
        uniforms: {
          image: '/images/other/X-01.png', // 雷达扫描图片路径
          transparent: false,
          repeat: new Cesium.Cartesian2(1, 1),
        },
      },
    });

    const radarRadius = this.calculateRadarRadius(); // 根据视图大小计算扫描半径

    // 创建雷达扫描的几何体
    this.radarCircle = scene.primitives.add(
      new Cesium.GroundPrimitive({
        geometryInstances: new Cesium.GeometryInstance({
          id: 'radarCircle', // 添加唯一的ID
          geometry: new Cesium.CircleGeometry({
            radius: radarRadius, // 半径
            center: Cesium.Cartesian3.fromDegrees(0, 0), // 雷达中心坐标
          }),
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(
              Cesium.Color.WHITE.withAlpha(0.3)
            ),
          },
        }),
        appearance: new Cesium.MaterialAppearance({
          material: radarMaterial,
        }),
      })
    );

    // 使用 requestAnimationFrame 确保在下一帧调用 getGeometryInstanceAttributes
    requestAnimationFrame(() => {
      const geometryInstance =
        this.radarCircle.getGeometryInstanceAttributes('radarCircle');
      if (geometryInstance) {
        // 更新几何体的半径
        geometryInstance.geometry = new Cesium.CircleGeometry({
          radius: radarRadius,
          center: Cesium.Cartesian3.fromDegrees(0, 0),
        });
      }
    });
  }

  // 计算雷达扫描半径
  calculateRadarRadius() {
    const canvas = this.viewer.scene.canvas;
    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;

    // 根据视图窗口的大小来动态调整雷达的扫描半径
    return Math.min(canvasWidth, canvasHeight) / 5; // 例如使用视图宽度的1/5作为扫描范围
  }

  // 启动雷达扫描动画
  animateRadar() {
    const self = this;

    let radius = this.calculateRadarRadius();
    let growing = true;

    // 设置动画，每帧更新扫描范围
    this.viewer.clock.onTick.addEventListener(function () {
      if (self.radarCircle) {
        const newRadius = growing ? radius * 1.02 : radius * 0.98;

        // 如果超出最大或最小范围，则反转扫描方向
        if (newRadius > self.calculateRadarRadius() * 2) {
          growing = false;
        } else if (newRadius < self.calculateRadarRadius()) {
          growing = true;
        }

        radius = newRadius;

        // 更新雷达的半径
        self.updateRadarGeometry(radius);
      }
    });
  }

  // 更新雷达几何体
  updateRadarGeometry(radius) {
    if (this.radarCircle) {
      // 使用 requestAnimationFrame 确保在下一帧调用 getGeometryInstanceAttributes
      requestAnimationFrame(() => {
        const geometryInstance = this.radarCircle.getGeometryInstanceAttributes('radarCircle');
        if (geometryInstance) {
          // 更新几何体的半径
          geometryInstance.geometry = new Cesium.CircleGeometry({
            radius: radius,
            center: Cesium.Cartesian3.fromDegrees(0, 0),
          });
        }
      });
    }
  }

  // 监听视图变化事件
  addEventListeners() {
    // 监听视图缩放和移动事件
    this.viewer.scene.camera.changed.addEventListener(() => {
      this.updateRadarScanRange();
    });
  }

  // 更新雷达扫描范围
  updateRadarScanRange() {
    const newRadius = this.calculateRadarRadius();
    this.updateRadarGeometry(newRadius);
  }
}

// 使用方式
//   const viewer = new Cesium.Viewer('cesiumContainer');
//   const radarScanComponent = new RadarScanComponent(viewer);
//   radarScanComponent.initialize();
