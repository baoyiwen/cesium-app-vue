/*
 * @Author: baoyiwen 511530203@qq.com
 * @Date: 2025-04-28 16:33:26
 * @LastEditors: baoyiwen 511530203@qq.com
 * @LastEditTime: 2025-04-28 18:08:06
 * @FilePath: \cesium-app-vue\src\utils\MaterialManager.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import * as Cesium from 'cesium';
import { convertColor } from './cesium';

export class MaterialManager {
  constructor() {
    this._registeredMaterials = new Set();
  }

  /**
   * 注册自定义材质
   * @param {string} name - 材质类型名称
   * @param {object} fabric - 材质Fabric定义
   */
  registerMaterial(name, fabric) {
    if (this._registeredMaterials.has(name)) {
      return; // 已注册
    }
    Cesium.Material._materialCache.addMaterial(name, {
      fabric,
      translucent: true,
    });
    this._registeredMaterials.add(name);
  }

  /**
   * 应用材质到实体
   * @param {Cesium.Entity} entity - 目标实体
   * @param {string} materialType - 材质type
   * @param {object} uniforms - 材质 uniforms 参数
   */
  applyMaterial(entity, materialType, uniforms = {}) {
    if (entity.polygon) {
      //   entity.polygon.material = {
      //     fabric: {
      //       type: materialType,
      //       uniforms: {
      //         ...uniforms,
      //         color: convertColor(uniforms.color),
      //       },
      //     },
      //   };
      entity.polygon.material = Cesium.Material.fromType(materialType, {
        // color: Cesium.Color.YELLOW, // 可覆盖默认颜色
        // ...uniforms,
        color: convertColor(uniforms.color),
      });
    } else if (entity.polyline) {
      entity.polyline.material = {
        fabric: {
          type: materialType,
          uniforms: {
            ...uniforms,
            color: convertColor(uniforms.color),
          },
        },
      };
    }
    // 其他类型可以自己扩展
  }

  /**
   * 修改实体已有材质参数（动态调节）
   * @param {Cesium.Entity} entity
   * @param {object} newUniforms
   */
  updateMaterialUniforms(entity, newUniforms = {}) {
    let material = null;
    if (entity.polygon) {
      material = entity.polygon.material;
    } else if (entity.polyline) {
      material = entity.polyline.material;
    }
    if (!material || !material.uniforms) return;

    Object.assign(material.uniforms, newUniforms);
  }
}
