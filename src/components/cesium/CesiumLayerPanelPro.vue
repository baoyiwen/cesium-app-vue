<template>
  <div class="cesium-layer-panel">
    <div class="panel-actions">
      <el-button @click="exportLayers">导出配置</el-button>
      <el-button @click="triggerImport">导入配置</el-button>
      <input type="file" ref="fileInput" hidden @change="handleImport" />
    </div>

    <el-collapse v-model="activeGroups" accordion>
      <el-collapse-item
        v-for="group in groups"
        :key="group.id"
        :name="group.id"
      >
        <template #title>{{ group.name }}</template>

        <!-- <draggable
          :list="getLayersByGroup(group.id)"
          item-key="id"
          handle=".drag-handle"
        >
          <template #item="{ element: layer }">
            <LayerCard :layer="layer" />
          </template>
        </draggable> -->
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useLayerStore } from '../../store/layerStore';
import LayerCard from './LayerCard.vue';
import {
  exportLayerConfig,
  importLayerConfig,
} from '../../utils/layerExportHelper';
import draggable from 'vuedraggable';

const store = useLayerStore();
const groups = computed(() => store.groups);
console.error(groups);
const activeGroups = ref([]);

const fileInput = ref();

const getLayersByGroup = (groupId) => {
  return store.layers.filter((l) => l.groupId === groupId);
};

const exportLayers = () => {
  const data = exportLayerConfig(store);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'layer-config.json';
  a.click();
  URL.revokeObjectURL(url);
};

const triggerImport = () => {
  fileInput.value?.click();
};

const handleImport = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    importLayerConfig(store, reader.result);
  };
  reader.readAsText(file);
};
</script>

<style scoped>
.cesium-layer-panel {
  width: 320px;
  background: #f8f8f8;
  padding: 10px;
  border-radius: 8px;
  overflow-y: auto;
  position: absolute;
  top: 20px;
  left: 20px;
}

.layer-item {
  padding: 8px 0;
  border-bottom: 1px solid #ddd;
}

.layer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.layer-btns {
  display: flex;
  gap: 6px;
}
</style>
