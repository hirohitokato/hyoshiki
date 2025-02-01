// src/components/Tile.tsx
import React, { useContext, useState, useEffect } from 'react';
import TinyCrossfade from 'react-tiny-crossfade';
import { ImageListContext } from '../context/ImageListContext';
import { useFetchContent } from '../hooks/useFetchContent';
import { useQueryParam } from '../hooks/useQueryParam';

interface TileProps {
  id: number;
}

const Tile: React.FC<TileProps> = ({ id }) => {
  // Context により、各 Tile に対応する API URL（JSON を返すエンドポイント）を取得
  const imageList = useContext(ImageListContext);
  // 初期状態は Context 内の該当 URL を currentUrl に保持する
  const [currentUrl, setCurrentUrl] = useState<string>(imageList[id]);

  // Context の該当 URL が変化した場合のみ currentUrl を更新
  useEffect(() => {
    if (imageList[id] !== currentUrl) {
      setCurrentUrl(imageList[id]);
    }
  }, [imageList, id, currentUrl]);

  // currentUrl に対して JSON を fetch し、BASE64 の画像データから Data URL を生成
  const { data, error } = useFetchContent(currentUrl);

  // index.html のクエリパラメータ transition_duration を取得（単位は ms）
  const transitionDuration = useQueryParam<number>('transition_duration', 500);

  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>Loading...</div>;

  return (
    // ここでラッパー div に CSS transition を指定することで、
    // 画像の切り替えに伴うサイズや位置の変化がスムーズにアニメーションします
    <div style={{ transition: `all ${transitionDuration}ms ease` }}>
      <TinyCrossfade duration={1}>
        <img
          key={currentUrl}
          src={data.value}
          alt={`tile-${id}`}
          style={{ width: '100%', height: 'auto' }}
        />
      </TinyCrossfade>
    </div>
  );
};

export default Tile;
// export default React.memo(Tile);
