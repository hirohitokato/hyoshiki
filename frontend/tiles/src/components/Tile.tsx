import React, { useState, useEffect } from "react";
import TinyCrossfade from "react-tiny-crossfade";
import { useFetchContent } from "../hooks/useFetchContent";

interface TileProps {
  resource_url: string;
  onImageLoaded?: () => void;
}

const Tile: React.FC<TileProps> = ({ resource_url, onImageLoaded }) => {
  const { data, error } = useFetchContent(resource_url);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);

  useEffect(() => {
    if (data?.isImage && data.value) {
      // 新しい画像URLの場合のみ状態を更新してクロスフェードを発生させる
      if (data.value !== currentSrc) {
        setCurrentSrc(data.value);
        onImageLoaded?.();
      }
    }
  }, [data, onImageLoaded, currentSrc]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <TinyCrossfade className="tile" duration={1}>
      {currentSrc ? (
        <img
          key={currentSrc}
          src={currentSrc}
          alt="content"
          style={{ width: "100%", height: "auto" }}
        />
      ) : (
        <div
          key="placeholder"
          style={{
            backgroundColor: "#eee",
            width: "100%",
            height: "100%"
          }}
        />
      )}
    </TinyCrossfade>
  );
};

export default Tile;
