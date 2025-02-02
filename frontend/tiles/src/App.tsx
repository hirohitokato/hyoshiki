// src/App.tsx
import React, { useState, useEffect } from 'react';
import Tiles from './components/Tiles';
import { useFetchImageList } from './hooks/useFetchImageList';
import { ImageListContext } from './context/ImageListContext';

interface AppProps {
  tileCount: number;
  columns: number;
}

const API_URL = "http://localhost:8000/api/images/"; // API のエンドポイント

const App: React.FC<AppProps> = ({ tileCount, columns }) => {
  // サーバーからは十分な件数（例：50件）の画像一覧を取得する
  const { imageList: fetchedList, error } = useFetchImageList(API_URL, 50);
  // タイル用画像配列（固定長＝tileCount）を管理する状態
  const [tileImages, setTileImages] = useState<string[]>([]);

  // 初回：fetchedList が取得できたら、tileCount 件だけランダムに選んで初期化する
  useEffect(() => {
    if (fetchedList.length > 0 && tileImages.length === 0) {
      const newTileImages: string[] = [];
      for (let i = 0; i < tileCount; i++) {
        const randomItem = fetchedList[Math.floor(Math.random() * fetchedList.length)];
        // キャッシュバストのため、現在時刻をクエリパラメータとして付与
        const baseUrl = randomItem.url.split('?')[0];
        newTileImages.push(`${baseUrl}?t=${Date.now()}`);
      }
      setTileImages(newTileImages);
    }
  }, [fetchedList, tileCount, tileImages.length]);

  // 3～6秒ごとに、tileImages の中の１要素だけをランダムに更新する
  useEffect(() => {
    // tileImages の初期化前や fetchedList 未取得の場合は何もしない
    if (tileImages.length !== tileCount || fetchedList.length === 0) return;

    const updateRandomTile = () => {
      const randomIndex = Math.floor(Math.random() * tileCount);
      const randomItem = fetchedList[Math.floor(Math.random() * fetchedList.length)];
      const baseUrl = randomItem.url.split('?')[0];
      setTileImages(prev => {
        const newTileImages = [...prev];
        newTileImages[randomIndex] = `${baseUrl}?t=${Date.now()}`;
        return newTileImages;
      });
    };

    // 次の更新までの遅延を 3000～6000 ミリ秒の間でランダムに決定
    const delay = 1000 + Math.random() * 300;
    const timer = setTimeout(() => {
      updateRandomTile();
    }, delay);

    return () => clearTimeout(timer);
  }, [tileImages, tileCount, fetchedList]);

  if (error) return <div>Error: {error}</div>;
  if (tileImages.length !== tileCount) return <div>Loading...</div>;

  return (
    <ImageListContext.Provider value={tileImages}>
      <Tiles tileCount={tileCount} columns={columns} />
    </ImageListContext.Provider>
  );
};

export default App;
