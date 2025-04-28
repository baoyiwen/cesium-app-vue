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

    this.isDrawing = false;
    this.isMouseDown = false;
    this.startPosition = null;
    this.endPosition = null;
    this.rectangleEntity = null;
    this.callback = null;
    this.layerFilter = null; // ✅ 新增：layerId过滤器

    this._setupEvents();
  }

  _setupEvents() {
    this.handler.setInputAction((movement) => {
      if (!this.isDrawing) return;
      this.startPosition = movement.position;
      this.endPosition = movement.position;
      this.isMouseDown = true;
      this._disableMapInteraction();
      this._createRectangleEntity();
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

    this.handler.setInputAction((movement) => {
      if (!this.isDrawing || !this.isMouseDown) return;
      this.endPosition = movement.endPosition;
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    this.handler.setInputAction(() => {
      if (!this.isDrawing || !this.isMouseDown) return;
      this._finishSelection();
    }, Cesium.ScreenSpaceEventType.LEFT_UP);
  }

  openDraw() {
    this.isDrawing = true;
  }

  closeDraw() {
    this.isDrawing = false;
    this._clearRectangleEntity();
    this.isMouseDown = false;
    this._enableMapInteraction();
  }

  setLayerFilter(layerId) {
    this.layerFilter = layerId; // ✅ 设置只框选某个layerId的实体
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

    // ✅ 高效遍历
    for (const entity of this.viewer.entities.values) {
      if (this.layerFilter && entity.layerId !== this.layerFilter) {
        continue; // 只选指定 layerId 的实体
      }

      // 点/标签
      if (entity.position) {
        const pos = entity.position.getValue(Cesium.JulianDate.now());
        const carto = Cesium.Cartographic.fromCartesian(pos);
        if (Cesium.Rectangle.contains(rectangle, carto)) {
          entities.push(entity);
        }
        continue;
      }

      // 线
      if (entity.polyline?.positions) {
        const positions = entity.polyline.positions.getValue(
          Cesium.JulianDate.now()
        );
        if (
          positions?.some((p) =>
            Cesium.Rectangle.contains(
              rectangle,
              Cesium.Cartographic.fromCartesian(p)
            )
          )
        ) {
          entities.push(entity);
        }
        continue;
      }

      if (entity.polygon?.hierarchy) {
        const hierarchy = entity.polygon.hierarchy.getValue(
          Cesium.JulianDate.now()
        );
        if (hierarchy?.positions?.length > 0) {
          let allPositions = [...hierarchy.positions];

          if (hierarchy.holes) {
            hierarchy.holes.forEach((hole) => {
              if (hole.positions?.length > 0) {
                allPositions = allPositions.concat(hole.positions);
              }
            });
          }

          if (allPositions.length > 0) {
            const rectOfPolygon =
              Cesium.Rectangle.fromCartesianArray(allPositions);

            // ✅ 用 intersection 判断是否有重叠
            if (Cesium.Rectangle.intersection(rectangle, rectOfPolygon)) {
              entities.push(entity);
            }
          }
        }
      }
    }

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
  }

  onBoxSelect(callback) {
    this.callback = callback;
  }

  destroy() {
    this.handler?.destroy();
  }
}
