<template>
  <div>
    <h1>Home Page</h1>
    <p>Counter: {{ counter }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<script setup>
import { useCounterStore } from "../store/counterStore";
import { computed } from "vue";

const store = useCounterStore();
const counter = computed(() => store.count);

const increment = () => {
  store.increment();
};
</script>
