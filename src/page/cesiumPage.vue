<template>
    <div class="cesium-layout">
        <CesiumComponentLayout ref="cesiumLaout"></CesiumComponentLayout>
    </div>
</template>
<script setup>
import CesiumComponentLayout from '../components/CesiumComponents/CesiumComponentLayout.vue';
import { reactive, ref, onMounted } from 'vue';
const cesiumLaout = ref(null);
console.error(cesiumLaout);
</script>
<style lang="less" scoped>
.cesium-layout {
    width: 100%;
    height: 100%;
}
</style>