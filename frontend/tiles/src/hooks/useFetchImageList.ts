// src/hooks/useFetchImageList.ts
import { useCallback, useEffect, useState } from "react";

interface ImageItem {
    id: number;
    url: string;
}

export function useFetchImageList(apiUrl: string, numItems: number) {
    const [imageList, setImageList] = useState<ImageItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchImageList = useCallback(async () => {
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            // API から得たデータを ImageItem 型に変換
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const urls: ImageItem[] = data.map((item: any) => ({
                id: item.id,
                url: `${apiUrl}${item.id}`, // キャッシュバスト用のパラメータは App.tsx で付与
            }));

            // ランダムな順序にシャッフルしてから、必要な件数（numItems）を切り出す
            urls.sort(() => Math.random() - 0.5);
            setImageList(urls.slice(0, numItems));
        } catch (err) {
            setError("Failed to fetch image list");
        }
    }, [apiUrl, numItems]);

    useEffect(() => {
        fetchImageList();
    }, [fetchImageList]);

    return { imageList, error };
}
