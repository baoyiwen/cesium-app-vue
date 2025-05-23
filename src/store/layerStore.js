/*
 * @Author: baoyiwen 511530203@qq.com
 * @Description: Layer Store 管理层（逻辑图层、实体分类、分组管理）
 */

import { defineStore } from 'pinia';
import { GeoLayerManager, LayerEventDispatcher } from '../utils';
import * as Cesium from 'cesium';

export const useLayerStore = defineStore('layer', {
  state: () => ({
    viewer: null,
    manager: null, // GeoLayerManager 实例
    interactionManager: null, // LayerInteractionManager 实例

    entityLayers: {}, // { type: [{ layerId, entities }] }
    layers: [], // [{ id, name, groupId, entityTypes: [] }]
    groups: [], // [{ id, name, zIndex, layers: [] }]
    selectedEntities: [], // 多选中的实体列表
  }),

  actions: {
    /** 初始化 */
    init(viewer) {
      this.viewer = viewer;
      this.manager = new GeoLayerManager(viewer);
      this.interactionManager = new LayerEventDispatcher(viewer);
    },

    setSelectedEntities(entities) {
      this.selectedEntities = entities;
    },

    clearSelectedEntities() {
      this.selectedEntities = [];
    },

    highlightSelectedEntities() {
      this.selectedEntities.forEach((e) => {
        if (e.polygon) {
          e.polygon.material = Cesium.Color.YELLOW.withAlpha(0.8);
        } else if (e.label) {
          e.label.fillColor = Cesium.Color.YELLOW;
        }
      });
    },

    removeSelectedEntities() {
      this.selectedEntities.forEach((e) => {
        this.manager.viewer.entities.remove(e);
      });
      this.clearSelectedEntities();
    },

    flyToSelectedEntities() {
      if (this.selectedEntities.length) {
        this.manager.viewer.flyTo(this.selectedEntities);
      }
    },

    bindLayerClick(layerId, callback) {
      this.interactionManager?.onClick(layerId, callback);
    },

    unbindLayerClick(layerId) {
      this.interactionManager?.offClick(layerId);
    },

    /** 创建分组 */
    createGroup({ id, name, zIndex = 0 }) {
      if (this.groups.find((g) => g.id === id)) return;
      this.groups.push({ id, name, zIndex, layers: [] });
      return id;
    },

    /** 添加逻辑图层 */
    addLayer({ layerId, name, groupId, entitiesByType }) {
      if (!this.layers.find((l) => l.id === layerId)) {
        this.layers.push({
          id: layerId,
          name,
          groupId,
          visible: true,
          entityTypes: Object.keys(entitiesByType),
        });
      }

      // 遍历不同类型的实体
      for (const [type, entities] of Object.entries(entitiesByType)) {
        this._addEntitiesToType(type, layerId, entities);
      }

      // 加到分组
      const group = this.groups.find((g) => g.id === groupId);
      if (group && !group.layers.includes(layerId)) {
        group.layers.push(layerId);
      }
    },

    /** 内部方法：分类存储 */
    _addEntitiesToType(type, layerId, entities) {
      if (!this.entityLayers[type]) this.entityLayers[type] = [];
      this.entityLayers[type].push({ layerId, entities, visible: true });
      this.manager.addLayer({ id: layerId, type, entities });
    },

    /** 获取某图层所有实体 */
    getLayerEntities(layerId) {
      return this.manager.getEntities(layerId) || [];
    },

    /** 控制图层显隐 */
    toggleLayer(layerId, visible) {
      this.layers.find((l) => l.id === layerId).visible = visible;
      Object.keys(this.entityLayers).forEach((type) => {
        const found = this.entityLayers[type].find(
          (l) => l.layerId === layerId
        );
        if (found) {
          found.visible = visible;
          visible ? this.manager.show(layerId) : this.manager.hide(layerId);
        }
      });
    },

    /** 删除图层 */
    removeLayer(layerId) {
      this.manager.removeLayer(layerId);

      Object.keys(this.entityLayers).forEach((type) => {
        this.entityLayers[type] = this.entityLayers[type].filter(
          (l) => l.layerId !== layerId
        );
      });

      this.layers = this.layers.filter((l) => l.id !== layerId);

      this.groups.forEach((g) => {
        g.layers = g.layers.filter((id) => id !== layerId);
      });
    },

    /** 分组操作：批量显隐 */
    toggleGroup(groupId, visible) {
      const group = this.groups.find((g) => g.id === groupId);
      if (!group) return;
      group.layers.forEach((id) => this.toggleLayer(id, visible));
    },

    /** 分组操作：批量删除 */
    removeGroup(groupId) {
      const group = this.groups.find((g) => g.id === groupId);
      if (!group) return;
      group.layers.forEach((id) => this.removeLayer(id));
      this.groups = this.groups.filter((g) => g.id !== groupId);
    },

    /** 飞行到整个分组 */
    flyToGroup(groupId) {
      const group = this.groups.find((g) => g.id === groupId);
      if (!group) return;
      const allEntities = group.layers
        .flatMap((id) => this.getLayerEntities(id))
        .filter(Boolean)
        .flat();
      if (allEntities.length) this.viewer.flyTo(allEntities);
    },
    setOpacity(layerId, type, alpha) {
      this.manager.setOpacity(layerId, type, alpha);
    },
    highlight(id) {
      this.manager.highlight(id);
    },
    resetColor(id) {
      this.manager.resetColor(id);
    },

    /**
     * 销毁所有事件
     */
    destroy() {
      this.interactionManager.destroy();
    },
  },
});
