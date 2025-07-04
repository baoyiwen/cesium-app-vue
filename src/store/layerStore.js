/*
 * @Author: baoyiwen 511530203@qq.com
 * @Description: Layer Store 管理层（逻辑图层、实体分类、分组管理）
 */

import { defineStore } from 'pinia';
import {
  GeoLayerManager,
  LayerEventDispatcher,
  PrimitiveMaterialManager,
  PulseScanMaterialFabric,
} from '../utils';
import * as Cesium from 'cesium';
import { EntityMaterialManager } from '../utils/material/EntityMaterialManager';

export const useLayerStore = defineStore('layer', {
  state: () => ({
    viewer: null,
    manager: null, // GeoLayerManager 实例
    interactionManager: null, // LayerInteractionManager 实例
    primitiveMaterialManager: null,
    entityMaterialManager: null,

    entityLayers: {}, // { type: [{ layerId, entities }] }
    layers: [], // [{ id, name, groupId, entityTypes: [] }]
    groups: [
      {
        id: 'default',
        name: '默认分组',
        zIndex: 0,
        layers: [], // 图层ID列表
      },
    ], // [{ id, name, zIndex, layers: [] }]
    selectedEntities: [], // 多选中的实体列表
  }),

  actions: {
    /** 初始化 */
    init(viewer) {
      this.viewer = viewer;
      this.manager = new GeoLayerManager(viewer);
      this.interactionManager = new LayerEventDispatcher(viewer);
      this.primitiveMaterialManager = new PrimitiveMaterialManager();
      this.entityMaterialManager = new EntityMaterialManager();
      this.initMateria();
    },

    initMateria() {
      this.primitiveMaterialManager.registerMaterial(
        'PulseScanMaterial',
        PulseScanMaterialFabric
      );

      // 注册材质
      //   Cesium.Material._materialCache.addMaterial('PulseScanMaterial', {
      //     fabric: {
      //       type: 'PulseScanMaterial',
      //       uniforms: {
      //         color: new Cesium.Color(1.0, 1.0, 0.0, 1.0), // 默认颜色（黄色）
      //         speed: 1.0, // 扫描速度
      //         count: 2.0, // 波纹数量（但当前 GLSL 代码未使用此参数）
      //         gradient: 0.1, // 渐变过渡范围
      //       },
      //       source: `
      //   czm_material czm_getMaterial(czm_materialInput materialInput) {
      //     czm_material material = czm_getDefaultMaterial(materialInput);
      //     vec2 st = materialInput.st;
      //     float t = fract(czm_frameNumber * 0.016 * u_speed); // 使用 u_speed
      //     float dis = distance(st, vec2(0.5, 0.5));
      //     float alpha = smoothstep(t, t + u_gradient, dis) * step(dis, 0.5); // 使用 u_gradient
      //     alpha *= (1.0 - smoothstep(0.5 - u_gradient, 0.5, dis));
      //     material.alpha = alpha;
      //     material.diffuse = u_color.rgb; // 使用 u_color
      //     return material;
      //   }
      // `,
      //     },
      //   });
    },

    setSelectedEntities(entities) {
      this.selectedEntities = entities;
    },

    clearSelectedEntities() {
      this.selectedEntities = [];
    },

    /** 高亮选中实体 + 动态呼吸动画 */
    highlightSelectedEntities() {
      this.selectedEntities.forEach((e) => {
        const now = Cesium.JulianDate.now();

        // Polygon 呼吸效果
        // 记得先注册自定义材质
        if (e.polygon) {
          if (!e._originMaterial) {
            e._originMaterial = e.polygon.material;
          }

          this.entityMaterialManager.apply(e, 'BreathingPolygon', {
            color: Cesium.Color.YELLOW,
          });
        }

        // ✅ Polyline 流光效果
        if (e.polyline) {
          if (!e._originMaterial) {
            e._originMaterial = e.polyline.material;
          }

          e.polyline.material = new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.2,
            taperPower: 0.5,
            color: Cesium.Color.YELLOW.withAlpha(0.8),
          });
        }

        // ✅ Label 呼吸发光
        if (e.label) {
          if (!e._originFillColor) {
            e._originFillColor = e.label.fillColor;
            e._originOutlineColor = e.label.outlineColor;
          }
          e.label.fillColor = new Cesium.CallbackProperty(() => {
            const t = (Date.now() % 3000) / 3000;
            const alpha = 0.5 + 0.5 * Math.sin(t * Math.PI * 2);
            return Cesium.Color.YELLOW.withAlpha(alpha);
          }, false);
          e.label.outlineColor = Cesium.Color.RED;
        }

        // ✅ Point 闪烁放大（如果是点）
        if (e.point) {
          if (!e._originColor) {
            e._originColor = e.point.color;
          }
          e.point.color = new Cesium.CallbackProperty(() => {
            const t = (Date.now() % 1500) / 1500;
            const alpha = 0.6 + 0.4 * Math.sin(t * Math.PI * 2);
            return Cesium.Color.YELLOW.withAlpha(alpha);
          }, false);
        }
      });
    },

    /** 恢复高亮，重置呼吸动画效果 */
    resetSelectedEntitiesHighlight() {
      this.selectedEntities.forEach((e) => {
        if (e.polygon && e._originMaterial) {
          e.polygon.material = e._originMaterial;
          delete e._originMaterial;
        }
        if (e.polyline && e._originMaterial) {
          e.polyline.material = e._originMaterial;
          delete e._originMaterial;
        }
        if (e.label && e._originFillColor) {
          e.label.fillColor = e._originFillColor;
          e.label.outlineColor = e._originOutlineColor;
          delete e._originFillColor;
          delete e._originOutlineColor;
        }
        if (e.point && e._originColor) {
          e.point.color = e._originColor;
          delete e._originColor;
        }
      });
    },

    // highlightSelectedEntities() {
    //   this.selectedEntities.forEach((e) => {
    //     if (e.polygon) {
    //       e.polygon.material = Cesium.Color.YELLOW.withAlpha(0.8);
    //     } else if (e.label) {
    //       e.label.fillColor = Cesium.Color.YELLOW;
    //     }
    //   });
    // },

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
          entityTypes: Object.entries(entitiesByType)
            .filter(([key, value]) => value.length)
            .map(([key, value]) => key),
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
