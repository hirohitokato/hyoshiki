<script setup lang="ts">
import { ref, watch, onMounted, defineEmits } from 'vue';
import { marked } from 'marked';

type Props = {
    child_id: number;
    resource_url: string;
}
const props = defineProps<Props>();

// 親コンポーネント(Tiles.vue)へ「画像が読み込まれた」ことを通知する
const emit = defineEmits(['imageLoaded']);

/** タイルが持つコンテンツデータ */
type ContentData = {
    value: string;
    isImage: boolean;
    key: number;
};

/** 古いコンテンツ(フェードアウト対象) */
const oldContent = ref<ContentData | null>(null);
/** 新しいコンテンツ(フェードイン対象) */
const newContent = ref<ContentData>({
    value: '',
    isImage: false,
    key: 0,
});

/** 古い画像URLの一時退避(メモリ解放用) */
let oldImageToFree: string | null = null;

marked.setOptions({
    gfm: true,
    breaks: true
});

/** props.resource_url が変わったら再度fetch */
watch(() => props.resource_url, async (newUrl) => {
    await fetchData(newUrl);
});

/** 初回マウント時にfetch */
onMounted(async () => {
    await fetchData(props.resource_url);
});

/** サーバーからデータを取得して newContent を更新 */
async function fetchData(url: string) {
    try {
        const response = await fetch(url);
        const data = await response.json();

        const isImage = data.media_type === 'image';
        const value = isImage
            ? `data:${data.mime_type};base64,${data.data}`
            : marked(data.description ?? '');

        // すでに newContent があれば oldContent に退避(クロスフェード用)
        if (newContent.value.value) {
            oldContent.value = { ...newContent.value };
        }
        // 新しいコンテンツをセット
        newContent.value = {
            value,
            isImage,
            key: Date.now(),
        };

        // 画像以外なら @load イベントが無いので即フェードアウト開始
        if (!isImage) {
            startFadeOutOldContent();
        }

    } catch (error) {
        console.error('Fetch error in Tile:', error);
    }
}

/** 画像読み込み完了時: Masonryへ再レイアウトを通知 + クロスフェード開始 */
function onImageLoad(e: Event) {
    emit('imageLoaded');
    startFadeOutOldContent();
}

/** 古いコンテンツをクロスフェード終了後に破棄 */
function onOldContentLeave() {
    if (oldImageToFree) {
        URL.revokeObjectURL(oldImageToFree);
        oldImageToFree = null;
    }
}

/** 古いコンテンツのフェードアウトを開始する */
function startFadeOutOldContent() {
    if (oldContent.value) {
        if (oldContent.value.isImage) {
            oldImageToFree = oldContent.value.value;
        }
        oldContent.value = null; // -> <transition> leave開始
    }
}
</script>

<template>
    <div class="tile-container">
        <!-- 新コンテンツ(通常フロー) -->
        <transition name="crossfade">
            <div class="content" :key="'new-' + newContent.key">
                <img v-if="newContent.isImage" :src="newContent.value" alt="new image" class="content-image"
                    @load="onImageLoad" />
                <div v-else class="content-text" v-html="newContent.value"></div>
            </div>
        </transition>

        <!-- 古いコンテンツ(absoluteで重ねる) -->
        <transition name="crossfade" @after-leave="onOldContentLeave">
            <div v-if="oldContent" class="content old-content" :key="'old-' + oldContent.key">
                <img v-if="oldContent.isImage" :src="oldContent.value" alt="old image" class="content-image" />
                <div v-else class="content-text" v-html="oldContent.value"></div>
            </div>
        </transition>
    </div>
</template>

<style scoped>
.tile-container {
    position: relative;
    width: 100%;
    /* 新コンテンツが高さを確保し、Masonryに正しく伝わる */
}

.content {
    position: relative;
    width: 100%;
    /* 画像の場合: 幅100% & height:auto で可変 */
}

.old-content {
    /* 古いコンテンツだけabsoluteで重ねる */
    position: absolute;
    top: 0;
    left: 0;
}

/* 画像を幅100%で表示 */
.content-image {
    width: 100%;
    height: auto;
    object-fit: contain;
}

/* テキストなど */
.content-text {
    font-size: 1.5rem;
}

/* クロスフェード(フェードイン・アウト) */
.crossfade-enter-active,
.crossfade-leave-active {
    transition: opacity 1s;
}

.crossfade-enter-from,
.crossfade-leave-to {
    opacity: 0;
}
</style>
