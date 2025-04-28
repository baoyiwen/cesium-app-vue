/*
 * @Author: baoyiwen 511530203@qq.com
 * @Date: 2025-04-28 16:18:54
 * @LastEditors: baoyiwen 511530203@qq.com
 * @LastEditTime: 2025-04-28 17:57:28
 * @FilePath: \cesium-app-vue\src\utils\PulseScanMaterial.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// utils/PulseScanMaterial.js
import * as Cesium from 'cesium';
import { convertColor } from './cesium';

export const PulseScanMaterialFabric = {
  type: 'PulseScanMaterial',
  uniforms: {
    color: new Cesium.Color(1.0, 1.0, 0.0, 1.0), // 默认颜色（黄色）
    speed: 1.0, // 扫描速度
    count: 2.0, // 波纹数量（但当前 GLSL 代码未使用此参数）
    gradient: 0.1, // 渐变过渡范围
  },
  source: `
            czm_material czm_getMaterial(czm_materialInput materialInput) {
              czm_material material = czm_getDefaultMaterial(materialInput);
              vec2 st = materialInput.st;
              float t = fract(czm_frameNumber * 0.016 * u_speed); // 使用 u_speed
              float dis = distance(st, vec2(0.5, 0.5));
              float alpha = smoothstep(t, t + u_gradient, dis) * step(dis, 0.5); // 使用 u_gradient
              alpha *= (1.0 - smoothstep(0.5 - u_gradient, 0.5, dis));
              material.alpha = alpha;
              material.diffuse = u_color.rgb; // 使用 u_color
              return material;
            }
          `,
};
