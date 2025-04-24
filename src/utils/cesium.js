import { Color } from 'cesium';
// // **解析 `geojson` 目录**
// export const resolveGeoJsonFiles = (geojsonPaths) => {
//   let files = [];
//   geojsonPaths.forEach((path) => {
//     if (path.endsWith('/')) {
//       // **如果是文件夹，获取所有 `json` 文件**
//       const globFiles = Object.keys(
//         import.meta.glob(`/public${path}*.json`)
//       ).map((f) => f.replace('/public', ''));
//       files.push(...globFiles);
//     } else {
//       // **如果是单个文件**
//       files.push(path);
//     }
//   });
//   return files;
// };

export const config = {};

// **转换标准 `rgba` 或 `#hex` 颜色到 Cesium.Color**
export const convertColor = (color) => {
  if (!color) return Color.WHITE; // 默认白色

  // **RGBA 格式**
  if (color.startsWith('rgba')) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]*)?\)/);
    if (match) {
      const r = parseFloat(match[1]) / 255;
      const g = parseFloat(match[2]) / 255;
      const b = parseFloat(match[3]) / 255;
      const a = match[4] ? parseFloat(match[4]) : 1.0;
      return new Color(r, g, b, a);
    }
  }

  // **十六进制格式**
  if (color.startsWith('#')) {
    let r,
      g,
      b,
      a = 1.0;
    if (color.length === 7) {
      // `#RRGGBB`
      r = parseInt(color.slice(1, 3), 16) / 255;
      g = parseInt(color.slice(3, 5), 16) / 255;
      b = parseInt(color.slice(5, 7), 16) / 255;
    } else if (color.length === 9) {
      // `#RRGGBBAA`
      r = parseInt(color.slice(1, 3), 16) / 255;
      g = parseInt(color.slice(3, 5), 16) / 255;
      b = parseInt(color.slice(5, 7), 16) / 255;
      a = parseInt(color.slice(7, 9), 16) / 255;
    } else {
      return Color.WHITE; // 无效格式返回白色
    }
    return new Color(r, g, b, a);
  }

  return Color.WHITE; // 默认返回白色
};
