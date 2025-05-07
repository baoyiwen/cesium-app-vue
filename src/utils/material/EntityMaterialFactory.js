/*
 * @Author: baoyiwen 511530203@qq.com
 * @Date: 2025-05-07 15:29:57
 * @LastEditors: baoyiwen 511530203@qq.com
 * @LastEditTime: 2025-05-07 15:30:11
 * @FilePath: \cesium-app-vue\src\utils\material\EntityMaterialFactory.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// src/material/EntityMaterialFactory.js
import * as Cesium from 'cesium';

/**
 * 所有 Entity 可用的材质类型定义
 * 每个材质都返回一个 MaterialProperty 子类实例
 */
export const EntityMaterialFactory = {
  /**
   * 脉冲扫光材质
   */
  PulseScanMaterial: (options = {}) => {
    return new Cesium.PolylineGlowMaterialProperty({
      glowPower: 0.3,
      taperPower: 0.5,
      color: new Cesium.CallbackProperty(() => {
        const t = (Date.now() % 2000) / 2000;
        const alpha = 0.5 + 0.5 * Math.sin(t * Math.PI * 2);
        return Cesium.Color.YELLOW.withAlpha(alpha);
      }, false),
    });
  },

  /**
   * Polygon 呼吸效果（ColorMaterialProperty）
   */
  BreathingPolygon: (options = {}) => {
    return new Cesium.ColorMaterialProperty(
      new Cesium.CallbackProperty(() => {
        const t = (Date.now() % 3000) / 3000;
        const alpha = 0.5 + 0.5 * Math.sin(t * Math.PI * 2);
        return (options.color || Cesium.Color.YELLOW).withAlpha(alpha);
      }, false)
    );
  },

  /**
   * Label 呼吸颜色（返回 fillColor/outLineColor 回调）
   */
  LabelBreathColors: (options = {}) => {
    return {
      fillColor: new Cesium.CallbackProperty(() => {
        const t = (Date.now() % 2000) / 2000;
        return (options.color || Cesium.Color.YELLOW).withAlpha(
          0.5 + 0.5 * Math.sin(t * Math.PI * 2)
        );
      }, false),
      outlineColor: Cesium.Color.BLACK,
    };
  },
};
