import { useCallback, useEffect, useState } from "react";

interface ImageItem {
    id: number;
    url: string;
}

export function useFetchImageList(apiUrl: string, numItems: number, intervalMs: number = 5000) {
    const [imageList, setImageList] = useState<ImageItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchImageList = useCallback(async () => {
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const urls = data.map((item: any) => ({
                id: item.id,
                url: `${apiUrl}${item.id}?t=${Date.now()}`, // キャッシュバスト
            }));

            urls.sort(() => Math.random() - 0.5); // シャッフル処理

            setImageList(urls.slice(0, numItems));
        } catch (_err) {
            setError("Failed to fetch image list");
        }
    }, [apiUrl, numItems]);

    useEffect(() => {
        fetchImageList();
        const timer = window.setInterval(fetchImageList, intervalMs);

        return () => clearInterval(timer);
    }, [fetchImageList, intervalMs]);

    return { imageList, error };
}
