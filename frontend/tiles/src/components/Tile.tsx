import React, { useEffect } from "react";
import TinyCrossfade from "react-tiny-crossfade";
import { useFetchContent } from "../hooks/useFetchContent";

interface TileProps {
  resource_url: string;
  onImageLoaded?: () => void;
}

const Tile: React.FC<TileProps> = ({ resource_url, onImageLoaded }) => {
  const { data, error } = useFetchContent(resource_url);

  useEffect(() => {
    if (data?.isImage) {
      onImageLoaded?.();
    }
  }, [data, onImageLoaded]);

  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>Loading...</div>;

  console.log("rendered Tile");
  return (
    <TinyCrossfade className="tile" duration={1}>
      <img src={data.value}
        alt="content"
        key={resource_url}
        style={{  }} />
    </TinyCrossfade>
  );
};

export default Tile;
