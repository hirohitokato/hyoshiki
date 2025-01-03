<template>
    <!-- 2つのtransitionを並べ、クロスフェードが起きるようにする -->
    <div class="crossfade-container">
        <!-- 古いコンテンツを表示するブロック -->
        <transition name="crossfade" @after-leave="onOldContentLeave">
            <div v-if="oldContent" class="content" :key="'old-' + oldContent.key">
                <!-- 画像 / テキスト 切り替え表示 -->
                <img v-if="oldContent.isImage" :src="oldContent.value" alt="previous image" />
                <p v-else>
                    {{ oldContent.value }}
                </p>
            </div>
        </transition>

        <!-- 新しいコンテンツを表示するブロック -->
        <transition name="crossfade">
            <div class="content" :key="'new-' + newContent.key">
                <img v-if="newContent.isImage" :src="newContent.value" alt="new image" />
                <p v-else>
                    {{ newContent.value }}
                </p>
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

// 1つのコンテンツを表すインターフェース
interface ContentData {
    value: string;   // テキスト or 画像URL
    isImage: boolean;
    key: number;     // 表示切り替え用のユニークID
}

// 古いコンテンツと新しいコンテンツを用意
const oldContent = ref<ContentData | null>(null);
const newContent = ref<ContentData>({
    value: '',
    isImage: false,
    key: 0,
});

// タイマーを保持
let fetchTimer: number | undefined;

// サーバーからデータを取得する
const fetchData = async () => {
    try {
        // 同一サーバーから取得する想定。URL例: /api?row=..., column=...
        const url = `http://localhost:8080/api/images/random?row=${props.row}&column=${props.column}`;
        const response = await fetch(url);
        const blob = await response.blob();

        // 画像 or テキスト 判定
        let isImage = false;
        let value = '';
        if (blob.type.startsWith('image/')) {
            isImage = true;
            value = URL.createObjectURL(blob);
        } else {
            value = await blob.text();
        }

        // ① oldContent に newContent の内容をコピー（もし古いコンテンツがあればフェードアウトして削除）
        if (newContent.value) {
            oldContent.value = {
                value: newContent.value.value,
                isImage: newContent.value.isImage,
                key: newContent.value.key,
            };
        }

        // ② newContent を最新データに更新（フェードイン）
        newContent.value = {
            value,
            isImage,
            key: newContent.value.key + 1, // keyをインクリメントして再描画をトリガー
        };
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

// (10 ± 5) 秒ごとに実行をスケジュール
const scheduleNextFetch = () => {
    const interval = 10000 + (Math.random() - 0.5) * 10000; // 5000〜15000ms
    fetchTimer = window.setTimeout(async () => {
        await fetchData();
        scheduleNextFetch();
    }, interval);
};

// マウント時に最初のデータ取得 & スケジュール開始
onMounted(() => {
    fetchData().then(() => {
        scheduleNextFetch();
    });
});

// アンマウント時にタイマー停止
onBeforeUnmount(() => {
    if (fetchTimer) {
        clearTimeout(fetchTimer);
    }
});

// 古いコンテンツのフェードアウトが終わったらDOMから削除する
const onOldContentLeave = () => {
    oldContent.value = null;
};
</script>

<style scoped>
.crossfade-container {
    position: relative;
    width: 400px;
    /* 適宜 */
    height: 300px;
    /* 適宜 */
    overflow: hidden;
}

/* 2つのコンテンツを重ねて表示するため絶対配置 */
.content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

/* クロスフェードアニメーション */
.crossfade-enter-active,
.crossfade-leave-active {
    transition: opacity 2s;
}

/* 初期状態(enter-from)・終了状態(leave-to)を透過 */
.crossfade-enter-from,
.crossfade-leave-to {
    opacity: 0;
}
</style>