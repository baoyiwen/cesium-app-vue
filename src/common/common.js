const turf = require("@turf/turf");
export const fixPolygons = (geojson) => {
  geojson.features.forEach((feature) => {
    if (feature.geometry.type === "Polygon") {
      const polygon = feature.geometry;
      const exterior = polygon.coordinates[0];
      if (!turf.isClockwise(exterior)) {
        polygon.coordinates[0] = exterior.slice().reverse(); // 使用slice()来复制数组
      }
      const holes = polygon.coordinates.slice(1);
      holes.forEach((hole) => {
        if (turf.isClockwise(hole)) {
          hole.reverse();
        }
      });
    } else if (feature.geometry.type === "MultiPolygon") {
      const multiPolygon = feature.geometry;
      multiPolygon.coordinates.forEach((polygon) => {
        const exterior = polygon[0];
        if (!turf.isClockwise(exterior)) {
          polygon[0] = exterior.slice().reverse();
        }
        const holes = polygon.slice(1);
        holes.forEach((hole) => {
          if (turf.isClockwise(hole)) {
            hole.reverse();
          }
        });
      });
    }
  });
  return geojson;
};

export const checkPolygons = (geojson) => {
  let errors = [];
  geojson.features.forEach((feature) => {
    if (feature.geometry.type === "Polygon") {
      const polygon = feature.geometry;
      const exterior = polygon.coordinates[0];
      if (!turf.isClockwise(exterior)) {
        errors.push({
          type: "Polygon",
          feature: feature,
          error: "Exterior is not counterclockwise",
        });
      }
      const holes = polygon.coordinates.slice(1);
      holes.forEach((hole, index) => {
        if (turf.isClockwise(hole)) {
          errors.push({
            type: "Polygon",
            feature: feature,
            error: `Hole ${index + 1} is not clockwise`,
          });
        }
      });
    } else if (feature.geometry.type === "MultiPolygon") {
      const multiPolygon = feature.geometry;
      multiPolygon.coordinates.forEach((polygon) => {
        const exterior = polygon[0];
        if (!turf.isClockwise(exterior)) {
          errors.push({
            type: "MultiPolygon",
            feature: feature,
            error: "Exterior is not counterclockwise",
          });
        }
        const holes = polygon.slice(1);
        holes.forEach((hole, index) => {
          if (turf.isClockwise(hole)) {
            errors.push({
              type: "MultiPolygon",
              feature: feature,
              error: `Hole ${index + 1} is not clockwise`,
            });
          }
        });
      });
    }
  });
  return errors;
};

export const BaseSettings = {
  title: '数字城市演示项目',
  projectCopyright: 'My Three.js Library ©2024'
}

export const CesiumSetting = {
  token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI0N2YxOWQ0NC1mYTkyLTQzYTEtOWU0Ny1jOTQyOTE2ZDFlOTMiLCJpZCI6MjMyMTc3LCJpYXQiOjE3MjI4NDUxNzN9.UijwFTk4emxDLQHMXFaA2-36v3c1kKVV-EVs0OGO54o`
}
