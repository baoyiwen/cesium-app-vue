/*
 * @Author: baoyiwen 511530203@qq.com
 * @Date: 2025-05-07 15:30:34
 * @LastEditors: baoyiwen 511530203@qq.com
 * @LastEditTime: 2025-05-07 16:39:47
 * @FilePath: \cesium-app-vue\src\utils\material\EntityMaterialManager.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// src/utils/EntityMaterialManager.js
import { EntityMaterialFactory } from './EntityMaterialFactory';

/**
 * 专为 Entity 系统服务的材质管理器
 */
export class EntityMaterialManager {
  constructor() {
    this._backupMap = new WeakMap(); // 保存实体原始材质
  }

  /**
   * 应用材质（自动备份、自动分发）
   * @param {Cesium.Entity} entity
   * @param {string} materialKey - EntityMaterialFactory 中的 key
   * @param {object} options - 参数传递给材质构造器
   */
  apply(entity, materialKey, options = {}) {
    if (!entity) return;

    if (!this._backupMap.has(entity)) {
      this._backupMap.set(entity, {
        polygon: entity.polygon?.material,
        polyline: entity.polyline?.material,
        label: entity.label
          ? {
              fillColor: entity.label.fillColor,
              outlineColor: entity.label.outlineColor,
            }
          : undefined,
      });
    }

    const materialBuilder = EntityMaterialFactory[materialKey];
    if (!materialBuilder) {
      console.warn(`未知材质类型: ${materialKey}`);
      return;
    }

    const result = materialBuilder(options);

    if (entity.polygon) {
      entity.polygon.material = result;
    }

    if (entity.polyline) {
      entity.polyline.material = result;
    }

    if (entity.label && result.fillColor) {
      entity.label.fillColor = result.fillColor;
      if (result.outlineColor) {
        entity.label.outlineColor = result.outlineColor;
      }
    }
  }

  /**
   * 恢复材质
   * @param {Cesium.Entity | Cesium.Entity[]} entityOrList
   */
  restore(entityOrList) {
    const list = Array.isArray(entityOrList) ? entityOrList : [entityOrList];

    list.forEach((entity) => {
      const backup = this._backupMap.get(entity);
      if (!backup) return;

      if (entity.polygon) {
        entity.polygon.material = backup.polygon;
      }
      if (entity.polyline) {
        entity.polyline.material = backup.polyline;
      }
      if (entity.label && backup.label) {
        entity.label.fillColor = backup.label.fillColor;
        entity.label.outlineColor = backup.label.outlineColor;
      }

      this._backupMap.delete(entity);
    });
  }

  clearAll() {
    this._backupMap = new WeakMap();
  }
}
