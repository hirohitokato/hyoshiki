<template>
    <div class="crossfade-container">
        <!-- 古いコンテンツ -->
        <transition name="crossfade" @after-leave="onOldContentLeave">
            <div v-if="oldContent" class="content" :key="'old-' + oldContent.key">
                <!-- 画像 / テキスト 切り替え表示 -->
                <img v-if="oldContent.isImage" :src="oldContent.value" alt="previous image" class="content-image" />
                <p v-else>{{ oldContent.value }}</p>
            </div>
        </transition>

        <!-- 新しいコンテンツ -->
        <transition name="crossfade">
            <div class="content" :key="'new-' + newContent.key">
                <!-- 画像 / テキスト 切り替え表示 -->
                <img v-if="newContent.isImage" :src="newContent.value" alt="new image" class="content-image"
                    @load="onImageLoad(newContent.value)" />
                <p v-else>{{ newContent.value }}</p>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

// 親コンポーネントから row, column を受け取る
interface Props {
    row: number;
    column: number;
}
const props = defineProps<Props>();

interface ContentData {
    value: string;   // 画像URL or テキスト
    isImage: boolean;
    key: number;     // 再描画トリガー
}

const oldContent = ref<ContentData | null>(null);
const newContent = ref<ContentData>({
    value: '',
    isImage: false,
    key: 0,
});
let oldImageToFree: string | null = null;

let fetchTimer: number | undefined;

// データ取得
const fetchData = async () => {
    try {
        const url = `http://localhost:8080/api/images/random?row=${props.row}&column=${props.column}`;
        const response = await fetch(url);
        const blob = await response.blob();

        const isImage = blob.type.startsWith('image/');
        const value = isImage ? URL.createObjectURL(blob) : await blob.text();

        // 今までの newContent を oldContent に退避（サーバーは画像のみ想定なら毎回コピーでもOK）
        if (newContent.value.value) {
            oldContent.value = { ...newContent.value };
        }

        // 新しいデータをセット
        newContent.value = {
            value,
            isImage,
            key: Date.now(),
        };
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

const scheduleNextFetch = () => {
    const interval = (10 + (Math.random() - 0.5) * 10) * 1000; // 5000〜15000ms
    fetchTimer = window.setTimeout(async () => {
        await fetchData();
        scheduleNextFetch();
    }, interval);
};

onMounted(() => {
    fetchData().then(scheduleNextFetch);
});

onBeforeUnmount(() => {
    if (fetchTimer) {
        clearTimeout(fetchTimer);
    }
});

// 新しい画像が読み込まれたら、古い画像をフェードアウトさせる
const onImageLoad = (url: string) => {
    if (oldContent.value) {
        console.log('New image loaded. Start fading out the old image...');
        if (oldContent.value.isImage) {
            oldImageToFree = oldContent.value.value;
        }
        oldContent.value = null; // これで古い画像が leave へ
    }
};

// 古い画像が leave 完了したら呼ばれる
const onOldContentLeave = () => {
    // フェードアウトし終わったタイミングで古い Blob URL を解放
    // oldContent はすでに null なので、削除対象URLは一時保管したほうが安全
    // しかし今回のコードではとりあえず直前まで持っていた値を参照するか、
    // もしくは oldContent をローカル変数に保存しておく等の工夫もアリ
    if (oldImageToFree) {
        URL.revokeObjectURL(oldImageToFree);
        console.log('oldContent leave completed. Freed old Blob URL.');
    }
};
</script>

<style scoped>
.crossfade-container {
    position: relative;
    width: 400px;
    height: 300px;
    overflow: hidden;
}

.content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.content-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
}

.crossfade-enter-active {
    transition: opacity 2s;
    /* フェードイン: 2秒 */
}

.crossfade-leave-active {
    transition: opacity 1s;
    /* フェードアウト: 1秒 */
}

.crossfade-enter-from,
.crossfade-leave-to {
    opacity: 0;
}
</style>
