<script setup>
import { ref } from 'vue';

// 1. 获取所有 `pages/` 目录下的 `.vue` 文件
const vueFiles = import.meta.glob('/src/page/**/*.vue', { eager: true });
const componentTree = ref([]);

// 2. 解析 Vue 组件的模板结构
function extractComponents(template) {
  const regex = /<([A-Z][a-zA-Z0-9]*)/g;
  let match;
  const components = [];

  while ((match = regex.exec(template)) !== null) {
    components.push({ name: match[1], children: [] });
  }
  return components;
}

// 3. 生成组件树
function generateComponentTree() {
  const tree = [];

  for (const path in vueFiles) {
    const component = vueFiles[path];
    if (component.default && component.default.__file) {
      const template = component.default.__vccOpts?.template || '';
      tree.push({
        file: component.default.__file,
        tree: extractComponents(template),
      });
    }
  }
  componentTree.value = tree;
}

generateComponentTree();
</script>

<template>
  <div>
    <h2>Vue Component Tree</h2>
    <pre>{{ JSON.stringify(componentTree, null, 2) }}</pre>
  </div>
</template>
