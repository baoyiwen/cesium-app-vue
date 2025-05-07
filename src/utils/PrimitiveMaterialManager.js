import * as Cesium from 'cesium';
import { convertColor } from './cesium';

/**
 * 专用于 Primitive（如 GroundPrimitive）材质管理的工厂类
 */
export class PrimitiveMaterialManager {
  constructor() {
    this._registeredMaterials = new Set();
    this._materialConfigs = new Map(); // name -> config
  }

  /**
   * 注册一个 Primitive 可用的材质
   * @param {string} name 材质名称
   * @param {object} config 包含 fabric 定义和默认 uniforms
   */
  registerMaterial(name, config) {
    if (this._registeredMaterials.has(name)) {
      console.warn(`[材质管理] ${name} 已注册`);
      return;
    }

    // 注册 Cesium 材质
    Cesium.Material[`${name}Type`] = name;
    Cesium.Material._materialCache.addMaterial(name, {
      fabric: config.fabric,
      translucent: config.translucent ?? true,
    });

    this._materialConfigs.set(name, config);
    this._registeredMaterials.add(name);

    console.log(`Primitive 材质已注册: ${name}`);
  }

  /**
   * 应用材质到 Primitive appearance
   * @param {string} name 材质类型名称
   * @param {object} overrideUniforms 可选：覆盖默认 uniforms
   * @returns {Cesium.MaterialAppearance} 可用于 Primitive
   */
  createMaterialAppearance(name, overrideUniforms = {}) {
    const config = this._materialConfigs.get(name);
    if (!config) {
      console.error(`材质 ${name} 未注册`);
      return null;
    }

    const mergedUniforms = {
      ...(config.fabric.uniforms || {}),
      ...overrideUniforms,
    };

    return new Cesium.MaterialAppearance({
      material: new Cesium.Material({
        fabric: {
          type: name,
          uniforms: mergedUniforms,
        },
      }),
      faceForward: true,
      closed: true,
    });
  }

  /**
   * 删除某个注册材质（从 _materialCache 移除）
   * @param {string} name
   */
  deleteMaterial(name) {
    if (this._registeredMaterials.has(name)) {
      delete Cesium.Material._materialCache[name];
      delete Cesium.Material[`${name}Type`];

      this._registeredMaterials.delete(name);
      this._materialConfigs.delete(name);
      console.log(`材质 ${name} 已删除`);
    } else {
      console.warn(`材质 ${name} 未注册`);
    }
  }
}
