import { useEffect, useRef, useState, } from 'react';
import './App.css'
import Tiles, { TilesRef } from './components/Tiles';

const API_URL = "http://localhost:8000/api/images/"; // API のエンドポイント
const tileCount = 30; // 表示する画像の数

interface ImageItem {
  id: number;
  url: string;
}

async function fetchImageList(apiUrl: string, numItems: number)
  : Promise<{ imageList: ImageItem[], error: string | null }> {
  let imageList: ImageItem[] = [];
  let error: string | null = null;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    // API から得たデータを ImageItem 型に変換
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const urls: ImageItem[] = data.map((item: any) => ({
      id: item.id,
      url: `${apiUrl}${item.id}`,
    }));

    // ランダムな順序にシャッフルしてから、必要な件数（numItems）を切り出す
    urls.sort(() => Math.random() - 0.5);
    imageList = urls.slice(0, numItems);
  } catch (_err) {
    error = "Failed to fetch image list";
  }

  return { imageList, error };
}

function App() {
  console.log("App rendered");
  const tilesRef = useRef<(TilesRef | null)>(null);
  const timer = useRef(0);

  // タイル用画像配列（固定長＝tileCount）を管理。個数は tileCount で指定
  const [imageUrls, setImageUrls] = useState<string[]>([]);//(() => Array(tileCount).fill(""));

  // マウント時に画像リストを取得し、タイル用画像配列を初期化
  useEffect(() => {
    fetchImageList(API_URL, tileCount)
      .then(({ imageList: imageItemList, error }) => {
        if (error) {
          console.error(error);
          return;
        }
        const newTileImages: string[] = [];
        for (let i = 0; i < tileCount; i++) {
          const randomItem = imageItemList[Math.floor(Math.random() * imageItemList.length)];
          newTileImages.push(`${randomItem.url}?t=${Date.now()}`);
        }
        setImageUrls(newTileImages);

        // 次の更新までの遅延を 3000～6000 ミリ秒の間でランダムに決定
        const delay = 1000 + Math.random() * 3000;
        timer.current = setTimeout(updateRandomTile, delay);

        return () => {
          console.log("clearTimeout");
          if (timer) { clearTimeout(timer.current); }
        };
      });
  }, []);

  const updateRandomTile = () => {
    const randomIndex = Math.floor(Math.random() * tileCount);
    const url = imageUrls[Math.floor(Math.random() * imageUrls.length)];

    setImageUrls(prev => {
      const newUrls = [...prev];
      newUrls[randomIndex] = url;
      return newUrls;
    });

    tilesRef.current?.update();
    // 次の更新までの遅延を 3000～6000 ミリ秒の間でランダムに決定
    const delay = 1000 + Math.random() * 3000;
    timer.current = setTimeout(updateRandomTile, delay);
  }

  return (
    <>
      <h1>みんなの美術館</h1>
      <Tiles ref={tilesRef}
        style={{ width: "80vw", height: "600px" }}
        columns={5}
        tileUrls={imageUrls}
        tileGap={20}>
      </Tiles>
    </>
  )
}

export default App;
