<script setup lang="ts">
import { ref, computed } from 'vue'
import Tile from "./Tile.vue";

const resourceUrls = ref<Record<number, string>>({
  1: 'http://localhost:8000/api/images/random',
  2: 'http://localhost:8000/api/images/random',
  3: 'http://localhost:8000/api/images/random',
  4: 'http://localhost:8000/api/images/random',
})

const childComponents = ref<Record<string, number>[]>([
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
]);

const props = defineProps({
  columns: { type: Number, default: 5 },
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
      style="width: 200px; height: 200px;" />
  </div>
</template>

<style scoped>
.tiles-container {
  width: 100%;
}

.tile {
  aspect-ratio: 1 / 1;
  /* 正方形を維持 */
  background-color: #f0f0f0;
  border: 1px solid #ccc;
}
</style>
