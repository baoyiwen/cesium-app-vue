/*
 * @Author: baoyiwen 511530203@qq.com
 * @Date: 2025-04-28 16:33:26
 * @LastEditors: baoyiwen 511530203@qq.com
 * @LastEditTime: 2025-04-30 11:26:36
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
    Cesium.Material[`${name}Type`] = name; // 注册材质类型
    Cesium.Material._materialCache.addMaterial(name, {
      fabric,
      translucent: true,
    });

    console.error('材质注册成功', name);
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
      // entity.polygon.material = Cesium.Material.fromType('PulseScanMaterial', {
      //   color: Cesium.Color.YELLOW, // 可覆盖默认颜色
      //   speed: 1.0,
      //   gradient: 0.1,
      // });
      // console.error(Cesium.Material._materialCache);
      // console.error(new Cesium.MaterialProperty());
      // console.error(Cesium.Material.fromType('PulseScanMaterial'), entity);
      // entity.polygon.material = new Cesium.Material({
      //   fabric: {
      //     type: 'PulseScanMaterial',
      //     uniforms: {
      //       color: new Cesium.Color(1.0, 1.0, 0.0, 1.0), // 默认颜色（黄色）
      //       speed: 1.0, // 扫描速度
      //       count: 2.0, // 波纹数量（但当前 GLSL 代码未使用此参数）
      //       gradient: 0.1, // 渐变过渡范围
      //     },
      //     source: `
      //           czm_material czm_getMaterial(czm_materialInput materialInput) {
      //             czm_material material = czm_getDefaultMaterial(materialInput);
      //             vec2 st = materialInput.st;
      //             float t = fract(czm_frameNumber * 0.016 * u_speed); // 使用 u_speed
      //             float dis = distance(st, vec2(0.5, 0.5));
      //             float alpha = smoothstep(t, t + u_gradient, dis) * step(dis, 0.5); // 使用 u_gradient
      //             alpha *= (1.0 - smoothstep(0.5 - u_gradient, 0.5, dis));
      //             material.alpha = alpha;
      //             material.diffuse = u_color.rgb; // 使用 u_color
      //             return material;
      //           }
      //         `,
      //   },
      // });
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

  deleteMaterial(name) {
    if (this._registeredMaterials.has(name)) {
      delete Cesium.Material._materialCache[name];
      this._registeredMaterials.delete(name);
      delete Cesium.Material[`${name}Type`];
      console.error('材质删除成功', name);
    } else {
      console.error('材质不存在', name);
    }
  }
}
