<script setup lang="ts">
import { ref, computed } from 'vue'
import Tile from "./Tile.vue";

const props = defineProps({
  columns: { type: Number, default: 5 },
  num_tiles: { type: Number, default: 8 },
});

// resourceUrls と childComponents を動的に生成
const resourceUrls = computed(() => {
  const urls: Record<number, string> = {};
  for (let i = 0; i < props.num_tiles; i++) {
    urls[i+1] = 'http://localhost:8000/api/images/random';
  }
  return urls;
});

const childComponents = computed(() => {
  return Array.from({ length: props.num_tiles }, (_, index) => ({ id: index + 1 }));
});

const gridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
  gap: '1rem',
}));
</script>

<template>
  <div :style="gridStyle" class="tiles-container">
    <Tile v-for="child in childComponents" :child_id="child.id" :resource_url="resourceUrls[child.id]"
      style="width: 100%;" />
  </div>
</template>

<style scoped>
.tiles-container {
  width: 100%;
}
</style>
