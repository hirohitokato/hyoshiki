<!-- <script setup lang="ts">
import { ref } from 'vue';
import { onMounted, onBeforeUnmount } from "vue";
import MasonryWall from '@yeger/vue-masonry-wall';
import Tile from "./Tile.vue";


const props = defineProps({
    columns: { type: Number, default: 5 },
    num_tiles: { type: Number, default: 8 },
});

const interval = 5 * 1000;
let fetchTimer: number | undefined;

// タイルごとの画像リスト
const imageList = ref<{ id: number; url: string }[]>([]);

onMounted(() => {
    fetchImageList();
    fetchTimer = setInterval(fetchImageList, interval);
});

onBeforeUnmount(() => {
    if (fetchTimer) {
        clearInterval(fetchTimer);
    }
});

async function fetchImageList() {
    try {
        const url = "http://localhost:8000/api/images/";
        const response = await fetch(url);
        const data = await response.json();

        const urls = data.map((item) => { return { id: item.id, url: `${url}${item.id}?t=${Date.now()}` } });
        // 配列をシャッフルする関数(一時的なもの)
        urls.sort(() => Math.random() - 0.5);

        let newImagelist: { id: number; url: string }[] = [];
        for (let i = 0; i < props.num_tiles; i++) {
            newImagelist.push({
                id: i,
                url: urls[i % urls.length].url
            });
        }
        imageList.value = newImagelist;
    } catch (error) {
        console.error('Failed to fetch image list:', error);
    }
};
</script>

<template>
    <MasonryWall :items="imageList" :ssr-columns="1"  :gap="16">
        <template #default="{ item }">
            <Tile :child_id="item.id" :resource_url="item.url" class="tile-item" />
        </template>
    </MasonryWall>
</template> -->