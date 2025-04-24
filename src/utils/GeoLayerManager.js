/*
 * @Author: baoyiwen 511530203@qq.com
 * @FilePath: \cesium-app-vue\src\utils\GeoLayerManager.js
 * @Description: GeoLayerManager - 稳健型图层管理类，支持类型分类、显隐控制、高亮、透明度、筛选等功能
 */

import * as Cesium from 'cesium';
import { convertColor } from './cesium';

export class GeoLayerManager {
  constructor(viewer) {
    if (!viewer || !(viewer instanceof Cesium.Viewer)) {
      throw new Error('GeoLayerManager 需要传入 Cesium.Viewer 实例');
    }
    this.types = ['polygon', 'polyline', 'label'];
    this.viewer = viewer;

    /** 内部类型映射表 */

    this._typeMap = {};

    this.types.forEach((d) => {
      this._typeMap[d] = new Map();
    });
  }

  // 🔒 内部方法：获取对应 Map
  _getLayerMapByType(type) {
    return this._typeMap[type];
  }

  // 🔒 内部方法：设置实体显示隐藏
  _setLayerVisibility(id, type, visible) {
    const layerMap = this._getLayerMapByType(type);
    const entities = layerMap.get(id);
    if (!entities) return;
    entities.forEach((e) => (e.show = visible));
  }

  /**
   * 添加实体到某个 layerId
   * @param {string} id
   * @param {'polygon'|'label'|'polyline'} type
   * @param {Cesium.Entity[]} entities
   */
  addLayer({ id, type, entities }) {
    if (!id || !type || !Array.isArray(entities) || entities.length === 0)
      return;

    const map = this._getLayerMapByType(type);
    if (!map) return;

    // 添加实体到 Viewer
    entities.forEach((e) => this.viewer.entities.add(e));
    map.set(id, entities);
  }

  /**
   * 显示整个图层（全部类型）
   */
  show(id) {
    this.types.forEach((type) => this._setLayerVisibility(id, type, true));
  }

  hide(id) {
    this.types.forEach((type) => this._setLayerVisibility(id, type, false));
  }

  showLayer(id, type) {
    this._setLayerVisibility(id, type, true);
  }

  hideLayer(id, type) {
    this._setLayerVisibility(id, type, false);
  }

  /**
   * 删除图层
   */
  removeLayer(id) {
    this.types.forEach((type) => {
      const map = this._getLayerMapByType(type);
      const list = map.get(id);
      if (list) {
        list.forEach((e) => this.viewer.entities.remove(e));
        map.delete(id);
      }
    });
  }

  /**
   * 获取某图层实体
   * @param {string} id
   * @param {string} [type]
   */
  getEntities(id, type) {
    if (type) {
      const map = this._getLayerMapByType(type);
      return map?.get(id) || [];
    }
    const all = {};
    this.types.forEach((type) => {
      all[type] = this._typeMap[type]?.get(id) || [];
    });

    return all;
  }

  /**
   * 飞行到图层所有实体
   */
  flyTo(id) {
    const allEntities = this.types.map((type) => {
      return this._typeMap[type]?.get(id) || [];
    });
    if (allEntities.length > 0) this.viewer.flyTo(allEntities);
  }

  /**
   * 设置透明度
   */
  setOpacity(id, type, alpha = 1.0) {
    const list = this.getEntities(id, type);
    list.forEach((entity) => {
      if (entity.polygon && entity.polygon.material) {
        const color = entity.polygon.material.color?.getValue?.(
          Cesium.JulianDate.now()
        );
        if (color)
          entity.polygon.material = Cesium.Color.fromAlpha(color, alpha);
      }

      if (entity.polyline && entity.polyline.material) {
        const color = Cesium.Color.clone(entity.polyline.material);
        entity.polyline.material = Cesium.Color.fromAlpha(color, alpha);
      }

      if (entity.label && entity.label.fillColor) {
        const color = entity.label.fillColor?.getValue?.(
          Cesium.JulianDate.now()
        );
        if (color)
          entity.label.fillColor = Cesium.Color.fromAlpha(color, alpha);
      }
    });
  }

  /**
   * 高亮图层实体（临时换色）
   */
  highlight(id, highlightColor = 'rgba(255, 255, 0, 0.8)') {
    highlightColor = convertColor(highlightColor);
    const all = this.getEntities(id);
    Object.values(all)
      .flat()
      .forEach((entity) => {
        if (entity.polygon) {
          entity._originalMaterial = entity.polygon.material;
          entity.polygon.material = highlightColor;
        }

        if (entity.polyline) {
          entity._originalMaterial = entity.polyline.material;
          entity.polyline.material = highlightColor;
        }

        if (entity.label) {
          entity._originalFill = entity.label.fillColor;
          entity.label.fillColor = highlightColor;
        }
      });
  }

  /**
   * 恢复原始颜色（取消高亮）
   */
  resetColor(id) {
    const all = this.getEntities(id);
    Object.values(all)
      .flat()
      .forEach((entity) => {
        if (entity.polygon && entity._originalMaterial) {
          entity.polygon.material = entity._originalMaterial;
        }

        if (entity.polyline && entity._originalMaterial) {
          entity.polyline.material = entity._originalMaterial;
        }

        if (entity.label && entity._originalFill) {
          entity.label.fillColor = entity._originalFill;
        }
      });
  }

  /**
   * 筛选图层中部分实体显示
   * @param {string} id
   * @param {(entity: Cesium.Entity) => boolean} predicate
   */
  filter(id, predicate) {
    const all = this.getEntities(id);
    Object.values(all)
      .flat()
      .forEach((entity) => {
        entity.show = !!predicate(entity);
      });
  }

  /**
   * 是否存在某个图层
   */
  has(id) {
    let flag = false;
    this.types.forEach((type) => {
      if (this._typeMap[type]) {
        flag = this._typeMap[type].get(id);
      }
    });
    return flag;
  }

  /**
   * 获取所有图层 ID
   */
  getAllLayerIds() {
    const all = new Set();
    Object.values(this._typeMap).forEach((map) => {
      for (const id of map.keys()) {
        all.add(id);
      }
    });
    return [...all];
  }
}
