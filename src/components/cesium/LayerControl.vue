<!--
 * @Author: baoyiwen 511530203@qq.com
 * @Date: 2025-04-22 14:32:58
 * @LastEditors: baoyiwen 511530203@qq.com
 * @LastEditTime: 2025-04-23 16:21:15
 * @FilePath: \cesium-app-vue\src\components\cesium\LayerControl.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<!-- components/LayerControl.vue -->
<template>
  <div class="layer-control">
    <h4>图层控制</h4>
    <el-checkbox-group v-model="checkedIds">
      <el-checkbox
        v-for="layer in layers"
        :key="layer.id"
        :label="layer.id"
        @change="(data) => toggleLayer(layer, data)"
      >
        {{ layer.name }}
      </el-checkbox>
    </el-checkbox-group>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useLayerStore } from '../../store/layerStore';
import { storeToRefs } from 'pinia';
const layerStore = useLayerStore();
const { layers } = storeToRefs(layerStore);
// const layers = computed(() => layerStore.layers);
const checkedIds = ref([]);
watch(
  layers.value,
  () => {
    checkedIds.value = layers.value.filter((l) => l.visible).map((l) => l.id);
  },
  { immediate: true }
);

const toggleLayer = (layer, data) => {
  layerStore.toggleLayer(layer.id, data);
};
</script>

<style scoped>
.layer-control {
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  padding: 12px;
  width: 200px;
  z-index: 999;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}
</style>
