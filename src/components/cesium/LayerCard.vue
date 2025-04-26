<!--
 * @Author: baoyiwen 511530203@qq.com
 * @Date: 2025-04-26 14:52:15
 * @LastEditors: baoyiwen 511530203@qq.com
 * @LastEditTime: 2025-04-26 15:17:53
 * @FilePath: \cesium-app-vue\src\components\cesium\LayerCard.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="layer-card">
    <div class="layer-header">
      <span class="drag-handle">⠿</span>

      <el-checkbox v-model="layer.visible" @change="toggleVisibility">
        <span v-if="!editing" @dblclick="startEdit">{{ layer.name }}</span>
        <el-input
          v-else
          v-model="layer.name"
          size="small"
          @blur="stopEdit"
          @keydown.enter.native="stopEdit"
        />
      </el-checkbox>

      <div class="btns">
        <el-button icon="location" @click="flyTo" circle size="small" />
        <el-button icon="brush" @click="highlight" circle size="small" />
        <el-button icon="refresh" @click="resetColor" circle size="small" />
        <el-button
          icon="delete"
          @click="remove"
          circle
          size="small"
          type="danger"
        />
      </div>
    </div>

    <el-slider
      v-model="layer.opacity"
      :min="0"
      :max="1"
      :step="0.01"
      @input="setOpacity"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useLayerStore } from '../../store/layerStore';
const props = defineProps({ layer: Object });
const store = useLayerStore();
const editing = ref(false);
console.error(props.layer);
const toggleVisibility = () => {
  store.toggleLayer(props.layer.id, props.layer.visible);
};
const startEdit = () => (editing.value = true);
const stopEdit = () => (editing.value = false);
const setOpacity = () => {
  props.layer.entityTypes.forEach((t) =>
    store.setOpacity(props.layer.id, t, props.layer.opacity)
  );
};
const flyTo = () => store.flyTo(props.layer.id);
const highlight = () => store.highlight(props.layer.id);
const resetColor = () => store.resetColor(props.layer.id);
const remove = () => store.removeLayer(props.layer.id);
</script>
<style lang="less">
.cesium-layer-panel {
  width: 340px;
  background: #fafafa;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
}

.layer-card {
  margin-bottom: 8px;
}

.layer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btns {
  display: flex;
  gap: 6px;
}
</style>
