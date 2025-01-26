<script setup lang="ts">
import { ref, computed } from 'vue';
import { onMounted, onBeforeUnmount } from "vue";
import Tile from "./Tile.vue";

const props = defineProps({
  columns: { type: Number, default: 5 },
  num_tiles: { type: Number, default: 8 },
});

// 画像URLの一時保存先。Tileコンポーネントに渡す
const imageUrls = ref<Record<number, string>>({});
const interval = 5 * 1000;
let fetchTimer: number | undefined;

onMounted(() => {
  fetchImageList();
  fetchTimer = setInterval(fetchImageList, interval);
});

onBeforeUnmount(() => {
  if (fetchTimer) {
    clearInterval(fetchTimer);
  }
});

const gridStyle = computed(() => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${props.columns}, 1fr)`,
  gap: '1rem',
}));

async function fetchImageList() {
    try {
    const url = "http://localhost:8000/api/images/";
    const response = await fetch(url);
    const data = await response.json();

    const urls = data.map((item) => { return { id: item.id, url: `${url}${item.id}?t=${Date.now()}` } });
    // 配列をシャッフルする関数(一時的なもの)
    urls.sort(() => Math.random() - 0.5);
    for (let i = 0; i < props.num_tiles; i++) {
      imageUrls.value[i] = urls[i % urls.length].url;
    }
  } catch (error) {
    console.error('Failed to fetch image list:', error);
  }
};
</script>

<template>
  <div :style="gridStyle" class="tiles-container">
    <Tile v-for="(url, id) in imageUrls" :child_id="Number(id)" :resource_url="url" style="width: 100%;" />
  </div>
</template>

<style scoped>
.tiles-container {
  width: 100%;
}
</style>
