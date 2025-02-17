import { useEffect, useRef, useState } from "react";

// マウントされたコンポーネントの、親要素のサイズを取得するカスタムフック
export function useParentSize() {
    const [size, setSize] = useState({ width: 0, height: 0 });
    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const node = divRef.current;
        if (!node) return;

        // サイズを更新する関数
        const updateSize = () => {
            const rect = node.getBoundingClientRect();
            setSize({ width: rect.width, height: rect.height });
        };

        // 初回計測
        updateSize();

        // ResizeObserver を利用した自動再計測
        // https://developer.mozilla.org/ja/docs/Web/API/ResizeObserver
        const observer = new ResizeObserver(() => {
            updateSize();
        });
        observer.observe(node);

        // クリーンアップ処理
        return () => {
            observer.disconnect();
        };
    }, []); // 必要に応じて依存関係を追加

    return { size, setSize, ref: divRef };
}
