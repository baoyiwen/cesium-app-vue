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

export const config = {
    
}
