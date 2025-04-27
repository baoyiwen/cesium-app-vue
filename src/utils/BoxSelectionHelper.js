// utils/BoxSelectionHelper.js
import * as Cesium from 'cesium';

export class BoxSelectionHelper {
  constructor(viewer) {
    if (!viewer || !(viewer instanceof Cesium.Viewer)) {
      throw new Error('BoxSelectionHelper 需要传入 Cesium.Viewer');
    }

    this.viewer = viewer;
    this.controller = viewer.scene.screenSpaceCameraController;
    this.handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

    this.isDrawing = false; // 是否允许绘制（外部控制）
    this.isMouseDown = false; // 是否鼠标按下
    this.startPosition = null;
    this.endPosition = null;
    this.rectangleEntity = null;
    this.callback = null;

    this._setupEvents();
  }

  _setupEvents() {
    // 鼠标左键按下
    this.handler.setInputAction((movement) => {
      if (!this.isDrawing) return; // 必须开启绘制模式才能开始
      this.startPosition = movement.position;
      this.endPosition = movement.position;
      this.isMouseDown = true;

      this._disableMapInteraction();
      this._createRectangleEntity();
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

    // 鼠标移动
    this.handler.setInputAction((movement) => {
      if (!this.isDrawing || !this.isMouseDown) return;
      this.endPosition = movement.endPosition;
      // CallbackProperty自动更新Rectangle，无需手动触发
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    // 鼠标左键抬起
    this.handler.setInputAction(() => {
      if (!this.isDrawing || !this.isMouseDown) return;
      this._finishSelection();
    }, Cesium.ScreenSpaceEventType.LEFT_UP);
  }

  /**
   * 开启绘制模式
   */
  openDraw() {
    this.isDrawing = true;
  }

  /**
   * 关闭绘制模式
   */
  closeDraw() {
    this.isDrawing = false;
    this._clearRectangleEntity(); // 如果有绘制中框选，也清理掉
    this.isMouseDown = false;
    this._enableMapInteraction();
  }

  _disableMapInteraction() {
    this.controller.enableRotate = false;
    this.controller.enableTranslate = false;
    this.controller.enableZoom = false;
    this.controller.enableTilt = false;
    this.controller.enableLook = false;
  }

  _enableMapInteraction() {
    this.controller.enableRotate = true;
    this.controller.enableTranslate = true;
    this.controller.enableZoom = true;
    this.controller.enableTilt = true;
    this.controller.enableLook = true;
  }

  _createRectangleEntity() {
    this.rectangleEntity = this.viewer.entities.add({
      rectangle: {
        coordinates: new Cesium.CallbackProperty(() => {
          if (!this.startPosition || !this.endPosition) return null;
          return this._createRectangle(this.startPosition, this.endPosition);
        }, false),
        material: Cesium.Color.SKYBLUE.withAlpha(0.3),
        outline: true,
        outlineColor: Cesium.Color.DEEPSKYBLUE,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      },
    });
  }

  _clearRectangleEntity() {
    if (this.rectangleEntity) {
      this.viewer.entities.remove(this.rectangleEntity);
      this.rectangleEntity = null;
    }
  }

  _createRectangle(start, end) {
    const scene = this.viewer.scene;
    const ellipsoid = scene.globe.ellipsoid;
    const startCarto = scene.camera.pickEllipsoid(start, ellipsoid);
    const endCarto = scene.camera.pickEllipsoid(end, ellipsoid);

    if (!startCarto || !endCarto) return null;

    return Cesium.Rectangle.fromCartesianArray([startCarto, endCarto]);
  }

  _pickEntities(rectangle) {
    const entities = [];
    this.viewer.entities.values.forEach((entity) => {
      if (!entity.position) return;
      const cartographic = Cesium.Cartographic.fromCartesian(
        entity.position.getValue(Cesium.JulianDate.now())
      );
      if (Cesium.Rectangle.contains(rectangle, cartographic)) {
        entities.push(entity);
      }
    });
    return entities;
  }

  _finishSelection() {
    const rectangle = this._createRectangle(
      this.startPosition,
      this.endPosition
    );

    if (rectangle && this.callback) {
      const pickedEntities = this._pickEntities(rectangle);
      this.callback(pickedEntities);
    }

    this._clearRectangleEntity();
    this._enableMapInteraction();

    this.startPosition = null;
    this.endPosition = null;
    this.isMouseDown = false;
    // 不自动 closeDraw，因为外部控制
  }

  /**
   * 设置框选完成的回调
   * @param {function} callback
   */
  onBoxSelect(callback) {
    this.callback = callback;
  }

  /**
   * 销毁
   */
  destroy() {
    this.handler?.destroy();
  }
}
