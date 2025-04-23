// composables/useGeoLayerManager.js
import { ref, readonly } from 'vue';
import { GeoLayerManager } from '../../utils/GeoLayerManager';

export function useGeoLayerManager(viewer) {
  const manager = new GeoLayerManager(viewer);
  const layers = ref([]);

  const registerLayer = ({ id, name, type, entities }) => {
    manager.addLayer({ id, type, entities });
    layers.value.push({
      id,
      name: name || id,
      type,
      visible: true,
    });
  };

  const removeLayer = (id) => {
    manager.removeLayer(id);
    layers.value = layers.value.filter((l) => l.id !== id);
  };

  const toggleLayer = (id) => {
    const found = layers.value.find((l) => l.id === id);
    if (!found) return;
    found.visible = !found.visible;
    found.visible ? manager.show(id) : manager.hide(id);
  };

  return {
    manager,
    layers: readonly(layers),
    registerLayer,
    removeLayer,
    toggleLayer,
  };
}
