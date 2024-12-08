<template>
  <div class="content-root">
    <CesiumComponent />
  </div>
</template>

<script setup>
import CesiumComponent from '../components/cesium/CesiumComponent.vue';
</script>
<style scoped>
.content-root {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  overflow: hidden;
}
</style>
