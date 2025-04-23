/*
 * @Author: baoyiwen 511530203@qq.com
 * @Date: 2025-04-22
 * @LastEditors: baoyiwen 511530203@qq.com
 * @FilePath: \cesium-app-vue\src\utils\GeoLayerManagement.js
 * @Description: 稳健型 GeoLayerManager，支持多类型实体（polygon、label、polyline）共存
 */
import * as Cesium from 'cesium';

export class GeoLayerManager {
  constructor(viewer) {
    if (!viewer || !(viewer instanceof Cesium.Viewer)) {
      throw new Error('GeoLayerManager 需要传入 Cesium.Viewer 实例');
    }
    this.viewer = viewer;

    /**
     * 图层结构：
     * Map<layerId, {
     *   entities: {
     *     polygon?: Cesium.Entity[],
     *     label?: Cesium.Entity[],
     *     polyline?: Cesium.Entity[]
     *   }
     * }>
     */
    this._polygonLayerMap = new Map();
    this._polylineLayerMap = new Map();
    this._labelLayerMap = new Map();
  }

  /**
   * 添加实体到某个 layerId
   * @param {Object} config
   * @param {string} config.id - 逻辑图层 ID（统一标识）
   * @param {'polygon'|'label'|'polyline'} config.type - 实体类型
   * @param {Cesium.Entity[]} config.entities - Cesium 实体数组
   */
  addLayer({ id, type, entities }) {
    if (!id || !type || !Array.isArray(entities) || entities.length === 0)
      return;
    switch (type) {
      case 'label':
        this._labelLayerMap.set(id, entities);
        break;
      case 'polygon':
        this._polygonLayerMap.set(id, entities);
        break;
      case 'polyline':
        this._polylineLayerMap.set(id, entities);
        break;
    }
    // // 获取旧数据或新建结构
    // const existing = this._layerMap.get(id) || { entities: {} };

    // 先添加实体到 Cesium
    entities.forEach((e) => this.viewer.entities.add(e));

    // // 合并到对应类型
    // existing.entities[type] = (existing.entities[type] || []).concat(entities);

    // this._layerMap.set(id, existing);
  }

  addLabelLayer(id, entities) {
    if (!id || !Array.isArray(entities) || entities.length === 0) return;
    this._labelLayerMap.set(id, entities);
    // 先添加实体到 Cesium
    entities.forEach((e) => this.viewer.entities.add(e));
  }
  addPolygonLayer(id, entities) {
    if (!id || !Array.isArray(entities) || entities.length === 0) return;
    this._polygonLayerMap.set(id, entities);
    // 先添加实体到 Cesium
    entities.forEach((e) => this.viewer.entities.add(e));
  }
  addPolylineLayer(id, entities) {
    if (!id || !Array.isArray(entities) || entities.length === 0) return;
    this._polylineLayerMap.set(id, entities);
    // 先添加实体到 Cesium
    entities.forEach((e) => this.viewer.entities.add(e));
  }

  /**
   * 显示某个图层的所有实体
   */
  show(id) {
    const labelLayer = this._labelLayerMap.get(id);
    const polygonLayer = this._polygonLayerMap.get(id);
    const polyline = this._polylineLayerMap.get(id);
    if (labelLayer) {
      labelLayer.forEach((entityList) => {
        entityList.show = true;
      });
    }
    if (polygonLayer) {
      polygonLayer.forEach((entityList) => {
        entityList.show = true;
      });
    }
    if (polyline) {
      polyline.forEach((entityList) => {
        entityList.show = true;
      });
    }
  }

  showLabelLayer(id) {
    const labelLayer = this._labelLayerMap.get(id);
    if (labelLayer) {
      labelLayer.forEach((entityList) => {
        entityList.show = true;
      });
    }
  }

  showPolygonLayer(id) {
    const polygonLayer = this._polygonLayerMap.get(id);
    if (polygonLayer) {
      polygonLayer.forEach((entityList) => {
        entityList.show = true;
      });
    }
  }

  showPolylineLayer(id) {
    const polyline = this._polylineLayerMap.get(id);
    if (polyline) {
      polyline.forEach((entityList) => {
        entityList.show = true;
      });
    }
  }

  /**
   * 隐藏某个图层的所有实体
   */
  hide(id) {
    const labelLayer = this._labelLayerMap.get(id);
    const polygonLayer = this._polygonLayerMap.get(id);
    const polyline = this._polylineLayerMap.get(id);
    if (labelLayer) {
      labelLayer.forEach((entityList) => {
        entityList.show = false;
      });
    }
    if (polygonLayer) {
      polygonLayer.forEach((entityList) => {
        entityList.show = false;
      });
    }
    if (polyline) {
      polyline.forEach((entityList) => {
        entityList.show = false;
      });
    }
  }

  hideLabelLayer(id) {
    const labelLayer = this._labelLayerMap.get(id);
    if (labelLayer) {
      labelLayer.forEach((entityList) => {
        entityList.show = false;
      });
    }
  }

  hidePolygonLayer(id) {
    const polygonLayer = this._polygonLayerMap.get(id);
    if (polygonLayer) {
      polygonLayer.forEach((entityList) => {
        entityList.show = false;
      });
    }
  }

  hidePolylineLayer(id) {
    const polyline = this._polylineLayerMap.get(id);
    if (polyline) {
      polyline.forEach((entityList) => {
        entityList.show = false;
      });
    }
  }

  /**
   * 移除某个图层的所有实体
   */
  removeLayer(id) {
    const labelLayer = this._labelLayerMap.get(id);
    const polygonLayer = this._polygonLayerMap.get(id);
    const polyline = this._polylineLayerMap.get(id);
    if (labelLayer) {
      labelLayer.forEach((entityList) => {
        this.viewer.entities.remove(entityList);
      });

      this._labelLayerMap.delete(id);
    }
    if (polygonLayer) {
      polygonLayer.forEach((entityList) => {
        this.viewer.entities.remove(entityList);
      });

      this._polygonLayerMap.delete(id);
    }
    if (polyline) {
      polyline.forEach((entityList) => {
        this.viewer.entities.remove(entityList);
      });

      this._polylineLayerMap.delete(id);
    }
  }

  removeLabelLayer(id) {
    const labelLayer = this._labelLayerMap.get(id);
    if (labelLayer) {
      labelLayer.forEach((entityList) => {
        this.viewer.entities.remove(entityList);
      });
      this._labelLayerMap.delete(id);
    }
  }

  removePolygonLayer(id) {
    const polygonLayer = this._polygonLayerMap.get(id);
    if (polygonLayer) {
      polygonLayer.forEach((entityList) => {
        this.viewer.entities.remove(entityList);
      });
      this._polygonLayerMap.delete(id);
    }
  }

  removePolylineLayer(id) {
    const polyline = this._polylineLayerMap.get(id);
    if (polyline) {
      polyline.forEach((entityList) => {
        this.viewer.entities.remove(entityList);
      });
      this._polylineLayerMap.delete(id);
    }
  }

  /**
   * 获取图层中的所有实体，或某类实体
   * @param {string} id
   * @param {string} [type] - 可选类型筛选（polygon / label / polyline）
   */
  getEntities(id, type) {
    const labelLayer = this._labelLayerMap.get(id);
    const polygonLayer = this._polygonLayerMap.get(id);
    const polyline = this._polylineLayerMap.get(id);
    const layers = [];
    if (labelLayer) {
      layers = layers.concat(labelLayer);
    }
    if (polygonLayer) {
      layers = layers.concat(polygonLayer);
    }
    if (polyline) {
      layers = layers.concat(polyline);
    }

    switch (type) {
      case 'label':
        return labelLayer;
      case 'polygon':
        return polygonLayer;
      case 'polyline':
        return polyline;
      default:
        return layers;
    }
  }

  /**
   * 飞行到图层
   */
  flyTo(id) {
    const entities = this.getEntities(id);
    if (entities.length > 0) {
      this.viewer.flyTo(entities);
    }
  }

  // /**
  //  * 判断图层是否存在
  //  */
  // has(id) {
  //   return this._layerMap.has(id);
  // }

  // /**
  //  * 获取全部 layerId
  //  */
  // getAllLayerIds() {
  //   return [...this._layerMap.keys()];
  // }
}
