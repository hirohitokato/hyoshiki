/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";

export function useParentSize() {
    const [height, setHeight] = useState<number | null>(null);
    const [width, setWidth] = useState<number | null>(null);
    const divRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const node = divRef.current;
        if (!node) return;

        // サイズを更新する関数
        const updateSize = () => {
            const rect = node.getBoundingClientRect();
            setHeight(rect.height);
            setWidth(rect.width);
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

    return { width, height, ref: divRef };
}
