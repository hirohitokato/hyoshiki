// src/components/Tile.tsx
import React, { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageListContext } from '../context/ImageListContext';
import { useFetchContent } from '../hooks/useFetchContent';
import { useQueryParam } from '../hooks/useQueryParam';

interface TileProps {
  id: number;
}

const Tile: React.FC<TileProps> = ({ id }) => {
  // Context から各 Tile に対応する API URL（JSON を返すエンドポイント）を取得
  const imageList = useContext(ImageListContext);
  // 初期状態は Context 内の該当 URL を currentUrl に保持
  const [currentUrl, setCurrentUrl] = useState<string>(imageList[id]);

  // Context の該当 URL が変化した場合のみ currentUrl を更新
  useEffect(() => {
    if (imageList[id] !== currentUrl) {
      setCurrentUrl(imageList[id]);
    }
  }, [imageList, id, currentUrl]);

  // currentUrl に対して JSON を fetch し、BASE64 の画像データから Data URL を生成
  const { data, error } = useFetchContent(currentUrl);
  // クエリパラメータ transition_duration（ms 単位）を取得（デフォルトは 500ms）
  const transitionDuration = useQueryParam<number>('transition_duration', 500);

  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>Loading...</div>;

  return (
    // motion.div でラップし、layout アニメーションを有効にする
    <div className="tile" style={{ position: 'relative' }}>
      <AnimatePresence mode="wait">
        <motion.img
          className='tile_image'
          key={currentUrl}
          src={data.value}
          alt={`tile-${id}`}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: transitionDuration / 1000, ease: "easeInOut" }}
        />
      </AnimatePresence>
    </div>
  );
};

export default React.memo(Tile);
