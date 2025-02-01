import { useState, useEffect, useCallback } from "react";

interface ContentData {
  value: string;
  isImage: boolean;
}

export function useFetchContent(url: string) {
  const [data, setData] = useState<ContentData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(url);
      const json = await response.json();

      const isImage = json.media_type === "image";
      const value = isImage
        ? `data:${json.mime_type};base64,${json.data}`
        : json.description ?? "";

      setData({ value, isImage });
    } catch (err) {
      setError("Failed to fetch data");
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error };
}
