/*
 * @Author: baoyiwen 511530203@qq.com
 * @FilePath: \cesium-app-vue\src\utils\GeoLayerManager.js
 * @Description: GeoLayerManager - 动态类型图层管理器（支持无限扩展实体类型）
 */

import * as Cesium from 'cesium';

export class GeoLayerManager {
  constructor(viewer) {
    if (!viewer || !(viewer instanceof Cesium.Viewer)) {
      throw new Error('GeoLayerManager 需要传入 Cesium.Viewer 实例');
    }
    this.viewer = viewer;

    // 存储各个类型的 Map，结构 { typeName: Map<layerId, entities[]> }
    this._typeMap = {};
  }

  // 🔒 私有方法：根据类型动态获取对应 Map，如果不存在就初始化
  _getLayerMapByType(type) {
    if (!this._typeMap[type]) {
      this._typeMap[type] = new Map();
    }
    return this._typeMap[type];
  }

  // 🔒 私有方法：统一控制某一层的显示隐藏
  _setLayerVisibility(id, type, visible) {
    const map = this._getLayerMapByType(type);
    const entities = map.get(id);
    if (!entities) return;
    entities.forEach((e) => (e.show = visible));
  }

  /**
   * 添加实体到某个逻辑图层
   * @param {Object} config
   * @param {string} config.id - 图层ID
   * @param {string} config.type - 类型（polygon, label, polyline, point...）
   * @param {Cesium.Entity[]} config.entities - 实体数组
   */
  addLayer({ id, type, entities }) {
    if (!id || !type || !Array.isArray(entities) || entities.length === 0)
      return;

    const map = this._getLayerMapByType(type);

    // 添加到 Cesium 实际 Viewer
    entities.forEach((e) => this.viewer.entities.add(e));

    map.set(id, entities);
  }

  /** 显示整个逻辑图层（所有类型一起） */
  show(id) {
    Object.keys(this._typeMap).forEach((type) =>
      this._setLayerVisibility(id, type, true)
    );
  }

  /** 隐藏整个逻辑图层（所有类型一起） */
  hide(id) {
    Object.keys(this._typeMap).forEach((type) =>
      this._setLayerVisibility(id, type, false)
    );
  }

  /** 单独显示某一类实体 */
  showLayer(id, type) {
    this._setLayerVisibility(id, type, true);
  }

  /** 单独隐藏某一类实体 */
  hideLayer(id, type) {
    this._setLayerVisibility(id, type, false);
  }

  /** 删除逻辑图层（清除 viewer 和内存） */
  removeLayer(id) {
    Object.keys(this._typeMap).forEach((type) => {
      const map = this._getLayerMapByType(type);
      const entities = map.get(id);
      if (entities) {
        entities.forEach((e) => this.viewer.entities.remove(e));
        map.delete(id);
      }
    });
  }

  /**
   * 获取逻辑图层的实体
   * @param {string} id
   * @param {string} [type] - 可选，只拿某类
   * @returns {Cesium.Entity[]} or { polygon: [], label: [], polyline: [], ... }
   */
  getEntities(id, type) {
    if (type) {
      return this._getLayerMapByType(type).get(id) || [];
    }

    const all = {};
    Object.keys(this._typeMap).forEach((t) => {
      all[t] = this._typeMap[t]?.get(id) || [];
    });
    return all;
  }

  /** 飞行到图层 */
  flyTo(id) {
    const entities = Object.keys(this._typeMap)
      .map((type) => this._typeMap[type]?.get(id) || [])
      .flat();
    if (entities.length > 0) {
      this.viewer.flyTo(entities);
    }
  }

  /** 判断逻辑图层是否存在 */
  has(id) {
    return Object.values(this._typeMap).some((map) => map.has(id));
  }

  /** 获取所有 layerId 列表 */
  getAllLayerIds() {
    const set = new Set();
    Object.values(this._typeMap).forEach((map) => {
      for (const id of map.keys()) {
        set.add(id);
      }
    });
    return [...set];
  }
}
