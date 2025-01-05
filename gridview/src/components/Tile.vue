<template>
    <div class="crossfade-container">
        <!-- 古いコンテンツ（フェードアウト用） -->
        <transition name="crossfade" @after-leave="onOldContentLeave">
            <div v-if="oldContent" class="content" :key="'old-' + oldContent.key">
                <!-- 画像 / テキスト 切り替え表示 -->
                <img v-if="oldContent.isImage" :src="oldContent.value" alt="previous image" class="content-image" />
                <p v-else>{{ oldContent.value }}</p>
            </div>
        </transition>

        <!-- 新しいコンテンツ（フェードイン用） -->
        <transition name="crossfade">
            <div class="content" :key="'new-' + newContent.key">
                <img v-if="newContent.isImage" :src="newContent.value" alt="new image" class="content-image"
                    @load="onImageLoad" />
                <p v-else>{{ newContent.value }}</p>
            </div>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

// Props: 親コンポーネントから row, column を受け取る想定
interface Props {
    row: number;
    column: number;
}
const props = defineProps<Props>();

/**
 * コンテンツ情報
 * - value: 画像URL or テキスト
 * - isImage: value が画像URLかどうか
 * - key: 再描画トリガー
 */
interface ContentData {
    value: string;
    isImage: boolean;
    key: number;
}

/** 古いコンテンツ（フェードアウト対象） */
const oldContent = ref<ContentData | null>(null);
/** 新しいコンテンツ（フェードイン対象） */
const newContent = ref<ContentData>({
    value: '',
    isImage: false,
    key: 0,
});

/**
 * フェードアウト後に解放すべき画像URLを一時保存する。
 * oldContent.value を null にした後は参照が失われるため、
 * leave トランジション完了時にここから revoke する。
 */
let oldImageToFree: string | null = null;

/** 次回フェッチのタイマーID */
let fetchTimer: number | undefined;

/** サーバーからランダムに画像 or テキストを取得し、oldContent と newContent を更新する。 */
const fetchData = async () => {
    try {
        const url = `http://localhost:8080/api/text/random?row=${props.row}&column=${props.column}`;
        const response = await fetch(url);
        const blob = await response.blob();

        const isImage = blob.type.startsWith('image/');
        const value = isImage
            ? URL.createObjectURL(blob) // 画像用の一時URLを生成
            : await blob.text();       // テキストを文字列で取得

        // まず、今までの newContent を oldContent に退避する
        // → これで古いコンテンツが「フェードアウト用コンポーネント」として表示される
        if (newContent.value.value) {
            oldContent.value = { ...newContent.value };
        }

        // つづいて新しいコンテンツをセット
        newContent.value = {
            value,
            isImage,
            key: Date.now(), // key を更新して再描画をトリガー
        };

        // 画像でなければ onLoad イベントが存在しないので、即座に古いコンテンツをフェードアウト開始
        // (テキストはすでに取得済みなので、表示可能)
        if (!isImage) {
            startFadeOutOldContent();
        }

    } catch (error) {
        console.error('Fetch error:', error);
    }
};

/** (10 ± 5) 秒ごとに自動フェッチをスケジュールする */
const scheduleNextFetch = () => {
    const interval = (10 + (Math.random() - 0.5) * 10) * 1000; // 5,000〜15,000 ms
    fetchTimer = window.setTimeout(async () => {
        await fetchData();
        scheduleNextFetch();
    }, interval);
};

/** コンポーネントがマウントされたとき、まず初回のデータを取得し、その後、自動フェッチをスケジューリングする。 */
onMounted(() => {
    fetchData().then(() => {
        scheduleNextFetch();
    });
});

/** コンポーネントがアンマウントされるとき、タイマーを停止 */
onBeforeUnmount(() => {
    if (fetchTimer) {
        clearTimeout(fetchTimer);
    }
});

/** 新しい画像が読み込まれたとき、古いコンテンツをフェードアウト開始する（画像のロード待ちのため） */
const onImageLoad = () => {
    startFadeOutOldContent();
};

/**
 * 古いコンテンツをフェードアウト開始する。
 * - oldContent の実体があるなら、その画像URLを `oldImageToFree` に退避
 * - oldContent.value = null にすることで `<transition>` の leave を発火
 */
function startFadeOutOldContent() {
    if (oldContent.value) {
        if (oldContent.value.isImage) {
            // 画像なら後で解放するため URL を保存
            oldImageToFree = oldContent.value.value;
        }
        // leave トランジション発火 → @after-leave="onOldContentLeave"
        oldContent.value = null;
    }
}

/**
 * 古いコンテンツのフェードアウトが完了したら呼ばれるフック
 * - Blob URL を解放し、メモリをリークさせないようにする
 */
const onOldContentLeave = () => {
    if (oldImageToFree) {
        URL.revokeObjectURL(oldImageToFree);
        oldImageToFree = null;
        console.log('Freed old Blob URL on leave.');
    }
};
</script>

<style scoped>
.crossfade-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

/* 画像の場合はアスペクト比を維持しつつ見切れないようにする */
.content-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
}

/* クロスフェードアニメーション */
.crossfade-enter-active {
    /* フェードイン: 2秒 */
    transition: opacity 2s;
}

.crossfade-leave-active {
    /* フェードアウト: 1秒 */
    transition: opacity 1s;
}

.crossfade-enter-from,
.crossfade-leave-to {
    opacity: 0;
}
</style>