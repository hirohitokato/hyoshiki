// src/hooks/useFetchContent.ts
import { useCallback, useEffect, useState } from "react";

interface ContentData {
  id: string;
  date_time: number;
  media_type: string;
  value?: string; // data URL (例: data:image/jpeg;base64,...)
  isImage: boolean;
  description?: string; // 画像以外の場合の説明文など
}

export function useFetchContent(url: string) {
  const [data, setData] = useState<ContentData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(url);
      const json = await response.json();

      // サーバーから返されるJSONのmedia_typeが"image"の場合はBASE64からData URLを生成
      if (json.media_type === "image") {
        const value = `data:${json.mime_type};base64,${json.data}`;
        setData({
          id: json.id,
          date_time: json.date_time,
          media_type: json.media_type,
          value,
          isImage: true,
          description: json.description ?? "",
        });
      } else {
        // 画像以外の場合はdescriptionなどをそのまま利用（必要に応じて変更してください）
        setData({
          id: json.id,
          date_time: json.date_time,
          media_type: json.media_type,
          isImage: true,
          description: json.description ?? "",
        });
      }
    } catch (_err) {
      setError("Failed to fetch data");
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error };
}
