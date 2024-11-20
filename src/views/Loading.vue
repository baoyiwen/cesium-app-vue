<template>
  <transition name="fade">
    <div v-if="isVisible" class="loading-overlay">
      <div class="spinner"></div>
      <p>{{ loadingMessage }}</p>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useLoadingStore } from '../store/loadingStore';

// // 定义组件的 props
// defineProps({
//   visible: {
//     type: Boolean,
//     default: true, // 默认显示
//   },
// });
// const emit = defineEmits(['visibleChange']);
// const { t } = useI18n();
// // console.log('i18n instance:', i18n.global);
// // 响应式变量控制显示状态
// const isVisible = ref(false);

// // 监听 visible prop 的变化，并更新 isVisible
// watch(
//   () => visible,
//   (newVal) => {
//     isVisible.value = newVal;
//   },
//   { immediate: true }
// );

// // 发出事件通知父组件
// watch(isVisible, (newVal) => {
//   emit('visibleChange', newVal);
// });

// 从 Pinia 中获取全局 Loading 状态
const loadingStore = useLoadingStore();
const isVisible = computed(() => loadingStore.isLoading);
const loadingMessage = computed(() => loadingStore.loadingMessage);
</script>

<style>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* 半透明背景 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.spinner {
  border: 8px solid #f3f3f3;
  border-top: 8px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
/* 过渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
