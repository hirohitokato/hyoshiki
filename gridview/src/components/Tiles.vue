<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import masonry from "vue-next-masonry";
import Tile from "./Tile.vue";

const props = defineProps({
    columns: { type: Number, default: 5 },
    num_tiles: { type: Number, default: 8 },
});

// 画像一覧(タイル数ぶん)
const imageList = ref<{ id: number; url: string }[]>([])

// 一定間隔で画像リストを再取得するタイマー
let fetchTimer: number | undefined
const interval = 5000

onMounted(() => {
    fetchImageList()
    fetchTimer = setInterval(fetchImageList, interval)
})

onBeforeUnmount(() => {
    if (fetchTimer) {
        clearInterval(fetchTimer)
    }
})

async function fetchImageList() {
    try {
        // サンプル用: ダミーAPIのURL
        const url = "http://localhost:8000/api/images/"
        const response = await fetch(url)
        const data = await response.json()

        // 取得したリストから URL を組み立て
        const urls = data.map((item: any) => {
            return {
                id: item.id,
                url: `${url}${item.id}?t=${Date.now()}`, // キャッシュバスト
            }
        })

        // ランダムにシャッフル
        urls.sort(() => Math.random() - 0.5)

        // num_tilesぶん作成
        const newImagelist: { id: number; url: string }[] = []
        for (let i = 0; i < props.num_tiles; i++) {
            newImagelist.push({
                id: i,
                url: urls[i % urls.length].url,
            })
        }
        imageList.value = newImagelist

    } catch (error) {
        console.error("Failed to fetch image list:", error)
    }
}

// 子(Tile)コンポーネントから画像読み込み通知を受け取り → レイアウト更新
function onImageLoaded() {
    if (masonry.value) {
        masonry.value.layout() // Masonry の再配置を実行
    }
}

// layoutCompleteイベントが必要なら定義（任意）
function onLayoutComplete() {
    // console.log("Masonry layout done.")
}
</script>

<template>
    <!-- cols/gutterなどを指定。itemsも渡しているが、slotスコープから item を取り出す形で使用 -->
    <masonry ref="masonry" :items="imageList" :cols="columns" :gutter="16" @layoutComplete="onLayoutComplete">
        <!-- slotスコープの { item } を使い、Tile を配置 -->
        <template #default="{ item }">
            <!-- Tile.vue -->
            <Tile :child_id="item.id" :resource_url="item.url" @imageLoaded="onImageLoaded" />
        </template>
    </masonry>
</template>

<style scoped>
/* 必要に応じて調整 */
</style>
