<template>
  <div class="show-page-root">
    <div class="list-container">
      <div class="list-item">
        <div class="item-title">房地产重大事件</div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref } from 'vue';
const showItemData = [
  {
    id: 1,
    name: 'test-1',
  },
  {
    id: 2,
    name: 'test-2',
  },
  {
    id: 3,
    name: 'test-3',
  },
  {
    id: 4,
    name: 'test-4',
  },
  {
    id: 5,
    name: 'test-5',
  },
  {
    id: 6,
    name: 'test-6',
  },
  {
    id: 7,
    name: 'test-7',
  },
];

const activeItem = ref(showItemData[0]);
const itemListMap = ref(new Map());
const initItemListMap = (data) => {
  data.forEach((d, index) => {
    itemListMap.value.set(d.id, index);
  });
};
onMounted(() => {
  initItemListMap(showItemData);
  console.error(itemListMap.value);
});
</script>
<style lang="less">
.show-page-root {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  overflow: hidden;
  .list-container {
    width: 300px;
    margin: 0 auto;
    background-color: #29293d;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  }
  .list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 15px;
    border-bottom: 1px solid #3a3a5b;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .list-item:hover {
    background-color: #3a3a5b;
  }
  .list-item:last-child {
    border-bottom: none;
  }
  .icon {
    width: 20px;
    height: 20px;
    margin-right: 10px;
    background-color: #4a4a7d;
    border-radius: 4px;
  }
  .item-title {
    flex-grow: 1;
    font-size: 14px;
  }
  .button {
    padding: 5px 10px;
    border: none;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  .button.start {
    background-color: #00b894;
    color: white;
  }
  .button.start:hover {
    background-color: #019874;
  }
  .button.stop {
    background-color: #d63031;
    color: white;
  }
  .button.stop:hover {
    background-color: #c92222;
  }
}
</style>
