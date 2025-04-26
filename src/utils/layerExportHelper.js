export function exportLayerConfig(store) {
  return JSON.stringify(
    {
      layers: store.layers,
      groups: store.groups,
    },
    null,
    2
  );
}

export function importLayerConfig(store, json) {
  try {
    const data = JSON.parse(json);
    store.layers = data.layers;
    store.groups = data.groups;
  } catch (err) {
    console.error('导入配置失败:', err);
  }
}
