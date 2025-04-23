/*
 * @Author: baoyiwen 511530203@qq.com
 * @Date: 2025-04-22 16:27:54
 * @LastEditors: baoyiwen 511530203@qq.com
 * @LastEditTime: 2025-04-23 17:40:25
 * @FilePath: \cesium-app-vue\src\store\layerStore.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// stores/layerStore.js
import { defineStore } from 'pinia';
import { GeoLayerManager } from '../utils/GeoLayerManager';

export const useLayerStore = defineStore('layer', {
  state: () => ({
    viewer: null,
    manager: null,

    // 三类实体类型分开保存，记录 source layerId
    polygonLayers: [],
    labelLayers: [],
    polylineLayers: [],

    // 所有逻辑 layer
    layers: [],

    // 分组：按业务逻辑划分
    groups: [], // { id, name, zIndex, layers: [layerId, ...] }
  }),

  actions: {
    init(viewer) {
      this.viewer = viewer;
      this.manager = new GeoLayerManager(viewer);
    },

    // 创建分组
    createGroup({ id, name, zIndex = 0 }) {
      if (this.groups.find((g) => g.id === id)) return;
      this.groups.push({
        id,
        name,
        zIndex,
        layers: [],
      });
    },

    // 添加逻辑 layer（来源级别，如一个geojson）
    addLayer({ layerId, name, groupId, type, entitiesByType }) {
      const existing = this.layers.find((l) => l.id === layerId);
      if (!existing) {
        this.layers.push({
          id: layerId,
          name,
          type,
          groupId,
          visible: true,
          entityTypes: Object.keys(entitiesByType),
        });
      }
      // 添加实体至分类中
      for (const [entityType, entities] of Object.entries(entitiesByType)) {
        this._addEntitiesToType(entityType, layerId, entities);
      }
      // 添加至 group
      const group = this.groups.find((g) => g.id === groupId);
      if (group && !group.layers.includes(layerId)) {
        group.layers.push(layerId);
      }
    },

    // 内部：分类添加
    _addEntitiesToType(type, layerId, entities) {
      const record = { layerId, entities, visible: true };
      if (type === 'polygon') this.polygonLayers.push(record);
      if (type === 'label') this.labelLayers.push(record);
      if (type === 'polyline') this.polylineLayers.push(record);
      this.manager.addLayer({ id: layerId, type, entities });
    },

    // 获取 layer 所有实体
    getLayerEntities(layerId) {
      return this.manager.getEntities(layerId) || [];
    },

    // 显隐整个 layer
    toggleLayer(layerId, visible) {
      const types = [this.polygonLayers, this.labelLayers, this.polylineLayers];
      types.forEach((list) => {
        const found = list.find((l) => l.layerId === layerId);
        if (found) {
          found.visible = visible;
          visible ? this.manager.show(layerId) : this.manager.hide(layerId);
        }
      });
      this.layers.find((l) => l.id === layerId).visible = visible;
    },

    removeLayer(layerId) {
      this.manager.removeLayer(layerId);
      this.polygonLayers = this.polygonLayers.filter(
        (l) => l.layerId !== layerId
      );
      this.labelLayers = this.labelLayers.filter((l) => l.layerId !== layerId);
      this.polylineLayers = this.polylineLayers.filter(
        (l) => l.layerId !== layerId
      );
      this.layers = this.layers.filter((l) => l.id !== layerId);
      this.groups.forEach(
        (g) => (g.layers = g.layers.filter((id) => id !== layerId))
      );
    },

    toggleGroup(groupId, visible) {
      const group = this.groups.find((g) => g.id === groupId);
      if (!group) return;
      group.layers.forEach((id) => this.toggleLayer(id, visible));
    },

    removeGroup(groupId) {
      const group = this.groups.find((g) => g.id === groupId);
      if (!group) return;
      group.layers.forEach((id) => this.removeLayer(id));
      this.groups = this.groups.filter((g) => g.id !== groupId);
    },

    flyToGroup(groupId) {
      const group = this.groups.find((g) => g.id === groupId);
      if (!group) return;
      const allEntities = group.layers
        .flatMap((id) => this.getLayerEntities(id))
        .filter(Boolean);
      if (allEntities.length) this.viewer.flyTo(allEntities);
    },
  },
});
